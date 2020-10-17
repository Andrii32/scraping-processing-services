CREATE USER handler
  WITH CREATEDB ENCRYPTED PASSWORD 'default';

CREATE DATABASE handled
  WITH OWNER = handler
       ENCODING = 'UTF8'
       CONNECTION LIMIT = -1;

-- CONNECT TO DATABASE
\c handled

-- SET ROLE
SET ROLE handler;

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

--------------OUTPUTS--------------
CREATE TABLE IF NOT EXISTS outputs(
    id                      UUID        NOT NULL,
    service_id              SMALLINT    NOT NULL REFERENCES services(id),
    output                  BYTEA       NOT NULL,
    hash                    TEXT        NOT NULL,
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY(service_id, id, hash)
) PARTITION BY LIST(service_id);


CREATE OR REPLACE FUNCTION create_outputs_partition() RETURNS trigger AS
$BODY$
BEGIN
    EXECUTE FORMAT(
        'CREATE TABLE IF NOT EXISTS outputs_%1$s PARTITION OF outputs FOR VALUES IN (%2$s);',
        NEW.name, NEW.id
    );
    RAISE NOTICE 'outputs_% PARTITION is created for service %', NEW.name, NEW.name;
    RETURN NULL;
END;
$BODY$
LANGUAGE 'plpgsql';

-- INSERT TRIGGER TO CREATE NEW PARTITION WHEN SERVICE IS CREATED
CREATE TRIGGER service_created
  AFTER INSERT
  ON services
  FOR EACH ROW
  EXECUTE PROCEDURE create_outputs_partition();
--------------OUTPUTS--------------
