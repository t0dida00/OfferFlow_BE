import { Request, Response } from 'express';
import { generatePdfFromHtml } from '../services/pdf.service';

export const generatePdf = async (req: Request, res: Response) => {
    try {
        const { html, filename } = req.body;

        if (!html) {
            return res.status(400).json({ error: 'HTML content is required' });
        }

        const pdfBuffer = await generatePdfFromHtml(html);

        const downloadName = filename ? `${filename}.pdf` : 'document.pdf';

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${downloadName}"`
        );

        res.send(pdfBuffer);
    } catch (error: any) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
};