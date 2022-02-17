import express from 'express';
import { catchErrors } from '../lib/catch-errors.js';
import { createRegistration,
        getEvent,
        getEventById,
        listEvents,
        listSignups,
        listSignupsById
      } from '../lib/db.js'
import { sanitation } from '../lib/sanitation.js';
import { results, validation } from '../lib/validation.js';

export const indexRouter = express.Router();

async function indexRoute(req, res) {
  const events = await listEvents();

  res.render('index', {
    title: 'Viðburðasíðan',
    events,
  });
}

async function eventRoute(req, res, next) {
  if (req.params.slug === 'admin') return next();
  if (req.params.slug === 'login') return next();
  const { slug } = req.params;
  if (req.params.slug === `admin', ${slug}`) return next();

  const signups = await listSignups(slug);
  const event = await getEvent(slug);

  return res.render('form-signup', {
    title: event[0].name,
    description: event[0].description,
    id: event[0].id,
    errors: [],
    slug,
    signups,
    data: { name: '',
            comment: '',},
  });
}

const postComment = async (req,res) => {
  const { name, comment, event } = req.body;

  const created = await createRegistration({ name, comment, event })

  if (created) {
    return res.send('<p>Skráning móttekin!</p><a href="/">Til baka</a>')
  }

  const signups = await listSignupsById(event);
  const eventz = await getEventById(event);

  return res.render('form-signup', {
    title: eventz[0].name,
    description: eventz[0].description,
    id: event[0].id,
    errors: [{ param: '', msg: 'Gat ekki búið til skráningu'}],
    slug: eventz[0].slug,
    signups,
    data: { name: '',
            comment: '',},
  });
}

indexRouter.get('/', catchErrors(indexRoute))

indexRouter.post('/:slug', validation, results, sanitation, postComment)

indexRouter.get('/:slug', eventRoute)



