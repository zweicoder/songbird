#!/bin/bash
set -euo pipefail

docker-compose up -d api web postgres
