# Vefforritun 2, 2022. Verkefni 3: Viðburðakerfis vefþjónustur

## Setup

Keyrt með:

```bash
npm install
createdb vef2h1
# setja rétt DATABASE_URL í .env
npm run setup
npm run dev
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
  * `GET` 
    * `curl --location --request GET 'http://localhost:3000/'`
* `/users/`
  * `GET` 
    * `curl --location --request GET 'http://localhost:3000/users'`
* `/users/:id`
  * `GET` 
    * `curl --location --request GET 'http://localhost:3000/users/1'`
* `/users/register`
  * `POST` 
    * ``
    curl --location --request POST 'http://localhost:3000/users/register' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "Kevin Bacon",
    "username": "baconstation69",
    "password": "xmen"
}'
``
* `/users/login`
  * `POST` 
    * ``
    curl --location --request POST 'http://localhost:3000/users/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "username": "admin",
    "password": "1234"
}'
    ``
* `/users/me`
  * `GET` 
    * `curl --location --request GET 'http://localhost:3000/me'`

Aldrei skal skila eða sýna hash fyrir lykilorð.

#### Viðburðir

* `/events/`
  * `GET` 
    * `curl --location --request GET 'http://localhost:3000/events'`
  * `POST` 
    * ``
    curl --location --request POST 'http://localhost:3000/events' \
--header 'Authorization: Bearer TOKENHÉR' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "Stóri viðburðurinn",
    "description": "Þessi verður stór"
}'
    ``
* `/events/:id`
  * `GET` 
    * `curl --location --request GET 'http://localhost:3000/events/domsdagur'`
  * `PATCH` 
    * ``
    curl --location --request PATCH 'http://localhost:3000/events/stori-vibururinn' \
--header 'Authorization: Bearer TOKENHÉR \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "Megas viðburðurinn"
}'
    ``
  * `DELETE` 
    * ``
    curl --location --request DELETE 'http://localhost:3000/events/blomadagurinn-mikli' \
--header 'Authorization: Bearer TOKENHÉR'
    ``

#### Skráningar

* `/events/:id/register`
  * `POST` 
    * ``
    curl --location --request POST 'http://localhost:3000/events/megas-vibururinn/register' \
--header 'Authorization: Bearer TOKENHÉR' \
--header 'Content-Type: application/json' \
--data-raw '{
    "comment": "Yo blazin"
}'
``
  * `DELETE` 
    * ``
    curl --location --request DELETE 'http://localhost:3000/events/megas-vibururinn/register' \
--header 'Authorization: Bearer TOKENHÉR' \
--header 'Content-Type: application/json' \
--data-raw '{
    "comment": "Yo blazin"
}'
    ``

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

> Útgáfa 1.0

| Útgáfa | Breyting        |
| ------ | --------------- |
| 0.1    | Bæta Readme     |
| 0.2    | Base files      |
| 0.3    | Database        |
| 0.4    | Users           |
| 0.5    | Events          |
| 0.6    | cURL            |
| 0.7    | tests           |
| 0.8    | lint            |
| 1.0    | finalize        |
