DROP SCHEMA IF EXISTS public cascade;
CREATE SCHEMA public;

CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name varchar(255) NOT NULL UNIQUE
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
    content varchar(3000)
);

CREATE TABLE responses (
    id SERIAL PRIMARY KEY,
    regex varchar(1024),
    response varchar(3000),
    type varchar(20) DEFAULT 'Message'
);
