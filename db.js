const pgp = require('pg-promise')();
const fs = require('fs');
const path = require('path');

if (!fs.existsSync('config.js')) {
    throw new Error(`The configuration file does not exist. Refer to the README.`);
}

const {connection} = require('./config').dbConn;
const conn = pgp(connection);

module.exports = {
    flames: {

        /**
         * Creates a new flame.
         *
         * @param  {type} name    Name of the user the flame is for (optional)
         * @param  {type} content description
         * @return {type}         description
         */
        create(name, content) {
            return db.none(`
                INSERT INTO flames(user_id, content)
                VALUES ((SELECT id FROM users WHERE name = $1), $3)
            `, [name, content]);
        },

        delete(content) {
            return db.any(`
                SELECT *
                FROM flames f
                    INNER JOIN users u ON f.user_id = u.id
                WHERE content = $1
            `, [content])
            .then(data => {
                const msg = data.map(flame => {
                    if (flame.user_id)
                        return `Deleted flame "${flame.content}" for user [${flame.name}]`;

                    return `Deleted flame ${flame.content}`;
                })
                .join('\n');


                return db.none(`
                    DELETE FROM flames WHERE content = $1;
                `)
                .then( () => msg );
            })
        },

        get(id = null) {

        }
    },

    stats: {
        create() {

        },

        get() {

        }
    }
};
