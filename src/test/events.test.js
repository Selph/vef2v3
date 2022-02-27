import { test, describe, expect } from '@jest/globals';

import { fetchAndParse, postAndParse } from './utils.js';

describe('events', () => {

  const eventName = 'Jónshátíð'
  const eventDescription = 'Jóni finnst gaman að skemmta sér';
  const eventCreator = 'admin'

  test('GET /events', async () => {
    const { result } = await fetchAndParse('/events');

    expect(result.status).toBe(200);
    expect(result.length).toBe(3);
    expect(result[0].link).toBeDefined();
  });

  test('Create event', async () => {
    const data = { eventName, eventDescription };
    const { result, status } = await postAndParse('/users/register', data);

    expect(status).toBe(401);
    expect(result.errors.length).toBe(1);
  });
});
