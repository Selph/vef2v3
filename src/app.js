import dotenv from 'dotenv';
import pg from 'pg';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy } from 'passport-local';
import { body, validationResult } from 'express-validator';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { isInvalid } from './lib/template-helpers.js';
import { indexRouter } from './routes/index-routes.js';
import { getEvents} from './lib/db.js';
import {
  comparePasswords,
  findByUsername,
  findById
} from './lib/users.js';
import { validation, results, postComment} from './lib/validation.js'

dotenv.config();

const app = express();

const {
  PORT: port = 3000,
  DATABASE_URL: databaseUrl,
  SESSION_SECRET: sessionSecret = 'sdjafkahsdg',
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
app.use(passport.session())

function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/login');
}

// Sér um að req.body innihaldi gögn úr formi
app.use(express.urlencoded({ extended: true }));

const path = dirname(fileURLToPath(import.meta.url));
const slug = undefined;

app.use(express.static(join(path, '../public')));
app.set('views', join(path, '../views'));
app.set('view engine', 'ejs');

async function strat(username, password, done) {
  try {
    const user = await findByUsername(username);

    if (!user) {
      return done(null,false);
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
  passwordField: 'passsword',
}, strat))

app.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }

  let message = '';

  // Athugum hvort einvher skilaboð séu til í session, ef svo er
  // birtum þau og hreinsum skilaboð
  if (req.session.messages && req.session.messages.length > 0) {
    message = req.session.messages.join(', ');
    req.session.messages = [];
  }

  return res.send(`
    <form method="post" action="/login">
      <label>Notendanafn: <input type="text" name="username"></label>
      <label>Lykilorð: <input type="password" name="password"></label>
      <button>Innskrá</button>
    </form>
    <p>${message}</p>
  `);
});

app.post(
  '/login',
  passport.authenticate('local', {
    failureMessage: 'Notandanafn eða lykilorð vitlaust.',
    failureRedirect: '/login',
  }),
  (req, res) => {
    res.redirect('/admin');
  },
);

app.get('logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get('/admin', ensureLoggedIn, (req,res) => {
  res.send(`
  <p>Hér eru leyndarmál</p>
  <p><a href="/">Forsíða</a></p>
  `);
});

app.locals = {
  // TODO hjálparföll fyrir template
};

app.locals.isInvalid = isInvalid;

// app.post(`/:${slug}`, (req,res) => {
//   res.send(`${JSON.stringify(req.body)}`)
// })

// app.use('/', indexRouter);
// TODO admin routes
// app.use(`/:${slug}`)

app.get('/', async (req,res) => {
  const eventz = await getEvents()
  res.render('form-signup', {
    title: 'Formið mitt',
    errors: [],
    data: { name: '',
            comment: '',
            events: eventz}
  })
})

app.post('/post', validation, results, postComment)

/** Middleware sem sér um 404 villur. */
app.use((req, res) => {
  const title = 'Síða fannst ekki';
  res.status(404).render('error', { title });
});

/** Middleware sem sér um villumeðhöndlun. */
// eslint-disable-next-line no-unused-vars
// app.use((err, req, res, next) => {
//   console.error(err);
//   const title = 'Villa kom upp';
//   res.status(500).render('error', { title });
// });

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
