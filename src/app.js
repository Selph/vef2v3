import express from 'express';
import dotenv from 'dotenv'
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { readFile } from './utils/fs-helpers.js';
import passport from './auth/passport.js';
import { cors } from './utils/cors.js';
import { eventRouter } from './api/events.js';
import { router as userRouter } from './api/users.js';
import { isInvalid } from './api/template-helpers.js';

dotenv.config();

const {
  PORT: port = 3000,
} = process.env;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PATCH') {
    if (
      req.headers['content-type']
      && (
        req.headers['content-type'] !== 'application/json'
        && !req.headers['content-type'].startsWith('multipart/form-data;')
      )) {
      return res.status(400).json({ error: 'body must be json or form-data' });
    }
  }
  return next();
});

app.get('/', async (req, res) => {
  const path = dirname(fileURLToPath(import.meta.url));
  console.log(join(path, './api/index.json'))
  const indexJson = await readFile(join(path, './api/index.json'));
  res.json(JSON.parse(indexJson));
});

app.use('/events', eventRouter);
app.use('/users', userRouter);

app.use(cors);

app.locals = {
  // TODO hjálparföll fyrir template
};

app.locals.isInvalid = isInvalid;

app.use((req, res, next) => { // eslint-disable-line
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => { // eslint-disable-line
  console.error(err);

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid json' });
  }

  return res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});


/** Middleware sem sér um 404 villur. */
app.use((req, res) => {
  const title = 'Síða fannst ekki';
  res.status(404).render('error', { title });
});

/** Middleware sem sér um villumeðhöndlun. */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  const title = 'Villa kom upp';
  res.status(500).render('error', { title });
});
