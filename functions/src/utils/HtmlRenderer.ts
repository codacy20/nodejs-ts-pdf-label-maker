import { injectable } from 'inversify';
import fs from 'fs/promises';

/**
 * Interface for HTML template rendering service
 */
export interface IHtmlRenderer {
    /**
     * Renders an HTML template with the provided data
     * @param templatePath Path to the HTML template file
     * @param data Object containing the data to inject into the template
     * @returns Promise that resolves to the rendered HTML string
     */
    render(templatePath: string, data: Record<string, any>): Promise<string>;
}

@injectable()
export class HtmlRenderer implements IHtmlRenderer {
    /**
     * Renders an HTML template with the provided data
     * @param templatePath Path to the HTML template file
     * @param data Object containing the data to inject into the template
     * @returns Promise that resolves to the rendered HTML string
     */
    async render(templatePath: string, data: Record<string, any>): Promise<string> {
        try {
            const template = await fs.readFile(templatePath, 'utf-8');
            return this.replacePlaceholders(template, data);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to render template: ${errorMessage}`);
        }
    }

    /**
     * Replaces placeholders in the template with actual values
     * @param template The HTML template string
     * @param data Object containing the data to inject
     * @returns The rendered HTML string
     */
    private replacePlaceholders(template: string, data: Record<string, any>): string {
        return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match: string, key: string) => {
            try {
                const value = key.split('.').reduce((obj: any, k: string) => {
                    return obj && typeof obj === 'object' ? obj[k] : undefined;
                }, data);

                return value !== undefined ? String(value) : match;
            } catch (error) {
                console.error(`Error replacing placeholder ${key}:`, error);
                return match;
            }
        });
    }
} 