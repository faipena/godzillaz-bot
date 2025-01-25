FROM denoland/deno:2.1.7

WORKDIR /app
COPY src ./src
COPY deno.json main.ts ./

USER deno:deno

CMD ["run", "--allow-net", "--allow-env", "--unstable-kv", "--unstable-temporal", "main.ts"]