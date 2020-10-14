
import * as puppeteer from 'puppeteer';
import {DateTime} from 'luxon';

import {Downloaded, Failure} from '../../domain/models/downloaded';
import {DownloaderService} from '../../domain/services/downloaderService';


export interface ScreenshotSettings {
    type:        "png"    | "jpeg"
    encoding:    "binary" | "base64"
    fullPage:    boolean
}


export class PuppeteerDownloaderService implements DownloaderService{
    private readonly client:            puppeteer.Browser;
    private readonly downloadTimeout:   number;
    private readonly screenshotSetings: ScreenshotSettings;

    constructor(client: puppeteer.Browser, downloadTimeout: number, screenshotSettings: ScreenshotSettings) {
        this.client = client;
        this.downloadTimeout = downloadTimeout;
        this.screenshotSetings = screenshotSettings
    }

    async download(url: string, id: string): Promise<Downloaded>{
        return await this.client
            .newPage()
            .then(page => Promise.all([
                page.goto(url, { timeout: this.downloadTimeout, waitUntil: 'networkidle0' })
                    .then(response => {
                        if (response == null) { throw new Error("page response is null") } else { return response }
                    }),
                page.content(),
                page.metrics(),
                page.screenshot({type: this.screenshotSetings.type, encoding: this.screenshotSetings.encoding, fullPage: this.screenshotSetings.fullPage})
            ]))
            .then(
                values => {
                    const [response, content, metrics, screenshot] = values;
                    const downloaded: Downloaded = {
                        id: id,
                        timestamp: DateTime.utc().toISO({ includeOffset: true }),
                        input_url: url,
                        request_urls: response.request().redirectChain().map(request => request.response().url()),
                        response_url: response.url(),
                        status: {
                            code: response.status(),
                            text: response.statusText() ? response.statusText() : null
                        },
                        headers: JSON.stringify(response.headers()),
                        content: content,
                        remote_address: {
                            ip: response.remoteAddress()?.ip,
                            port: response.remoteAddress()?.port
                        },
                        certificate: {
                            subject: response.securityDetails()?.subjectName(),
                            issuer: response.securityDetails()?.issuer(),
                            valid_fr: response.securityDetails()?.validFrom(),
                            valid_to: response.securityDetails()?.validTo(),
                            protocol: response.securityDetails()?.protocol()
                        }
                    }
                    return downloaded
                }
            )
            .catch(error => {
                let failure: Failure
                if  (error.message.startsWith("net::ERR_TOO_MANY_REDIRECTS")) {
                    failure = { name: "TOO_MANY_REDIRECTS" }
                } else if
                    (error.message.startsWith("net::ERR_NAME_NOT_RESOLVED")) {
                    failure = { name: "NAME_NOT_RESOLVED" }
                } else {
                    throw error
                }
                const downloaded: Downloaded = {
                    id: id,
                    timestamp: DateTime.utc().toISO({ includeOffset: true }),
                    input_url: url,
                    failure: failure
                }
                return downloaded
            })
        }
    }
