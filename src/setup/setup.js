import { promises } from 'fs';
import { query, end } from '../db.js'

const schemaFile = './sql/schema.sql'

async function create() {
  const data = await promises.readFile(schemaFile)

  await query(data.toString('utf-8'));

  await end();
}

create().catch((err) => {
  console.error('Error creating running setup', err);
});
