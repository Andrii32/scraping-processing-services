#!/bin/bash

RETRIES=10
until pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER || [ $RETRIES -eq 0 ]; do
  echo "Waiting for postgres server, $((RETRIES--)) remaining attempts..."
  sleep 2
done

>&2 echo "Postgres is up"