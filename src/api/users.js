import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { jwtOptions,
         requireAdmin,
         requireAuthentication,
         tokenLifetime } from '../auth/passport.js';
import { comparePasswords, findByUsername, query } from '../db.js';
import { sanitation } from '../validation/sanitation.js';
import { validationUser } from '../validation/validators.js';
import { validationCheck } from '../validation/helper.js';
import { catchErrors } from '../utils/catch-errors.js';

export const router = express.Router();


async function listUsers(req, res) {
  const userQuery = 'select id, name, username, admin from users';
  const users = await query(userQuery);
  return res.json(users.rows);
}

async function getUser(req, res) {
  const userQuery = 'select id, name, username, admin from users where id=$1';
  const params = [req.params.id]
  const users = await query(userQuery, params);
  return res.json(users.rows);
}

async function getMyUser(req,res) {
  const userQuery = 'select id, name from users where id=$1';
  const params = [req.params.id]
  const users = await query(userQuery, params);

  const { name } = users.rows;

  const payload = { id: users.rows.id };
  const tokenOptions = { expiresIn: tokenLifetime };
  const token = jwt.sign(payload, jwtOptions.secretOrKey, tokenOptions);

  return res.json({ token, name });
}

async function registerUser(req, res) {
  const getUserQuery = 'select * from users where username=$1';
  const params = [req.body.username];
  const user = await query(getUserQuery, params);

  if (user.rowCount > 0) return res.status(500).json({ error: 'user already exists' });

  const userQuery = 'insert into users(name, username, password) values($1, $2, $3)';
  const hashedPassword = await bcrypt.hash(req.body.password, 11);
  const body = [req.body.name, req.body.username, hashedPassword];
  const registered = { registered: await query(userQuery, body),
                             user: await query(getUserQuery, params) };

  const payload = { id: registered.user.id };
  const tokenOptions = { expiresIn: tokenLifetime };
  const token = jwt.sign(payload, jwtOptions.secretOrKey, tokenOptions);

  return res.json({ token });
}

async function login(req, res) {
  const { username, password = '' } = req.body;

  const user = await findByUsername(username);

  if (!user) {
    return res.status(401).json({ error: 'No such user'  });
  }

  const passwordIsCorrect = await comparePasswords(password, user.password);

  if (passwordIsCorrect) {
    const payload = { id: user.id };
    const tokenOptions = { expiresIn: tokenLifetime };
    const token = jwt.sign(payload, jwtOptions.secretOrKey, tokenOptions);
    return res.json({ token });
  }

  return res.status(401).json({ error: 'Invalid password' });
}

async function getUserFromToken(req, res, next) {
  req.params.id = req.user.id;
  return next();
}


router.get('/', requireAuthentication, requireAdmin, catchErrors(listUsers));
router.get('/me', requireAuthentication, getUserFromToken, catchErrors(getMyUser));
router.get('/:id', requireAuthentication, requireAdmin, catchErrors(getUser));
router.post('/register', validationUser,
                         validationCheck,
                         sanitation,
                         registerUser);
router.post('/login', catchErrors(login));
