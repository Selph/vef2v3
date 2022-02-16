import { body } from 'express-validator';
import xss from 'xss';

export const sanitation = [
  body('name').trim().escape(),
  body('name').customSanitizer((value) => xss(value)),
  body('comment').customSanitizer((value) => xss(value)),
  body('description').customSanitizer((value) => xss(value)),
  body('event').customSanitizer((value) => xss(value)),
]
