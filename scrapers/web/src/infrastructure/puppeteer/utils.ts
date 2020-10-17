import * as puppeteer from 'puppeteer';

import { PuppeteerConfig } from '../../config/entities';


export const puppeteerBrowserFromConfig = async(config: PuppeteerConfig): Promise<puppeteer.Browser> => {
    return await puppeteer.connect(
        {
            browserWSEndpoint: config.browserEndpointWS,
            ignoreHTTPSErrors: config.ignoreHTTPSErrors,
            defaultViewport: {
                width:              config.viewport.width,
                height:             config.viewport.height,
                isLandscape:        config.viewport.isLandscape,
                deviceScaleFactor:  config.viewport.deviceScaleFactor,
            }
        }
    )
}
