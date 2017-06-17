# 1337

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
