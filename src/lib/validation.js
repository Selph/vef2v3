import { body, validationResult } from 'express-validator';
import { createRegistration, getEvents } from './db.js';


export const validation = [
  body('name').isLength({ min: 1 }).withMessage('Nafn má ekki vera tómt')
]

export const results =
  async (req, res, next) => {
    const eventz = await getEvents()

    const { name = '', comment = '', events = eventz } = req.body;

    const result = validationResult(req);

    if (!result.isEmpty()) {
      //const errorMessages = errors.array().map((i) => i.msg);
      return res.render('form-signup', {
        title: 'Formið mitt',
        errors: result.errors,
        data: { name, comment, events },
      })
    }
    return next();
  }

  export const postComment = async (req,res) => {
    const { name, comment, event } = req.body;

    const created = await createRegistration({ name, comment, event })

    if (created) {
      return res.send('<p>Skráning móttekin!</p>')
    }

    const eventz = await getEvents()

    const events = (event === undefined) ? event : eventz;

    return res.render('form-signup', {
      title: 'Formið mitt',
      errors: [{ param: '', msg: 'Gat ekki búið til skráningu'}],
      data: { name, comment, events },
    })
  }
