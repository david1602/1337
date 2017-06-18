const pgp = require('pg-promise')();
const fs = require('fs');
const path = require('path');

if (!fs.existsSync('config.js')) {
    throw new Error(`The configuration file does not exist. Refer to the README.`);
}

const {connection} = require('./config').dbConn;
const db = pgp(connection);


/**
 * Function to preprocess flames, requires a JOIN on the users table
 */
const preprocessFlames = flame => `Flame: "${flame.content}" | Person: [${flame.user_id ? 'everyone' : flame.name}]`;

module.exports = {
    flames: {

        /**
         * Creates a new flame.
         *
         * @param  {type} name    Name of the user the flame is for (optional)
         * @param  {type} content Content of the flame
         * @return {undefined}
         */
        create(name, content) {
            return db.none(`
                INSERT INTO flames(user_id, content)
                VALUES ((SELECT id FROM users WHERE name = $1), $3)
            `, [name, content]);
        },

        /**
         * Deletes a given flame
         *
         * @param  {String} content Flame content to be deleted
         * @return {String}         Message for the bot to print which flames have been deleted for which users
         */
        delete(content) {
            return db.any(`
                SELECT *
                FROM flames f
                    INNER JOIN users u ON f.user_id = u.id
                WHERE content = $1
                ORDER BY name
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


        /**
         * Get all flames for one person or flames that apply to everone
         *
         * @param  {String} user = null Optional user to get flames for, if null
         *                              flames for every one will be fetched
         *
         * @return {String}             Message for the bot to print
         */
        get(user = null) {
            if (user === null)
                return db.any(`
                    SELECT *
                    FROM flames f
                        INNER JOIN users u ON f.user_id = u.id
                    ORDER BY content;
                `)
                .then(preprocessFlames);

            return db.any(`
                SELECT *
                FROM flames f
                    INNER JOIN users u ON f.user_id = u.id
                WHERE name = $1
                ORDER BY content;
            `, [user]);
        }


        /**
         * Returns all flames that are person specific and general
         *
         * @return {String}  Message for the bot to print
         */
        getAll() {
            return db.any(`
                SELECT *
                FROM flames f
                    INNER JOIN users u ON f.user_id = u.id
                ORDER BY name, content;
            `)
            .then(data => {
                return data.map(preprocessFlames);
            })
        }
    },

    stats: {
        create() {

        },

        get() {

        }
    }
};
