import { Container } from 'inversify';
import { TYPES } from '../constants/types.js';
import { IShippingLabelService } from '../shipping-label/services/IShippingLabelService.js';
import { ShippingLabelService } from '../shipping-label/services/ShippingLabelService.js';
import { IPdfGenerator } from '../pdf/IPdfGenerator.js';
import { PuppeteerPdfGenerator } from '../pdf/PuppeteerPdfGenerator.js';
import { IHtmlRenderer, HtmlRenderer } from '../utils/HtmlRenderer.js';
import { ShippingLabelController } from '../shipping-label/controller/ShippingLabelController.js';
import { HealthController } from '../health/controller/HealthController.js';
import { ILogger, Logger } from '../utils/Logger.js';
import { RequestLogger } from '../utils/RequestLogger.js';

const container = new Container();

container.bind<IShippingLabelService>(TYPES.ShippingLabelService).to(ShippingLabelService);
container.bind<IPdfGenerator>(TYPES.PdfGenerator).to(PuppeteerPdfGenerator);
container.bind<IHtmlRenderer>(TYPES.HtmlRenderer).to(HtmlRenderer);
container.bind<ILogger>(TYPES.Logger).to(Logger);
container.bind<RequestLogger>(TYPES.RequestLogger).to(RequestLogger);

container.bind<ShippingLabelController>(TYPES.ShippingLabelController).to(ShippingLabelController);
container.bind<HealthController>(TYPES.HealthController).to(HealthController);

export { container }; 