import express from 'express';
import { listEvents } from '../lib/db.js';

export const router = express.Router();

export function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/login');
}


router.get('/', async (req,res) => {
  const events = await listEvents();
  res.render('admin', { title: 'admin svæði', events})
});
