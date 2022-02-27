import { readFile } from 'fs/promises';
import bcrypt from 'bcrypt';
// eslint-disable-next-line import/no-unresolved
import pg from 'pg';

const SCHEMA_FILE = './sql/insert.sql';
const DROP_SCHEMA_FILE = './sql/drop.sql';

const { DATABASE_URL: connectionString, NODE_ENV: nodeEnv = 'development' } =
  process.env;

if (!connectionString) {
  console.error('vantar DATABASE_URL í .env');
  process.exit(-1);
}

// Notum SSL tengingu við gagnagrunn ef við erum *ekki* í development
// mode, á heroku, ekki á local vél
const ssl = nodeEnv === 'production' ? { rejectUnauthorized: false } : false;

const pool = new pg.Pool({ connectionString, ssl });

pool.on('error', (err) => {
  console.error('Villa í tengingu við gagnagrunn, forrit hættir', err);
  process.exit(-1);
});

export async function query(q, values) {
  let client;

  try {
    client = await pool.connect();
  } catch (e) {
    console.error('Unable to connect', e);
    return null;
  }

  try {
    const result = await client.query(q, values);
    return result;
  } catch (e) {
    console.error('Error running query', e);
    return null;
  } finally {
    client.release();
  }
}

async function queryOG(q, values = []) {
  let client;
  try {
    client = await pool.connect();
  } catch (e) {
    console.error('unable to get client from pool', e);
    return null;
  }

  try {
    const result = await client.query(q, values);
    return result;
  } catch (e) {
    if (nodeEnv !== 'test') {
      console.error('unable to query', e);
    }
    return null;
  } finally {
    client.release();
  }
}

export async function select(q) {
  let client;

  try {
    client = await pool.connect();
  } catch (e) {
    console.error('Unable to connect', e);
    return null;
  }

  try {
    const result = await client.query(q);
    return result;
  } catch (e) {
    console.error('Error running query', e);
    return null;
  } finally {
    client.release();
  }
}

export async function findById(id) {
  const q = 'SELECT * FROM users WHERE id = $1';

  try {
    const result = await query(q, [id]);

    if (result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    console.error('Gat ekki fundið notanda eftir id');
  }

  return null;
}

export async function comparePasswords(password, hash) {
  const result = await bcrypt.compare(password, hash);
  return result;
}

export async function findByUsername(username) {
  const q = 'SELECT * FROM users WHERE username = $1';

  try {
    const result = await query(q, [username]);

    if (result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    console.error('Gat ekki fundið notanda eftir notendnafni');
    return null;
  }

  return false;
}

export async function createRegistration({ username, comment, event }) {
  const q = `
    INSERT INTO
      signups(username, comment, event)
    VALUES
      ($1, $2, $3)
    RETURNING *`;
  const values = [username, comment, event];

  const result = await query(q, values);
  return result !== null;
}

export async function getRegistration({ username, event}) {
  const q = `select * from signups
             where username = $1
             and   event = $2`
  const values = [username, event];

  const result = await query(q, values);

  return result.rowCount !== 0;
}

function createSlug(name) {
  let str = name.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  const from = 'àáäâèéëêìíïîòóöôùúüûñç·/_,:;';
  const to   = 'aaaaeeeeiiiioooouuuunc------';
  for (let i=0, l=from.length ; i<l ; i += 1) {
      str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }
  str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
      .replace(/\s+/g, '-') // collapse whitespace and replace by -
      .replace(/-+/g, '-'); // collapse dashes
  return str;
}

export async function createEvent({ name, description, creator}) {
  const q = `
    INSERT INTO
      events(name, description, slug, creator)
    VALUES
      ($1, $2, $3, $4)
    RETURNING *`;
  const values = [name, description, createSlug(name), creator];

  const result = await query(q, values);
  return result !== null;
}

export async function updateEvent({ name, description, id }) {
  const slug = createSlug(name);
  const idz = parseInt(id, 10)
  const q = `
    UPDATE events
    SET name = $1, description = $2, slug = $3
    WHERE id = $4;`;
  const values = [name, description, slug, idz];

  const result = await query(q, values);

  return result !== null;
}

export async function listEvents(){
  const q = `
    SELECT * FROM events`

  const result = await query(q);

  if (result) return result.rows;

  return [];
}

export async function listSignups(slug){
  let result = []
  try {
    const queryResult = await query(
      'SELECT * FROM signups WHERE event=(SELECT id FROM events WHERE slug= $1 )', [slug]
    );

    if (queryResult && queryResult.rows) {
      result = queryResult.rows;
    }
  } catch (e) {
    console.error('Error selecting rows', e)
  }
  return result;
}

export async function listSignupsById(id){
  let result = []
  try {
    const queryResult = await query(
      'SELECT * FROM signups WHERE event=(SELECT id FROM events WHERE id= $1 )', [id]
    );

    if (queryResult && queryResult.rows) {
      result = queryResult.rows;
    }
  } catch (e) {
    console.error('Error selecting rows', e)
  }
  return result;
}

export async function getEvent(slug) {
  let result = [];
  try {
    const queryResult = await query(
      'SELECT * FROM events WHERE slug = $1', [slug]
    );

    if (queryResult && queryResult.rows) {
      result = queryResult.rows;
    }
  } catch (e) {
    console.error('Error selecting rows', e)
  }
  return result;
}

export async function getEventById(id) {
  let result = [];
  try {
    const queryResult = await query(
      'SELECT * FROM events WHERE id = $1', [id]
    );

    if (queryResult && queryResult.rows) {
      result = queryResult.rows;
    }
  } catch (e) {
    console.error('Error selecting rows', e)
  }
  return result;
}

export async function createSchema(schemaFile = SCHEMA_FILE) {
  const data = await readFile(schemaFile);

  return queryOG(data.toString('utf-8'));
}

export async function dropSchema(dropFile = DROP_SCHEMA_FILE) {
  const data = await readFile(dropFile);

  return queryOG(data.toString('utf-8'));
}

export async function deleteQuery(_query, values = []) {
  const result = await query(_query, values);
  return result.rowCount;
}

export async function conditionalUpdate(table, id, fields, values) {
  const filteredFields = fields.filter((i) => typeof i === 'string');
  const filteredValues = values
  .filter((i) => typeof i === 'string'
  || typeof i === 'number'
  || i instanceof Date);
  if (filteredFields.length === 0) {
  return false;
  }
  if (filteredFields.length !== filteredValues.length) {
  throw new Error('fields and values must be of equal length');
  }
  // id is field = 1
  const updates = filteredFields.map((field, i) => `${field} = $${i + 2}`);
  const q = `
      UPDATE ${table}
        SET ${updates.join(', ')}
      WHERE
        slug = $1
      RETURNING *
      `;
  const queryValues = [id].concat(filteredValues);
  console.info('Conditional update', q, queryValues);
  const result = await query(q, queryValues);
  return result;
  }

export async function end() {
  await pool.end();
}

