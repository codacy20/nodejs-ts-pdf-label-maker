/**
 * Interface for PDF generation service
 */
export interface IPdfGenerator {
    /**
     * Generates a PDF from HTML content
     * @param html The HTML content to convert to PDF
     * @returns Promise that resolves to a Buffer containing the PDF
     */
    generatePdf(html: string): Promise<Buffer>;
} 