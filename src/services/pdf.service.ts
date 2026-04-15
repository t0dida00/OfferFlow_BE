import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export const generatePdfFromHtml = async (html: string) => {
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true, // 👈 fix
  });

  try {
    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
};