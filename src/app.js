import dotenv from 'dotenv';
import pg from 'pg';
import express from 'express';
import { body, validationResult } from 'express-validator';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { isInvalid } from './lib/template-helpers.js';
import { indexRouter } from './routes/index-routes.js';
import { createRegistration, getEvents} from './lib/query-helpers.js';

dotenv.config();

const {
  PORT: port = 3000,
  DATABASE_URL: connectionString,
  NODE_ENV: nodeEnv,
} = process.env;


// Notum SSL tengingu við gagnagrunn ef við erum *ekki* í development
// mode, á heroku, ekki á local vél
const ssl = nodeEnv !== 'development' ? { rejectUnauthorized: false } : false;

const pool = new pg.Pool({ connectionString, ssl:false });

pool.on('error', (err) => {
  console.error('postgres error, exiting...', err);
  process.exit(-1);
});

const app = express();

// Sér um að req.body innihaldi gögn úr formi
app.use(express.urlencoded({ extended: true }));

const path = dirname(fileURLToPath(import.meta.url));
const slug = undefined;

app.use(express.static(join(path, '../public')));
app.set('views', join(path, '../views'));
app.set('view engine', 'ejs');

app.locals = {
  // TODO hjálparföll fyrir template
};

app.locals.isInvalid = isInvalid;

// app.post(`/:${slug}`, (req,res) => {
//   res.send(`${JSON.stringify(req.body)}`)
// })

// app.use('/', indexRouter);
// TODO admin routes
//app.use(`/:${slug}`)

const validation = [
  body('name').isLength({ min: 1 }).withMessage('Nafn má ekki vera tómt')
]

const results =
  async (req, res, next) => {
    const eventz = await getEvents(pool)

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

app.get('/', async (req,res) => {
  const eventz = await getEvents(pool)
  res.render('form-signup', {
    title: 'Formið mitt',
    errors: [],
    data: { name: '',
            comment: '',
            events: eventz}
  })
})

const postComment = async (req,res) => {
  const { name, comment, event } = req.body;

  const created = await createRegistration({ name, comment, event }, pool)

  if (created) {
    return res.send('<p>Skráning móttekin!</p>')
  }

  const eventz = await getEvents(pool)

  const events = (event === undefined) ? event : eventz;

  return res.render('form-signup', {
    title: 'Formið mitt',
    errors: [{ param: '', msg: 'Gat ekki búið til skráningu'}],
    data: { name, comment, events },
  })
}

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
