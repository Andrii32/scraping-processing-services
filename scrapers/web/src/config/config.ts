import * as env from 'env-var';

import * as config from './models';


export const getConfig = (): config.Config => {
    return {
        serviceName: env.get('DB_SERVICE_NAME').required().asString(),
        scraperConfig: {
            concurrency:            env.get('CONCURRENCY').required().asIntPositive(),
            consumerPoolDelay:      env.get('CONSUMER_POOL_DELAY').default(10).asIntPositive() * 1000,  // in miliseconds
            downloadTimeout:        env.get('DOWNLOAD_TIMEOUT').required().asIntPositive() * 1000,      // in miliseconds
            commitDelay:            env.get('COMMIT_DELAY').default(3).asIntPositive() * 1000,          // in miliseconds
            screenshotSettings: {
                type:               env.get('SCREENSHOTS_TYPE').default('png').asEnum(['png', 'jpeg']),
                encoding:           env.get('SCREENSHOTS_ENCODING').default('binary').asEnum(["binary", "base64"]),
                fullPage:           env.get('SCREENSHOTS_FULLPAGE').default('false').asBoolStrict(),
            }
        },
        puppeteerConfig: {
            browserEndpointWS:      env.get('BROWSER_ENDPOINT_WS').required().asString(),
            ignoreHTTPSErrors:      true,
            viewport: {
                width:              1920,
                height:             1080,
                isLandscape:        true,
                deviceScaleFactor:  1,
            }
        },
        kafkaProducerConfig:{
            bootstrapServers:   env.get('KAFKA_BOOTSTRAP_SERVERS').required().asString(),
            topic:              env.get('KAFKA_PRODUCER_TOPIC').required().asString()
        },
        kafkaConsumerConfig:{
            bootstrapServers:   env.get('KAFKA_BOOTSTRAP_SERVERS').required().asString(),
            topic:              env.get('KAFKA_CONSUMER_TOPIC').required().asString(),
            groupId:            env.get('KAFKA_CONSUMER_GROUP_ID').required().asString()
        },
        minIOConfig: {
            url:                env.get('MINIO_URL').required().asString(),
            accessKey:          env.get('MINIO_SERVER_ACCESS_KEY').required().asString(),
            secretKey:          env.get('MINIO_SERVER_SECRET_KEY').required().asString(),
            bucketDownloaded:   env.get('MINIO_BUCKET_NAME').required().asString(),
            bucketScreenshot:   env.get('MINIO_BUCKET_NAME_SCREENSHOTS').required().asString()
        },
        postgresConfig: {
            host:               env.get('DB_HOST').required().asString(),
            port:               env.get('DB_PORT').required().asPortNumber(),
            name:               env.get('DB_NAME').required().asString(),
            user:               env.get('DB_USER').required().asString(),
            pass:               env.get('DB_PASS').required().asString()
        }
    }
}
