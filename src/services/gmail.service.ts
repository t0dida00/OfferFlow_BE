import { google, gmail_v1 } from 'googleapis';

const getBody = (payload: any): string => {
    if (!payload) return '';
    if (payload.body && payload.body.data) {
        return Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }
    if (payload.parts) {
        for (const part of payload.parts) {
            if (part.mimeType === 'text/html') {
                return getBody(part);
            }
        }
        // Fallback to text/plain if no HTML found
        for (const part of payload.parts) {
            if (part.mimeType === 'text/plain') {
                return getBody(part);
            }
        }
    }
    return '';
};

const cleanContent = (html: string): string => {
    // 1. Extract body content
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    let content = bodyMatch ? bodyMatch[1] : html;

    // 2. Remove scripts and styles
    content = content.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gmi, "");
    content = content.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gmi, "");

    // 3. Remove all HTML tags
    content = content.replace(/<\/?[^>]+(>|$)/g, " ");

    // 4. Decode HTML entities (basic)
    content = content.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

    // 5. Normalize whitespace (remove newlines, trim multiple spaces)
    return content.replace(/\s+/g, ' ').trim();
};

export const fetchRecentEmails = async (accessToken: string, limit: number = 10) => {
    try {
        console.log('Fetching recent emails...');
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        const gmail = google.gmail({ version: 'v1', auth });

        // List messages
        const response = await gmail.users.messages.list({
            userId: 'me',
            maxResults: limit,
            q: "category:primary"
        });

        const messages = response.data.messages || [];

        if (messages.length === 0) {
            return [];
        }
        // Fetch details for each message
        const emailPromises = messages.map(async (msg: gmail_v1.Schema$Message) => {
            if (!msg.id) return null;

            const detail = await gmail.users.messages.get({
                userId: 'me',
                id: msg.id,
                format: 'full',
            });

            const payload = detail.data.payload;
            const headers = payload?.headers || [];

            const subject = headers.find((h: gmail_v1.Schema$MessagePartHeader) => h.name === 'Subject')?.value || 'No Subject';
            const from = headers.find((h: gmail_v1.Schema$MessagePartHeader) => h.name === 'From')?.value || 'Unknown Sender';
            const date = headers.find((h: gmail_v1.Schema$MessagePartHeader) => h.name === 'Date')?.value || '';

            const rawBody = getBody(payload);
            const content = cleanContent(rawBody);

            return {
                id: msg.id,
                snippet: detail.data.snippet,
                subject,
                from,
                date,
                content
            };
        });

        const emails = await Promise.all(emailPromises);
        return emails.filter((email: any) => email !== null);

    } catch (error) {
        console.error('Error fetching Gmail emails:', error);
        throw new Error('Failed to fetch emails from Gmail');
    }
};
