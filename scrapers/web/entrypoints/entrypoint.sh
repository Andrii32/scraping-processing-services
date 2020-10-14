#!/bin/bash
set -e

postgres_wait.sh

exec "$@"