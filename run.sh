#!/usr/bin/env sh

set -eu
deno run --env-file=.env --allow-net --allow-env --unstable-kv --unstable-temporal main.ts