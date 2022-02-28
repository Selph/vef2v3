import { test, describe, expect } from '@jest/globals';

import { createRandomUser,
         createRandomUserAndReturnWithToken,
         fetchAndParse,
         loginAsHardcodedAdminAndReturnToken,
         postAndParse } from './utils.js';

describe('/users', () => {

  const username = 'admin'
  const password = '1234'

  test('GET /users requires auth', async () => {
    const { status } = await fetchAndParse('/users');

    expect(status).toBe(401);
  });

  test('GET /users requires admin, not user', async () => {
    const { token } = await createRandomUserAndReturnWithToken();
    expect(token).toBeTruthy();

    const { result, status } = await fetchAndParse('/users', token);

    expect(status).toBe(401);
    expect(result.error).toBe('insufficient authorization');
  });

  test('GET /users requires admin, success', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const { status } = await fetchAndParse('/users/1', token);

    expect(status).toBe(200);
  });

  test('GET /users/id requires admin, success', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const { status } = await fetchAndParse('/users', token);

    expect(status).toBe(200);
  });

  test('POST /users/register', async () => {
    const { data } = await createRandomUser();

    const { status } = await postAndParse('/users/register', data);

    expect(status).toBe(200);
  })

  test('Login user, no data', async () => {
    const data = null;
    const { status } = await postAndParse('/users/login', data);

    expect(status).toBe(401);
  });

  test('Login user, username & no pass', async () => {
    const data = { username: 'foobar' };
    const { status } = await postAndParse('/users/login', data);

    expect(status).toBe(401);
  });

  test('Login user, invalid username & pass', async () => {
    const data = { username: 'foobar', password: 'x'.repeat(10) };
    const { status } = await postAndParse('/users/login', data);

    expect(status).toBe(401);
  });

  test('Login user, success', async () => {
    const data = { username, password };
    const { result, status } = await postAndParse('/users/login', data);

    expect(status).toBe(200);
    expect(result.token.length).toBeGreaterThanOrEqual(20);
  });

  test('GET users/me', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    const { result, status } = await fetchAndParse('/users/me', token);

    expect(status).toBe(200);
    expect(result.token.length).toBeGreaterThanOrEqual(20);
  });
});
