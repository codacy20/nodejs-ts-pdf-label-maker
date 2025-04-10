import { inject } from 'inversify';
import { controller, httpPost } from 'inversify-express-utils';
import { Request, Response } from 'express';
import { IShippingLabelService } from '../services/IShippingLabelService.js';
import { TYPES } from '../../constants/types.js';

@controller('/get-label')
export class ShippingLabelController {
    constructor(
        @inject(TYPES.ShippingLabelService) private shippingLabelService: IShippingLabelService
    ) { }

    @httpPost('/')
    async generateLabel(req: Request, res: Response): Promise<void> {
        try {
            const pdf = await this.shippingLabelService.generateLabel(req.body);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=shipping-label.pdf');
            res.send(pdf);
        } catch (error) {
            res.status(500).json({
                error: 'Failed to generate shipping label',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
} 