# 1337

# About

This bot was intentionally meant to keep track of us making certain posts at a certain time on telegram. Any custom commands can however be added and this can be expanded.
This bot is not meant for anything large-scale as it caches a big part of the database internally to avoid sending too many database requests. The cache is persisted in the database so that the bot can load it again if it's restarted and no data is lost.

# Setup

## Dependencies
Install them.
```
npm install
```

## Update your configuration file
Copy `config.js.template` to `config.js` and fill out your data. The `dbConn` object is ready to use for knex, however, the `dbConn.connection` is relevant for `pg-promise`. The token is the token you receive from @BotFather on Telegram.

## Set up the database
_Create the database and a role with password and login permission. Make sure you use the credentials you used in the configuration. Also give the ownership to that role._

```sql
CREATE DATABASE telegramstuff;
CREATE ROLE telegrambot WITH PASSWORD 'password' LOGIN;
ALTER DATABASE telegramstuff OWNER TO telegrambot;
```

## Set up the tables

_Either connect to the database and execute the `setup.sql` script or run `node setup.js` in the root folder which will connect to the database and do the same._
