#!/bin/sh
# https://github.com/fly-apps/redis/blob/main/start-redis-server.sh

set -e

sysctl vm.overcommit_memory=1 || true

# Set defaults
: ${FLY_VM_MEMORY_MB:=512}
: ${MAXMEMORY:=$(($FLY_VM_MEMORY_MB*90/100))}  # 90% of available memory
: ${MAXMEMORY_POLICY:="noeviction"}
: ${APPENDONLY:="yes"}
: ${SAVE:="3600 1 300 100 60 10000"}

PW_ARG=""
if [[ ! -z "${REDIS_PASSWORD}" ]]; then
  PW_ARG="--requirepass $REDIS_PASSWORD"
fi

redis-server $PW_ARG \
  --dir /data/ \
  --maxmemory "${MAXMEMORY}mb" \
  --maxmemory-policy $MAXMEMORY_POLICY \
  --appendonly $APPENDONLY \
  --save "$SAVE"