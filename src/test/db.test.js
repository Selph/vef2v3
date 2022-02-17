import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

import {
  createSchema,
  dropSchema,
  end,
  createEvent,
  getEventById,
} from '../lib/db.js';

/**
 * Hér er test gagnagrunnur búinn til og hent áður en test eru keyrð.
 * package.json sér um að nota dotenv-cli til að loada .env.test sem vísar í þann gagnagrunn
 * sem ætti *ekki* að vera sá sami og við notum „almennt“
 */

describe('db', () => {
  beforeAll(async () => {
    await dropSchema();
    await createSchema();
  });

  afterAll(async () => {
    await end();
  });

  it('creates a valid event and returns it', async () => {
    const name = 'Sundferðin mikla';
    const description = 'Nú ætlum við að synda yfir Þingvallavatn.'
    const created = await createEvent({name, description});

    let event;

    if (created) {
      event = await getEventById(4);
    }

    expect(event[0].name).toEqual('Sundferðin mikla');
    expect(event[0].slug).toEqual('sundferin-mikla');
    expect(event[0].description).toEqual('Nú ætlum við að synda yfir Þingvallavatn.');
    expect(event[0].id).toEqual(4);
  });
});
