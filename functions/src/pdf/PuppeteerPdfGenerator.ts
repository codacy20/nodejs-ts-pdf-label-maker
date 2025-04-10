import { inject, injectable } from 'inversify';
import { IPdfGenerator } from './IPdfGenerator.js';
import { ILogger } from '../utils/Logger.js';
import { TYPES } from '../constants/types.js';
import puppeteer from 'puppeteer';

@injectable()
export class PuppeteerPdfGenerator implements IPdfGenerator {
    constructor(
        @inject(TYPES.Logger) private logger: ILogger
    ) { }

    /**
     * Generates a PDF from HTML content using Puppeteer
     * @param html The HTML content to convert to PDF
     * @returns Promise that resolves to a Buffer containing the PDF
     */
    async generatePdf(html: string): Promise<Buffer> {
        this.logger.info('Starting PDF generation');
        const startTime = Date.now();

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        try {
            const page = await browser.newPage();
            await page.setContent(html, {
                waitUntil: 'networkidle0'
            });

            this.logger.info('Content loaded, generating PDF');

            const pdf = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20px',
                    right: '20px',
                    bottom: '20px',
                    left: '20px'
                }
            });

            const duration = Date.now() - startTime;
            this.logger.info('PDF generation completed', {
                durationMs: duration,
                sizeBytes: pdf.length
            });

            return Buffer.from(pdf);
        } catch (error) {
            this.logger.error('Error generating PDF', { error });
            throw error;
        } finally {
            await browser.close();
        }
    }
} 