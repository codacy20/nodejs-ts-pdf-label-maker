/**
 * Interface for shipping label generation service
 */
export interface IShippingLabelService {
    /**
     * Generates a shipping label PDF
     * @param data Shipping label data including return address and order information
     * @returns Promise that resolves to a Buffer containing the PDF
     */
    generateLabel(data: {
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
    }): Promise<Buffer>;
} 