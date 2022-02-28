import { test, describe, expect } from '@jest/globals';

import { createRandomEventAndReturnSlug,
         deleteAndParse,
         fetchAndParse,
         loginAsHardcodedAdminAndReturnToken,
         patchAndParse,
         postAndParse } from './utils.js';

describe('events', () => {

  const eventName = 'Jónshátíð'
  const eventDescription = 'Jóni finnst gaman að skemmta sér'

  test('GET /events', async () => {
    const { result, status } = await fetchAndParse('/events');

    expect(status).toBe(200);
    expect(result[0].link).toBeDefined();

  });

  test('Create event', async () => {
    const data = { eventName, eventDescription };
    const { status } = await postAndParse('/events', data);

    expect(status).toBe(401);
  });

  test('GET event', async () => {
    const { status } = await fetchAndParse('/events/domsdagur')

    expect(status).toBe(200);
  });

  test('PATCH event', async () => {
    const slug = await createRandomEventAndReturnSlug();
    const token = await loginAsHardcodedAdminAndReturnToken();
    const data = { name: 'Test patch', description: 'Test Desc'};
    const { status } = await patchAndParse(`/events/${slug}`, token, data)

    expect(status).toBe(400);
  });

  test('DELETE event', async () => {
    const slug = await createRandomEventAndReturnSlug();
    const token = await loginAsHardcodedAdminAndReturnToken();
    const path = `/events/${slug}`;
    const { status } = await deleteAndParse(path, token)

    expect(status).toBe(400);
  });
});
