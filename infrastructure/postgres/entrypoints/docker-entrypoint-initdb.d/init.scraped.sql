CREATE USER scraper WITH
    ENCRYPTED PASSWORD 'default';

CREATE DATABASE scraped
  WITH OWNER = scraper
       ENCODING = 'UTF8'
       CONNECTION LIMIT = -1;

-- CONNECT TO DATABASE
\c scraped

-- SET ROLE
SET ROLE scraper;

--------------SERVICES--------------
CREATE TABLE services(
    id                     UUID         NOT NULL PRIMARY KEY,
    name                   TEXT         NOT NULL UNIQUE
);
CREATE INDEX IF NOT EXISTS services_name ON services USING btree (name);
--------------SERVICES--------------

--------------FAILURES--------------
CREATE TABLE IF NOT EXISTS failures(
    id                      UUID        NOT NULL PRIMARY KEY,
    service_id              UUID        NOT NULL REFERENCES services(id),
    failure_name            TEXT        NOT NULL,
    failure_description     TEXT        NOT NULL,
    message_failed_key      BYTEA       NOT NULL,
    message_failed_value    BYTEA       NOT NULL,
    message_topic           TEXT        NOT NULL,
    message_partition       TEXT        NOT NULL,
    message_offset          BIGINT      NOT NULL,
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS failures_failure_name ON failures USING btree (failure_name);
CREATE INDEX IF NOT EXISTS failures_service ON failures USING btree (service_id);
CREATE INDEX IF NOT EXISTS failures_created_at ON failures USING btree (created_at);
--------------FAILURES--------------