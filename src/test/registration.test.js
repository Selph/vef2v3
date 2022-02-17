import { describe, expect, it } from '@jest/globals';
import { validationResult } from 'express-validator';
import { validation as val } from '../lib/validation.js';
import { sanitation as sal } from '../lib/sanitation.js';
// Hjálparfall sem leyfir okkur að testa express-validator middleware
// https://stackoverflow.com/questions/28769200/unit-testing-validation-with-express-validator
async function applyAllMiddlewares(req, middlewares) {
  await Promise.all(
    middlewares.map(async (middleware) => {
      await middleware(req, {}, () => undefined);
    })
  );
}

// TODO breyta og laga test

describe('registration', () => {
  it('validates', async () => {
    const req = {
      body: {
        name: '',
      },
    };
    const vally = val; // TODO Sækja á réttan stað

    await applyAllMiddlewares(req, vally);

    const validation = validationResult(req);

    expect(validation.isEmpty()).toBe(false);
  });

  it('sanitizes', async () => {
    const req = {
      body: {
        name: '<script>alert(1)</script>',
      },
    };

    const sally = sal; // TODO Sækja á réttan stað

    await applyAllMiddlewares(req, sally);

    expect(req.body.name).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });
});
