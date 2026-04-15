import puppeteerCore from 'puppeteer-core';
import puppeteer from 'puppeteer';
import chromium from '@sparticuz/chromium';
import { env } from '../config/env';

export const generatePdfFromHtml = async (html: string) => {
  let browser;

  if (env.NODE_ENV === 'production') {
    browser = await puppeteerCore.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true, // Use boolean true for production
    });
  } else {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
    });
  }

  try {
    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
};