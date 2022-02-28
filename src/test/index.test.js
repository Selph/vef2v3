import { test, describe, expect } from '@jest/globals';

import { fetchAndParse, postAndParse } from './utils.js';

describe('events', () => {

  test('GET index', async () => {
    const { result, status } = await fetchAndParse('/')

    expect(status).toBe(200);
  });
});
