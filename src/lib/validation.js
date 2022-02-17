import { body, validationResult } from 'express-validator';
import { getEventById, listEvents, listSignupsById } from './db.js';


export const validation = [
  body('name').isLength({ min: 1 }).withMessage('Nafn má ekki vera tómt'),
  body('name').isLength({ max: 64 }).withMessage('Nafn má ekki vera meira en 64 stafir'),
  body('comment').isLength({ max: 400 }).withMessage('Nafn má ekki vera meira en 400 stafir'),
]

export const validationEvent = [
  body('name').isLength({ min: 1 }).withMessage('Nafn má ekki vera tómt'),
  body('name').isLength({ max: 64 }).withMessage('Nafn má ekki vera meira en 64 stafir'),
  body('description').isLength({ min: 1}).withMessage('Lýsing má ekki vera tóm'),
  body('description').isLength({ max: 400}).withMessage('Lýsing má ekki vera tóm'),
]

export const results = async (req, res, next) => {
    const { name = '', comment = '', event = '' } = req.body;

    const result = validationResult(req);

    const signups = await listSignupsById(event);
    const eventz = await getEventById(event);

    if (!result.isEmpty()) {
      return res.render('form-signup', {
        title: eventz[0].name,
        description: eventz[0].description,
        id: eventz[0].id,
        slug: eventz[0].slug,
        errors: result.errors,
        signups,
        data: { name, comment, event},
      })
    }
    return next();
  }

  export const resultsEvent = async (req, res, next) => {
    const { name = '', description = '' } = req.body;
    const result = validationResult(req);

    const events = await listEvents();

    if (!result.isEmpty()) {
      return res.render('admin', {
        title: 'Viðburðaumsjón',
        events,
        errors: result.errors,
        data: { name,
                description,
                errors: result.errors,
                username: req.cookies.username
              }
        })
    }
    return next();
  }

  export const resultsChange = async (req, res, next) => {
    let { event = '' } = req.body;

    const result = validationResult(req);

    event = await getEventById(event)

    if (!result.isEmpty()) {
      return res.render('form-event', {
        title: req.name,
        id: event[0].id,
        slug: event[0].slug,
        changed: true,
        errors: result.errors,
        data: { name: req.body.name,
                description: req.body.description,
              },
      });
    }
    return next();
  }
