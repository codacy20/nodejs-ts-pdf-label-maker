import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShippingLabelService, IPathModule, IFileSystem } from '../../../src/shipping-label/services/ShippingLabelService.js';
import { IPdfGenerator } from '../../../src/pdf/IPdfGenerator.js';
import { IHtmlRenderer } from '../../../src/utils/HtmlRenderer.js';
import { ILogger } from '../../../src/utils/Logger.js';
import { Buffer } from 'buffer';

// Create mock implementations using the interfaces
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
        // Reset mocks
        vi.resetAllMocks();

        // Mock environment variable
        vi.stubEnv('ASSETS_PATH', '/mock/assets/path');

        // Setup mocks
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

        // Setup mock for readFile
        vi.mocked(mockFs.readFile).mockResolvedValue(Buffer.from('mock-logo-content'));

        // Create service instance with injected mocks
        shippingLabelService = new ShippingLabelService(
            mockPdfGenerator,
            mockHtmlRenderer,
            mockLogger,
            mockPath,
            mockFs
        );
    });

    it('should generate a shipping label with English translations', async () => {
        // Arrange
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

        // Act
        const result = await shippingLabelService.generateLabel(labelData);

        // Assert
        expect(mockLogger.info).toHaveBeenCalledWith('Generating shipping label', expect.any(Object));
        expect(mockHtmlRenderer.render).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                title: 'Return Label', // English translation
                order: 'ORD123',
                name: 'John Doe'
            })
        );
        expect(mockPdfGenerator.generatePdf).toHaveBeenCalledWith('<html>Rendered Template</html>');
        expect(result).toEqual(Buffer.from('mock-pdf-content'));
    });

    it('should use Dutch translations when language is set to nl', async () => {
        // Arrange
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

        // Act
        await shippingLabelService.generateLabel(labelData);

        // Assert
        expect(mockHtmlRenderer.render).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                title: 'Retourlabel', // Dutch translation
                recipient: 'Ontvanger'
            })
        );
    });

    it('should fall back to English for unsupported languages', async () => {
        // Arrange
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
            language: 'fr' // Unsupported language
        };

        // Act
        await shippingLabelService.generateLabel(labelData);

        // Assert
        expect(mockHtmlRenderer.render).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                title: 'Return Label' // Falls back to English
            })
        );
    });

    it('should handle logo file read errors gracefully', async () => {
        // Arrange
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

        // Act
        await shippingLabelService.generateLabel(labelData);

        // Assert
        expect(mockLogger.error).toHaveBeenCalledWith('Error reading logo file', expect.any(Object));
        expect(mockHtmlRenderer.render).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                logoSrc: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
            })
        );
    });

    it('should use correct paths for template and logo files', async () => {
        // Arrange
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

        // Act
        await shippingLabelService.generateLabel(labelData);

        // Assert
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
        // Arrange
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

        // Setup a specific response for HTML renderer
        const customHtml = '<html>Custom Template HTML</html>';
        mockHtmlRenderer.render = vi.fn().mockResolvedValue(customHtml);

        // Act
        const result = await shippingLabelService.generateLabel(labelData);

        // Assert
        expect(mockHtmlRenderer.render).toHaveBeenCalled();
        expect(mockPdfGenerator.generatePdf).toHaveBeenCalledWith(customHtml);
        expect(result).toEqual(Buffer.from('mock-pdf-content'));
    });
}); 