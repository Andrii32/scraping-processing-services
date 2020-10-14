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

CREATE TABLE IF NOT EXISTS failures(
    id                      BIGSERIAL PRIMARY KEY,
    service                 TEXT,
    failure_name            TEXT,
    failure_description     TEXT,
    message_failed_key      BYTEA,
    message_failed_value    BYTEA,
    message_topic           TEXT,
    message_partition       TEXT,
    message_offset          BIGINT,
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS failures_failure_name ON failures USING btree (failure_name);
CREATE INDEX IF NOT EXISTS failures_service ON failures USING btree (service);