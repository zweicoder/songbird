#!/bin/bash
# [IMPORTANT] Because i'm lazy, this will have to be run from the project root so that ./scripts/* works
set -euo pipefail

./scripts/start_webserver.sh
./scripts/sync.sh
/usr/local/bin/docker-compose stop
