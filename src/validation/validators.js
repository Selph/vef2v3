import { body, param, validationResult } from 'express-validator';
import { comparePasswords, findByUsername, getEventById, listEvents, listSignupsById } from '../db.js';
import { LoginError } from '../errors.js';
import { resourceExists } from './helper.js';



export const isPatchingAllowAsOptional = (value, { req }) => {
  if (!value && req.method === 'PATCH') {
    return false;
  }

  return true;
};

export function validateResourceExists(fetchResource) {
  return [
    param('id')
      .custom(resourceExists(fetchResource))
      .withMessage('not found'),
  ];
}

export function validateResourceNotExists(fetchResource) {
  return [
    param('id')
      .not()
      .custom(resourceExists(fetchResource))
      .withMessage('already exists'),
  ];
}

export const usernameValidator = body('username')
  .if(isPatchingAllowAsOptional)
  .isLength({ min: 1, max: 256 })
  .withMessage('username is required, max 256 characters');

export const nameValidator = body('name')
  .if(isPatchingAllowAsOptional)
  .isLength({ min: 1, max: 256 })
  .withMessage('name is required, max 256 characters');


export const passwordValidator = body('password')
  .if(isPatchingAllowAsOptional)
  .isLength({ min: 3, max: 256 })
  .withMessage('password is required, min 3 characters, max 256 characters');

export const commentValidator = body('comment')
  .if(isPatchingAllowAsOptional)
  .isLength({ max: 400 })
  .withMessage('Athugasemd má ekki vera meira en 400 stafir');

export const descriptionValidator = body('description')
  .if(isPatchingAllowAsOptional)
  .isLength({ min: 1, max: 400})
  .withMessage('Lýsing má ekki vera tóm né stærrri en 400 stafir');

export const usernameDoesNotExistValidator = body('username')
  .custom(async (username) => {
    const user = await findByUsername(username);

    if (user) {
      return Promise.reject(new Error('username already exists'));
    }
    return Promise.resolve();
  });

export const usernameAndPaswordValidValidator = body('username')
  .custom(async (username, { req: { body: reqBody } = {} }) => {
    // Can't bail after username and password validators, so some duplication
    // of validation here
    // TODO use schema validation instead?
    const { password } = reqBody;

    if (!username || !password) {
      return Promise.reject(new Error('skip'));
    }

    let valid = false;
    try {
      const user = await findByUsername(username);
      valid = await comparePasswords(password, user.password);
    } catch (e) {
      // Here we would track login attempts for monitoring purposes
      // logger.info(`invalid login attempt for ${username}`);
    }

    if (!valid) {
      return Promise.reject(new LoginError('username or password incorrect'));
    }
    return Promise.resolve();
  });

export const validationSignup = [
  commentValidator
]

export const validationEvent = [
  nameValidator,
  descriptionValidator,
  usernameValidator
]

export const validationUser = [
  nameValidator,
  usernameValidator,
  passwordValidator
]

export function atLeastOneBodyValueValidator(fields) {
  return body()
    .custom(async (value, { req }) => {
      const { body: reqBody } = req;

      let valid = false;

      for (let i = 0; i < fields.length; i += 1) {
        const field = fields[i];

        if (field in reqBody && reqBody[field] != null) {
          valid = true;
          break;
        }
      }

      if (!valid) {
        return Promise.reject(new Error(`require at least one value of: ${fields.join(', ')}`));
      }
      return Promise.resolve();
    });
}
