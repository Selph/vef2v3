# Vefforritun 2, 2022. Verkefni 2: Viðburðakerfi

## Setup

Keyrt með:

```bash
npm install
createdb vef2v2
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

Til að athuga hvort test séu rétt útfærð keyra coverage, fyrir eslint og stylelint keyra lint

```bash
npm run coverage
npm run lint
```



> Útgáfa 0.2

| Útgáfa | Breyting      |
| ------ | ------------- |
| 0.1    | Bæta Readme   |
| 0.2    | Functional    |
