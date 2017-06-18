const pgp = require('pg-promise')();
const fs = require('fs');
const path = require('path');

if (!fs.existsSync('config.js')) {
    throw new Error(`The configuration file does not exist. Refer to the README.`);
}

const {connection} = require('./config').dbConn;
const conn = pgp(connection);

console.log('Setting up database');

const setupSQL = fs.readFileSync(path.resolve('sql', 'setup.sql'), {encoding: 'utf-8'});

conn.none(setupSQL)
.then( () => console.log('Finished setting up the database') )
.then( pgp.end )
.catch( err => console.error('An error occured:', err) );
