DROP SCHEMA IF EXISTS public cascade;
CREATE SCHEMA public;

CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name varchar(255) NOT NULL
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    postdate DATE,
    streak INTEGER
);

CREATE TABLE flames (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NULL,
    content varchar(255)
);
