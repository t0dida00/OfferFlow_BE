import { google, gmail_v1 } from 'googleapis';

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

            return {
                id: msg.id,
                snippet: detail.data.snippet,
                subject,
                from,
                date,
            };
        });

        const emails = await Promise.all(emailPromises);
        return emails.filter((email: any) => email !== null);

    } catch (error) {
        console.error('Error fetching Gmail emails:', error);
        throw new Error('Failed to fetch emails from Gmail');
    }
};
