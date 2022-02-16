import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import { Strategy } from 'passport-local';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { isInvalid } from './lib/template-helpers.js';
import { indexRouter } from './routes/index-routes.js';
import { router as adminRouter } from './routes/admin-routes.js';
import {
  comparePasswords,
  findByUsername,
  findById
} from './lib/users.js';

dotenv.config();

const app = express();

// Sér um að req.body innihaldi gögn úr formi
app.use(express.urlencoded({ extended: true }));

const {
  PORT: port = 3000,
  DATABASE_URL: databaseUrl,
  // eslint-disable-next-line quotes
  SESSION_SECRET: sessionSecret = `AE"&Q"Q-a{yH8l)X0nY0%S"%gp]InAx$qkvxO^JAr'A(8zykX8BH:GW+)2}3kjY`,
} = process.env;

if (!sessionSecret || !databaseUrl) {
  console.error('Vantar .env gildi');
  process.exit(1);
}

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false
}));

const path = dirname(fileURLToPath(import.meta.url));

app.use(express.static(join(path, '../public')));

app.set('views', join(path, '../views'));
app.set('view engine', 'ejs');


async function strat(username, password, done) {
  try {
    const user = await findByUsername(username);

    if (!user) {
      return done(null, false);
    }

    // Verður annað hvort notandahlutur ef lykilorð rétt, eða false
    const result = await comparePasswords(password, user.password);

    return done(null, result ? user : false);
  } catch (err) {
    console.error(err);
    return done(err);
  }
}

passport.use(new Strategy({
  usernameField: 'username',
  passwordField: 'password',
}, strat));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await findById(id);
    return done(null, user);
  } catch (error) {
    return done(error)
  }
});

app.use(passport.initialize());
app.use(passport.session());

app.locals = {
  // TODO hjálparföll fyrir template
};

app.locals.isInvalid = isInvalid;

app.use('/admin', adminRouter)
app.use('/', indexRouter);
// app.use('/:slug', eventRouter);

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

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
