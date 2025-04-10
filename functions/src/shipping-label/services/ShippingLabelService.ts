import { inject, injectable } from 'inversify';
import { IShippingLabelService } from './IShippingLabelService.js';
import { IPdfGenerator } from '../../pdf/IPdfGenerator.js';
import { IHtmlRenderer } from '../../utils/HtmlRenderer.js';
import { ILogger } from '../../utils/Logger.js';
import pathModule from 'path';
import fsModule from 'fs/promises';
import { TYPES } from '../../constants/types.js';

export interface IPathModule {
    join(...paths: string[]): string;
    resolve(...paths: string[]): string;
}

export interface IFileSystem {
    readFile(path: string): Promise<Buffer>;
}

type SupportedLanguage = 'en' | 'nl';

@injectable()
export class ShippingLabelService implements IShippingLabelService {
    private readonly translations = {
        en: {
            title: 'Return Label',
            recipient: 'Recipient',
            order_label: 'Order Number',
            name_label: 'Name',
            return_address_label: 'Return Address',
            postage_required: 'POSTAGE REQUIRED',
            paste_label: 'Please paste this address label on the outside of the box.',
            put_inside: 'Please put this part inside the box on top of your products, so we can identify your return parcel upon arrival.'
        },
        nl: {
            title: 'Retourlabel',
            recipient: 'Ontvanger',
            order_label: 'Bestelnummer',
            name_label: 'Naam',
            return_address_label: 'Retouradres',
            postage_required: 'FRANKERING NOODZAKELIJK',
            paste_label: 'Plak dit adreslabel op de buitenkant van de doos.',
            put_inside: 'Leg dit deel in de doos bovenop uw producten, zodat we uw retourzending bij aankomst kunnen identificeren.'
        }
    };

    private path: IPathModule;
    private fs: IFileSystem;

    constructor(
        @inject(TYPES.PdfGenerator) private pdfGenerator: IPdfGenerator,
        @inject(TYPES.HtmlRenderer) private htmlRenderer: IHtmlRenderer,
        @inject(TYPES.Logger) private logger: ILogger,
        path?: IPathModule,
        fs?: IFileSystem
    ) {
        this.path = path || pathModule;
        this.fs = fs || fsModule;
    }

    /**
     * Generates a shipping label PDF
     * @param data Shipping label data including return address and order information
     * @returns Promise that resolves to a Buffer containing the PDF
     */
    async generateLabel(data: {
        return_address: {
            company: string;
            address: string;
            zip_code: string;
            city: string;
            country: string;
        };
        order: string;
        name: string;
        language: string;
    }): Promise<Buffer> {

        const rootDir = process.env.ASSETS_PATH || this.path.resolve(process.cwd(), '..', 'assets');
        const templatePath = this.path.join(rootDir, 'labelTemplate.html');
        const logoPath = this.path.join(rootDir, 'code-logo.png');


        this.logger.info('Generating shipping label', {
            rootDirectory: rootDir,
            templatePath: templatePath,
            logoPath: logoPath
        });


        let logoSrc = '';
        try {
            const logoFile = await this.fs.readFile(logoPath);
            const logoBase64 = logoFile.toString('base64');
            logoSrc = `data:image/png;base64,${logoBase64}`;
        } catch (error) {
            this.logger.error('Error reading logo file', { error });

            logoSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
        }


        const language = (this.isValidLanguage(data.language) ? data.language : 'en') as SupportedLanguage;
        const langPack = this.translations[language];


        const templateData = {
            company: data.return_address.company,
            address: data.return_address.address,
            zip_code: data.return_address.zip_code,
            city: data.return_address.city,
            country: data.return_address.country,
            order: data.order,
            name: data.name,
            language: data.language,
            ...langPack,
            logoSrc
        };


        this.logger.info('Rendering template', {
            language,
            order: data.order,
            company: data.return_address.company
        });

        const html = await this.htmlRenderer.render(templatePath, templateData);
        return this.pdfGenerator.generatePdf(html);
    }

    /**
     * Checks if the given language is supported
     * @param lang Language to check
     * @returns True if the language is supported, false otherwise
     */
    private isValidLanguage(lang: string): boolean {
        return lang === 'en' || lang === 'nl';
    }
} 