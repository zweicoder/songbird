#!/bin/bash
set -euo pipefail

DC=/usr/local/bin/docker-compose
$DC up -d api web postgres
sleep 3
$DC run initdb

# Optional step if permission for that folder is causing annoyance
# sudo chmod -R 755 postgres_volume/var/lib/postgresql/data

