DROP TABLE IF EXISTS users cascade;

DROP TABLE IF EXISTS signups cascade;

DROP TABLE IF EXISTS events cascade;

CREATE TABLE IF NOT EXISTS users (
  id serial primary key,
  name character varying(64) not null,
  username character varying(64) not null unique,
  admin boolean default false,
  password character varying(256) not null
);

INSERT INTO users (name, username, admin, password) VALUES ('admin', 'admin', true, '$2b$11$HRLp260MPwDT8/f8LFTdAuabMsDKY8ItHtHVVv2M65dC24//QOTni');

CREATE TABLE IF NOT EXISTS events(
  id serial primary key,
  name varchar(64) not null CHECK (name <> ''),
  slug varchar(64) not null unique,
  description varchar(400) not null CHECK (description <> ''),
  creator character varying(64) not null,
  created TIMESTAMP with time zone not null default current_timestamp,
  updated TIMESTAMP with time zone not null default current_timestamp,
    FOREIGN KEY(creator) REFERENCES users(username)
);

insert into events(name,slug,description, creator) values('Dómsdagur', 'domsdagur', 'Heimurinn mun enda næstkomandi mánudag, komdu og njóttu lokastunda alheims heim okkur', 'admin');
insert into events(name,slug,description, creator) values('Guðjón kemur heim', 'gudjon-kemur-heim', 'Guðjón okkar er loksins að koma heim eftir langa ferð. Í tilefni þess ætlum við öll að fara í sjósund, Guðjón elskar sjósund.', 'admin');
insert into events(name,slug,description, creator) values('Blómadagurinn mikli', 'blomadagurinn-mikli', 'Nú er komið að hinum árlega blómadegi. Komdu með blóm og verum saman með blóm.', 'admin');

CREATE TABLE IF NOT EXISTS signups (
  id serial primary key,
  username varchar(64) not null,
  comment varchar(400),
  event serial NOT NULL,
  created TIMESTAMP with time zone not null default current_timestamp,
    FOREIGN KEY(event) REFERENCES events(id),
    FOREIGN KEY(username) REFERENCES users(username)
);

insert into signups(username, comment, event) values('admin', 'Vegan', 1);
insert into signups(username, comment, event) values('admin', 'Hrátt nautakjöt', 2);
insert into signups(username, comment, event) values('admin', '<3', 3);
