DROP TABLE IF EXISTS events;

CREATE TABLE IF NOT EXISTS events(
  id serial primary key,
  name varchar(64) not null CHECK (name <> ''),
  slug varchar(64) not null unique,
  description varchar(400) not null CHECK (description <> ''),
  created TIMESTAMP with time zone not null default current_timestamp,
  updated TIMESTAMP with time zone not null default current_timestamp
);

DROP TABLE IF EXISTS signups;

CREATE TABLE IF NOT EXISTS signups (
  id serial primary key,
  name varchar(64) NOT NULL CHECK (name <> ''),
  comment varchar(400),
  event serial NOT NULL,
  created TIMESTAMP with time zone not null default current_timestamp,
    FOREIGN KEY(event) REFERENCES events(id)
);
