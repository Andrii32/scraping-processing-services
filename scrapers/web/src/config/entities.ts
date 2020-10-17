import { bool } from "aws-sdk/clients/signer"

export interface ScraperConfig {
    concurrency:        number
    consumerPoolDelay:  number
    downloadTimeout:    number
    commitDelay:        number
    screenshotSettings: ScreenshotSettingsConfig
};

export interface ScreenshotSettingsConfig{
    type:       'png'    | 'jpeg'
    encoding:   "binary" | "base64"
    fullPage:   boolean
}

export interface PuppeteerViewportConfig {
    width:              number,
    height:             number,
    isLandscape:        bool,
    deviceScaleFactor:  number,
};

export interface PuppeteerConfig {
    browserEndpointWS:  string
    ignoreHTTPSErrors:  bool
    viewport: PuppeteerViewportConfig
};

export interface KafkaProducerConfig {
    bootstrapServers:   string
    topic:              string
};

export interface KafkaConsumerConfig {
    bootstrapServers:   string
    topic:              string
    groupId:            string
};

export interface MinIOConfig {
    url:                string
    accessKey:          string
    secretKey:          string
    bucketDownloaded:   string
    bucketScreenshot?:  string
};

export interface PostgresConfig {
    host:               string
    port:               number
    name:               string
    user:               string
    pass:               string
};

export interface Config {
    serviceName:            string
    scraperConfig:          ScraperConfig
    puppeteerConfig:        PuppeteerConfig
    kafkaProducerConfig:    KafkaProducerConfig
    kafkaConsumerConfig:    KafkaConsumerConfig
    minIOConfig:            MinIOConfig
    postgresConfig:         PostgresConfig
};