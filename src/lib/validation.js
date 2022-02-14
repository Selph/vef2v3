import { body, validationResult } from 'express-validator';
import { createRegistration, getEvents } from './query-helpers';


export const validation = [
  body('name').isLength({ min: 1 }).withMessage('Nafn má ekki vera tómt')
]

export const results =
  (req, res, next) => {
    const { name = '', comment = '', events = eventz } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((i) => i.msg);
      return res.render('form-signup', {
        title: 'Formið mitt',
        errors: errorMessages,
        data: { name, comment, events },
      })
    }
    return next();
  }

  export const postComment = async (req,res, pool) => {
    const { name, comment, event } = req.body;

    const created = await createRegistration({ name, comment, event }, pool)


    if (created) {
      return res.send('<p>Skráning móttekin!</p>')
    }

    const eventz = getEvents(pool);

    const events = (event === undefined) ? event : eventz;

    return res.render('form-signup', {
      title: 'Formið mitt',
      errors: [{ param: '', msg: 'Gat ekki búið til skráningu'}],
      data: { name, comment, events },
    })
  }
