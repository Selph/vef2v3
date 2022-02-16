DROP TABLE IF EXISTS signups;

DROP TABLE IF EXISTS events;


CREATE TABLE IF NOT EXISTS events(
  id serial primary key,
  name varchar(64) not null CHECK (name <> ''),
  slug varchar(64) not null unique,
  description varchar(400) not null CHECK (description <> ''),
  created TIMESTAMP with time zone not null default current_timestamp,
  updated TIMESTAMP with time zone not null default current_timestamp
);

insert into events(name,slug,description) values('Dómsdagur', 'domsdagur', 'Heimurinn mun enda næstkomandi mánudag, komdu og njóttu lokastunda alheims heim okkur');
insert into events(name,slug,description) values('Guðjón kemur heim', 'gudjon-kemur-heim', 'Guðjón okkar er loksins að koma heim eftir langa ferð. Í tilefni þess ætlum við öll að fara í sjósund, Guðjón elskar sjósund.');
insert into events(name,slug,description) values('Blómadagurinn mikli', 'blomadagurinn-mikli', 'Nú er komið að hinum árlega blómadegi. Komdu með blóm og verum saman með blóm.');

CREATE TABLE IF NOT EXISTS signups (
  id serial primary key,
  name varchar(64) NOT NULL CHECK (name <> ''),
  comment varchar(400),
  event serial NOT NULL,
  created TIMESTAMP with time zone not null default current_timestamp,
    FOREIGN KEY(event) REFERENCES events(id)
);

insert into signups(name, comment, event) values('Jón Gunnarsson', 'Vegan', 1);
insert into signups(name, comment, event) values('Sigmundur Davíð', 'Hrátt nautakjöt', 2);
insert into signups(name, comment, event) values('Blómi', '<3', 3);

DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
  id serial primary key,
  username character varying(64) not null unique,
  password character varying(256) not null
);

INSERT INTO users (username, password) VALUES ('admin', '$2b$11$HRLp260MPwDT8/f8LFTdAuabMsDKY8ItHtHVVv2M65dC24//QOTni');
