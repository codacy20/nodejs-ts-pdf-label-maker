import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShippingLabelService, IPathModule, IFileSystem } from '../../../src/shipping-label/services/ShippingLabelService.js';
import { IPdfGenerator } from '../../../src/pdf/IPdfGenerator.js';
import { IHtmlRenderer } from '../../../src/utils/HtmlRenderer.js';
import { ILogger } from '../../../src/utils/Logger.js';
import { Buffer } from 'buffer';

const mockPath: IPathModule = {
    join: vi.fn((...args: string[]) => args.join('/')),
    resolve: vi.fn((...args: string[]) => args.join('/'))
};

const mockFs: IFileSystem = {
    readFile: vi.fn()
};

describe('ShippingLabelService', () => {
    let shippingLabelService: ShippingLabelService;
    let mockPdfGenerator: IPdfGenerator;
    let mockHtmlRenderer: IHtmlRenderer;
    let mockLogger: ILogger;

    beforeEach(() => {
        vi.resetAllMocks();

        vi.stubEnv('ASSETS_PATH', '/mock/assets/path');

        mockPdfGenerator = {
            generatePdf: vi.fn().mockResolvedValue(Buffer.from('mock-pdf-content'))
        };

        mockHtmlRenderer = {
            render: vi.fn().mockResolvedValue('<html>Rendered Template</html>')
        };

        mockLogger = {
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn()
        };

        vi.mocked(mockFs.readFile).mockResolvedValue(Buffer.from('mock-logo-content'));

        shippingLabelService = new ShippingLabelService(
            mockPdfGenerator,
            mockHtmlRenderer,
            mockLogger,
            mockPath,
            mockFs
        );
    });

    it('should generate a shipping label with English translations', async () => {
        const labelData = {
            return_address: {
                company: 'Test Company',
                address: '123 Test Street',
                zip_code: '12345',
                city: 'Test City',
                country: 'Test Country'
            },
            order: 'ORD123',
            name: 'John Doe',
            language: 'en'
        };

        const result = await shippingLabelService.generateLabel(labelData);

        expect(mockLogger.info).toHaveBeenCalledWith('Generating shipping label', expect.any(Object));
        expect(mockHtmlRenderer.render).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                title: 'Return Label',
                order: 'ORD123',
                name: 'John Doe'
            })
        );
        expect(mockPdfGenerator.generatePdf).toHaveBeenCalledWith('<html>Rendered Template</html>');
        expect(result).toEqual(Buffer.from('mock-pdf-content'));
    });

    it('should use Dutch translations when language is set to nl', async () => {
        const labelData = {
            return_address: {
                company: 'Test Company',
                address: '123 Test Street',
                zip_code: '12345',
                city: 'Test City',
                country: 'Test Country'
            },
            order: 'ORD123',
            name: 'John Doe',
            language: 'nl'
        };

        await shippingLabelService.generateLabel(labelData);

        expect(mockHtmlRenderer.render).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                title: 'Retourlabel',
                recipient: 'Ontvanger'
            })
        );
    });

    it('should fall back to English for unsupported languages', async () => {
        const labelData = {
            return_address: {
                company: 'Test Company',
                address: '123 Test Street',
                zip_code: '12345',
                city: 'Test City',
                country: 'Test Country'
            },
            order: 'ORD123',
            name: 'John Doe',
            language: 'fr'
        };

        await shippingLabelService.generateLabel(labelData);

        expect(mockHtmlRenderer.render).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                title: 'Return Label'
            })
        );
    });

    it('should handle logo file read errors gracefully', async () => {
        vi.mocked(mockFs.readFile).mockRejectedValue(new Error('File not found'));

        const labelData = {
            return_address: {
                company: 'Test Company',
                address: '123 Test Street',
                zip_code: '12345',
                city: 'Test City',
                country: 'Test Country'
            },
            order: 'ORD123',
            name: 'John Doe',
            language: 'en'
        };

        await shippingLabelService.generateLabel(labelData);

        expect(mockLogger.error).toHaveBeenCalledWith('Error reading logo file', expect.any(Object));
        expect(mockHtmlRenderer.render).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                logoSrc: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
            })
        );
    });

    it('should use correct paths for template and logo files', async () => {
        const labelData = {
            return_address: {
                company: 'Test Company',
                address: '123 Test Street',
                zip_code: '12345',
                city: 'Test City',
                country: 'Test Country'
            },
            order: 'ORD123',
            name: 'John Doe',
            language: 'en'
        };

        await shippingLabelService.generateLabel(labelData);

        expect(mockPath.join).toHaveBeenCalledWith('/mock/assets/path', 'labelTemplate.html');
        expect(mockPath.join).toHaveBeenCalledWith('/mock/assets/path', 'code-logo.png');
        expect(mockHtmlRenderer.render).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                logoSrc: expect.any(String),
                title: 'Return Label'
            })
        );
        expect(mockLogger.info).toHaveBeenCalledWith(
            'Generating shipping label',
            expect.objectContaining({
                rootDirectory: expect.any(String),
                templatePath: expect.any(String),
                logoPath: expect.any(String)
            })
        );
    });

    it('should pass the rendered HTML to the PDF generator', async () => {
        const labelData = {
            return_address: {
                company: 'Test Company',
                address: '123 Test Street',
                zip_code: '12345',
                city: 'Test City',
                country: 'Test Country'
            },
            order: 'ORD123',
            name: 'John Doe',
            language: 'en'
        };

        const customHtml = '<html>Custom Template HTML</html>';
        mockHtmlRenderer.render = vi.fn().mockResolvedValue(customHtml);

        const result = await shippingLabelService.generateLabel(labelData);

        expect(mockHtmlRenderer.render).toHaveBeenCalled();
        expect(mockPdfGenerator.generatePdf).toHaveBeenCalledWith(customHtml);
        expect(result).toEqual(Buffer.from('mock-pdf-content'));
    });
}); 