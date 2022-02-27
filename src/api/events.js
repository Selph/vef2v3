/* eslint-disable no-useless-escape */
/* eslint-disable quotes */
import express, { json } from 'express';
import xss from 'xss';
import { catchErrors } from '../utils/catch-errors.js';
import { createRegistration,
        createEvent,
        getEvent,
        listEvents,
        conditionalUpdate,
        deleteQuery,
        getRegistration
      } from '../db.js'
import { sanitation } from '../validation/sanitation.js';
import { atLeastOneBodyValueValidator,
         descriptionValidator,
         nameValidator,
         validationSignup,
         validationEvent } from '../validation/validators.js';
import { requireAuthentication, requireSameUserOrAdmin } from '../auth/passport.js';
import { validationCheck } from '../validation/helper.js';

export const eventRouter = express.Router();

async function getEvents(req, res) {
  const events = await listEvents();

  for (let i = 0; i < events.length; i += 1) {
    events[i].link = `/events/${events[i].slug}`;
  }

  return res.json(events);
}

async function insertEvent(req, res) {
  const {
    name,
    description
  } = req.body;

  const creator = req.user.username;

  const insertEventResult = await createEvent({
    name,
    description,
    creator,
  });

  if (insertEventResult) {
    return res.status(201).json(insertEventResult);
  }

  return res.status(500).end();
}

async function listEvent(req, res) {

  const event = await getEvent(req.params.id)

  if (event.length === 0) return res.status(404).json({error: 'no event found'})
  return res.json(event)
}

function isString(s) {
  return typeof s === 'string';
}

const patchEvent = async (req,res) => {
  const event = await getEvent(req.params.id)
  if (event.length !== 1) return res.status(500).json({error: 'no event found'});

  const { id } = req.params;
  const { body } = req;

  const fields = [
    isString(body.name) ? 'name' : null,
    isString(body.description) ? 'description' : null,
  ];

  const values = [
    isString(body.name) ? xss(body.name) : null,
    isString(body.description) ? xss(body.description) : null,
  ];

  const result = await conditionalUpdate('events', id, fields, values);

  if (!result || !result.rows[0]) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  return res.status(200).json(result.rows[0]);
}

export async function deleteEvent(req, res) {
  const { id } = req.params;

  try {
    const deletionRowCount = await deleteQuery(
      'DELETE FROM events WHERE slug = $1;',
      [id],
    );

    if (deletionRowCount === 0) {
      return res.status(404).end();
    }

    return res.status(200).json({});
  } catch (e) {
    console.log('error :>> ',e)
  }

  return res.status(500).json(null);
}

async function signup(req, res) {
  const eventInfo = await getEvent(req.params.id);

  if (eventInfo.length === 0) return res.status(404).json({error: 'event not found'})

  const { username } = req.user;
  const { comment } = req.body
  const event = eventInfo[0].id;

  const isRegistration = await getRegistration({ username, event });

  if (isRegistration) return res.status(500).json({error: 'User already registered'});

  const registration = await createRegistration({ username, comment, event})

  if (!registration) res.status(500).json({error: 'Unknown error'})

  return res.status(200).end();
}

export async function deleteRegistration(req, res) {
  const { username } = req.user;

  try {
    const deletionRowCount = await deleteQuery(
      'DELETE FROM signups WHERE username = $1;',
      [username],
    );

    if (deletionRowCount === 0) {
      return res.status(404).end();
    }

    return res.status(200).json({});
  } catch (e) {
    console.log('error :>> ',e)
  }

  return res.status(500).json(null);
}

eventRouter.get('/', catchErrors(getEvents))
eventRouter.post('/', requireAuthentication,
                      nameValidator,
                      descriptionValidator,
                      validationCheck,
                      sanitation,
                      catchErrors(insertEvent));


eventRouter.get('/:id', listEvent)
eventRouter.patch('/:id', requireAuthentication,
                          requireSameUserOrAdmin,
                          validationEvent,
                          atLeastOneBodyValueValidator(['name', 'description']),
                          validationCheck,
                          sanitation,
                          patchEvent)

eventRouter.delete('/:id', requireAuthentication,
                           requireSameUserOrAdmin,
                           deleteEvent)

eventRouter.post('/:id/register', requireAuthentication,
                                  validationSignup,
                                  sanitation,
                                  validationCheck,
                                  signup)

eventRouter.delete('/:id/register', requireAuthentication,
                                    deleteRegistration)

