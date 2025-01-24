FROM denoland/deno:2.1.7

WORKDIR /app
COPY . .

CMD ["run", "--allow-net", "--allow-env", "--unstable-kv", "main.ts"]