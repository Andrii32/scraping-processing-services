
# Scrapers

> Puppeteer based web scrapers

## Technologies

 - [Puppeteer](https://github.com/puppeteer/puppeteer)
 - [Browserless](https://docs.browserless.io/docs/docker-quickstart.html) chrome docker [image](https://hub.docker.com/r/browserless/chrome/)
 - [Minio](https://min.io/) objects storage
 - Postgres
 - Kafka

## Overview

Consumes message from kafka with url.\
Downloads url.\
Saves downloaded content to minio.\
Produces message with minio bucket, key into kafka.

### Error handling

There are 2 types of errors which are handled differently.
 - **Expected browser errors.** Will be saved to MinIO as valid output.
    - `TOO_MANY_REDIRECTS`
    - `NAME_NOT_RESOLVED`
 - **Unexpected browser errors.** All browser errors (excepts critical) which were not checked explicitly. Will be saved to postgres with kafka message content.


### Logging

Logs are in json format by default

## Other

### KAFKA Commit manager
Custom commit manager was implemented to be sure no messages will be lost on service shutdown. \
Refferences:
 - [Managing Consumer Commits and Back-pressure With Node.js and Kafka in Production](https://medium.com/walkme-engineering/managing-consumer-commits-and-back-pressure-with-node-js-and-kafka-in-production-cfd20c8120e3)
 - [HenselPhelps/node-rdkafka-commit-manager](https://github.com/HenselPhelps/node-rdkafka-commit-manager#readme)

### KAFKA Custom partitioning
Partitioning is based on `murmur2` algorithm and use `hostId` input message field,
to have urls related to one host in one partition.


