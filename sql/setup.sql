DROP SCHEMA IF EXISTS public cascade;
CREATE SCHEMA public;

CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    first_name varchar(255) NOT NULL,
    last_name varchar(255) NULL
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    post_time TIMESTAMP,
    streak INTEGER
);

CREATE TABLE flames (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NULL,
    content varchar(255)
);
