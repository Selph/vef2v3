import { test, describe, expect } from '@jest/globals';

import { fetchAndParse } from './utils.js';

describe('events', () => {

  test('GET index', async () => {
    const { status } = await fetchAndParse('/')

    expect(status).toBe(200);
  });
});
