#!/bin/bash
set -euo pipefail

docker-compose up -d api web postgres
sleep 3
docker-compose run initdb

# Optional step if permission for that folder is causing annoyance
#sudo chmod -R 755 postgres_volume/var/lib/postgresql/data

