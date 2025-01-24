# GodzillaZ bot

Bot che notifica su un canale telegram che il miglior canale di twitch e` online.

## Funzionalita`

Quando il [canale Twitch specificato](./main.ts) e` online, il bot inviera` un messaggio sul gruppo Telegram e provera` a pinnarlo. Se ha i permessi di pinnarlo, il bot si premurera` di rimuovere il messaggio pinnato dai pin a fine della live.

## Todo
* Implementare con WebHooks invece che via polling / utilizzare le API di Twitch invece di fare http GET request
* Migliore gestione del database (atomicita` o mutex o boh)
* Piu` funzionalita`

## Installazione

* Clona questa repository
* Builda il Docker container:
```bash
docker build . -t godzillaz-bot:latest
```
* Crea un file `.env` contenente le seguenti variabili:
```bash
TG_T0K3N='YOUR TELEGRAM TOKEN'
TG_CH4T_1D='12345'
```
* Avvia il bot nel container:
```bash
docker run --env-file .env -it --rm godzillaz-bot
```
