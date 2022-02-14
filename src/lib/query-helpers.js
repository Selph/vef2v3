import dotenv from 'dotenv';
import pg from 'pg';
import express from 'express';

export async function query(q, values, pool) {
  let client;

  try {
    client = await pool.connect();
  } catch (e) {
    console.error('Unable to connect', e);
    return null;
  }

  try {
    const result = await client.query(q, values);
    return result;
  } catch (e) {
    console.error('Error running query', e);
    return null;
  } finally {
    client.release();
  }
}

export async function select(q, pool) {
  let client;

  try {
    client = await pool.connect();
  } catch (e) {
    console.error('Unable to connect', e);
    return null;
  }

  try {
    const result = await client.query(q);
    return result;
  } catch (e) {
    console.error('Error running query', e);
    return null;
  } finally {
    client.release();
  }
}
export async function createRegistration({ name, comment, event }, pool) {
  const q = `
    INSERT INTO
      signups(name, comment, event)
    VALUES
      ($1, $2, $3)
    RETURNING *`;
  const values = [name, comment, event];

  const result = await query(q, values, pool);
  return result !== null;
}

export async function getEvents(pool) {
  const eventQuery = 'select id, name from events';
  const eventIDs = await select(eventQuery, pool)
  const eventz = [];
  eventIDs.rows.forEach(row => {
  eventz.push({id: row.id, name: row.name})})
  return eventz;
}
