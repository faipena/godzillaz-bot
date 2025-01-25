# GodzillaZ bot

Bot che notifica su un canale telegram che il miglior canale di twitch è online.

## Funzionalità

Quando il [canale Twitch specificato](./main.ts) è online, il bot invierà un
messaggio sul gruppo Telegram e proverà a pinnarlo. Se ha i permessi di
pinnarlo, il bot si premurerà di rimuovere il messaggio pinnato dai pin a fine
della live.

## Todo

- Implementare con WebHooks invece che via polling / utilizzare le API di Twitch
  invece di fare http GET request
- Migliore gestione del database (atomicità o mutex o boh)
- Piu' funzionalita'

## Installazione

- Clona questa repository
- Builda il Docker container:

```bash
docker build . -t godzillaz-bot:latest
```

- Crea un file `.env` contenente le seguenti variabili:

```bash
TG_T0K3N=YOUR TELEGRAM TOKEN
TG_CH4T_1D=12345
TW_CL13NT_1D=YOUR TWITCH CLIENT ID
TW_CL13NT_S3CR3T=YOUR TWITCH CLIENT SECRET
```

- Avvia il bot nel container:

```bash
docker run --env-file .env -it --rm godzillaz-bot
```
