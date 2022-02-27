# Vefforritun 2, 2022. Hópverkefni 1: Veitingastaðurinn RFC

## Setup

Keyrt með:

```bash
npm install
createdb vef2h1
# setja rétt DATABASE_URL í .env
npm run setup
npm run dev
```

Uppsetning á heroku, gefið að appið sé til undir nafninu <APP> og þú sért loggedin á heroku cli:

```bash
heroku git:remote -a <APP>
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
heroku run npm run setup
```

## Skipanir

### Athuganir

Til að athuga hvort test séu rétt útfærð keyra test og fyrir eslint keyra lint

```bash
npm run test
npm run lint
```

### cURL

#### Notendaumsjón, vefþjónustur

* `/`
  * `GET` ```bash
  curl --location --request GET 'http://localhost:3000/'
  ```
* `/users/`
  * `GET` skilar síðu af notendum, aðeins ef notandi sem framkvæmir er stjórnandi
* `/users/:id`
  * `GET` skilar notanda, aðeins ef notandi sem framkvæmir er stjórnandi
* `/users/register`
  * `POST` staðfestir og býr til notanda. Skilar auðkenni og nafn. Notandi sem búinn er til skal aldrei vera stjórnandi
* `/users/login`
  * `POST` með notandanafni og lykilorði skilar token ef gögn rétt
* `/users/me`
  * `GET` skilar upplýsingum um notanda sem á token, auðkenni og nafn, aðeins ef notandi innskráður

Aldrei skal skila eða sýna hash fyrir lykilorð.

#### Viðburðir

* `/events/`
  * `GET` skilar síðu af viðburðum
  * `POST` býr til vibðurð, aðeins ef innskráður notandi
* `/events/:id`
  * `GET` skilar viðburð
  * `PATCH` uppfærir viðburð, a.m.k. eitt gildi, aðeins ef notandi bjó til viðburð eða er stjórnandi
  * `DELETE` eyðir viðburð, aðeins ef notandi bjó til viðburð eða er stjórnandi

#### Skráningar

* `/events/:id/register`
  * `POST` skráir notanda á viðburð, aðeins ef innskráður notandi
  * `DELETE` afskráir notanda af viðburði, aðeins ef innskráður notandi og til skráning

## Tæki og tól

### Dependencies

```
bcrypt
dotenv
dotenv-cli
express
express-validator
passport
passport-jwt
passport-local
pg
xss
```

### Dev dependencies

```concurrently
eslint
eslint-config-airbnb-base
eslint-config-prettier
eslint-plugin-import
jest
node-fetch
nodemon
```

## Admin aðgangur

notendanafn: `admin`
lykilorð:    `1234`

## env skrár

Það þarf að setja réttar upplýsingar í .env og .env.test skrárnar:

```
DATABASE_URL
JWT_SECRET
TOKEN_LIFETIME
```

## Heroku

https://vef2h1-rfc.herokuapp.com

> Útgáfa 0.5

| Útgáfa | Breyting        |
| ------ | --------------- |
| 0.1    | Bæta Readme     |
| 0.2    | Base files      |
| 0.3    | Database        |
| 0.4    | Users           |
| 0.5    | Events          |
| 0.6    | cURL            |
| 0.7    | tests           |
| 1.0    | Finalize Readme |
