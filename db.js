const pgp = require('pg-promise')();
const fs = require('fs');
const path = require('path');
const moment = require('moment');

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
         * @return {Promise<undefined>}
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
         * @param  {String} content     Flame content to be deleted
         * @return {Promise<String>}    Message for the bot to print which flames have been deleted for which users
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
         * @return {Promise<String>}    Message for the bot to print
         */
        get(user = null) {
            if (user === null)
                return db.any(`
                    SELECT *
                    FROM flames f
                        INNER JOIN users u ON f.user_id = u.id
                    ORDER BY content;
                `)
                .then(data => data.map(preprocessFlames).join('\n'));

            return db.any(`
                SELECT *
                FROM flames f
                    INNER JOIN users u ON f.user_id = u.id
                WHERE name = $1
                ORDER BY content;
            `, [user])
            .then(data => data.map(preprocessFlames).join('\n'));
        }


        /**
         * Returns all flames that are person specific and general
         *
         * @return {Promise<String>}  Message for the bot to print
         */
        getAll() {
            return db.any(`
                SELECT *
                FROM flames f
                    INNER JOIN users u ON f.user_id = u.id
                ORDER BY name, content;
            `)
            .then(data => {
                return data.map(preprocessFlames).join('\n');
            })
        }
    },

    stats: {

        /**
         * Creates a new post in the database
         *
         * @param  {String} user     Name of the user to post
         * @param  {String} postdate description
         * @return {Promise<undefined>}
         */
        create(user, postdate) {
            return db.any(`
                WITH maxDates AS (
                  SELECT user_id, MAX(postdate) maxdate
                  FROM posts
                  GROUP BY 1
                )
                SELECT p.user_id, postdate, streak
                FROM posts p
                  INNER JOIN maxDates m ON p.user_id = m.user_id AND p.postdate = m.maxdate
                  INNER JOIN users u ON p.user_id = u.id
                WHERE name = $1
            `, [user])
            .then(records => {
                let streak = 1;

                if (records.length > 0 && moment(postdate).diff(moment(records[0].postdate)) === 1)
                    streak = streak + records[0].streak;

                return db.none(`
                    INSERT INTO posts(user_id, postdate, streak)
                    VALUES($1, $2, $3)
                    `, [user, postdate, streak]);
            });
        },


        /**
         * Returns statistics since day 1 for everyone
         *
         * @param  {String} user = null Optional user to get the stats for, gets stats
         *                              for all users if null
         * @return {Promise<String>}    Message for the bot to print
         */
        getStatistics(user = null) {
            const params = user ? [user] : void 0;
            return db.any(`
                WITH maxDates AS (
                  SELECT user_id, MAX(postdate) maxdate, COUNT(*) AS amountPosts, max(streak) AS maxStreak
                  FROM posts
                  GROUP BY 1
                )
                SELECT p.user_id, postdate, streak, amountPosts, maxStreak
                FROM posts p
                  INNER JOIN maxDates m ON p.user_id = m.user_id AND p.postdate = m.maxdate
                  INNER JOIN users u ON p.user_id = u.id
                ${user ? 'WHERE u.name = $1' : ''}
            `, params)
            .then(data => {
                return ['Current stats until today:']
                .concat(data.map(obj => `${name}: Posts: ${obj.amountposts} || Max streak: ${obj.maxstreak} || Current streak: ${obj.streak}`))
                .join('\n');
            })
        }
    },

    users: {

        /**
         * Creates a user
         *
         * @param  {Integer} id     Telegram ID of the user
         * @param  {String} name    Telegram name ([first_name + last_name].join(' '))
         * @return {Promise<undefined>}
         */
        create(id, name) {
            return db.none(`INSERT INTO users(id, name) VALUES ($1, $2)`, [id, name]);
        },

        /**
         * delete - description
         *
         * @param  {String} name    Name of the user to delete
         * @return {String}         Message for the bot to print
         */
        delete(name) {
            return db.tx(tx => {
                return tx.one(`SELECT id FROM users WHERE name = $1`, [name])
                .then(({id}) => {
                    return tx.none(`DELETE FROM flames WHERE user_id = $1`, [id])
                    .then( () => tx.none(`DELETE FROM posts WHERE user_id = $1`, [id]) )
                    .then( () => tx.none(`DELETE FROM users WHERE id = $1`, [id]) );
                })
            })
            .then( () => `Deleted user ${name} along with all posts and flames.`);
        }
    }
};
