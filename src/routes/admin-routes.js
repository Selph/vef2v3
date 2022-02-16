import cookieParser from 'cookie-parser';
import express from 'express';
import passport from 'passport';
import { createEvent, getEvent, listEvents, updateEvent } from '../lib/db.js';
import { sanitation } from '../lib/sanitation.js';
import { resultsChange, resultsEvent, validationEvent } from '../lib/validation.js';

export const router = express.Router();

export function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.cookie("username", `${req.cookies.username}`)
  return res.redirect('/login');
}

async function makeAdminPage(req,res) {
  const events = await listEvents();
  // const user = await getUser
  res.render('admin', { title: 'Viðburðaumsjón',
    events,
    errors: [],
    data: { name: '',
            description: '',
            username: req.cookies.username
            }
      })
}

async function goToEvent(req,res) {
  const event = await getEvent(req.params.slug);

  res.render('form-event', {
    title: event[0].name,
    id: event[0].id,
    slug: event[0].slug,
    errors: [],
    data: { name: event[0].name,
            description: event[0].description,},
  });
}

const postEvent = async (req,res) => {
  const { name, description } = req.body;

  const created = await createEvent({ name, description})

  if (created) {
    return res.send('<p>Skráning móttekin!</p><a href="/admin">Til baka</a>')
  }

  const events = await listEvents();

  return res.render('admin', {
    title: 'Viðburðaumsjón',
    events,
    errors: [],
    data: { name,
            description,
            errors: [{ param: '', msg: 'Gat ekki búið til skráningu'}],
            username: req.cookies.username
          }
    })
}

async function changeEvent(req,res) {
  let event = req.body

  let { name, description, id } = event
  name = event.name
  description = event.description
  id = event.event

  const updated = await updateEvent({ name, description, id });

  if (updated) {
    return res.send('<p>Skráning móttekin!</p><a href="/admin">Til baka</a>')
  }

  event = await getEvent(req.params.slug);

  return res.render('form-event', {
    title: event[0].name,
    id: event[0].id,
    slug: event[0].slug,
    errors: [],
    data: { name: event[0].name,
            description: event[0].description,},
  });
}
router.use(cookieParser());

function login(req,res) {
  if (req.isAuthenticated()) {
    return res.redirect('/admin');
  }

  let message = '';

  // Athugum hvort einvher skilaboð séu til í session, ef svo er
  // birtum þau og hreinsum skilaboð
  if (req.session.messages && req.session.messages.length > 0) {
    message = req.session.messages.join(', ');
    req.session.messages = [];
  }

  return res.send(`
  <!doctype html>
<html lang="is">

<head>
  <meta charset="utf-8">
  <title>Admin svæði</title>
  <link rel="stylesheet" href="/styles.css">
</head>

<main>
  <h1>Innskráning</h1>
    <form method="post" action="/admin/login">
      <div>
      <p class="login-type">Notendanafn</p>
      <input type="text" name="username" id="username" value="">
      </div>
      <div>
      <p class="login-type">Lykilorð</p>
      <input type="password" name="password">
      </div>
      <button class="login-button">Innskrá</button>
      <p><a href="/">Til baka</a></p>
    </form>
    <p>${message}</p>
    </main>
    </body>

  </html>
  `);
}

function logout(req,res) {
  req.logout();
  res.redirect('/');
}

router.get('/login', login)


router.post(
  '/login',
  passport.authenticate('local', {
    failureMessage: 'Notandanafn eða lykilorð vitlaust.',
    failureRedirect: '/admin/login',
  }),
  (req, res) => {
    res.cookie('username', `${req.body.username}`)
    res.redirect('/admin');
  },
);


router.get('/logout', logout);

router.get('/', ensureLoggedIn, makeAdminPage);

router.post('/', validationEvent, resultsEvent, sanitation, postEvent)

router.get('/:slug', ensureLoggedIn, goToEvent);

router.post('/:slug', validationEvent, resultsChange, sanitation, changeEvent)

router.post('/logout', async (req,res) => res.redirect('/logout'))

