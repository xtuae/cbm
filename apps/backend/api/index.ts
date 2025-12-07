import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/app.js';
import { Server } from 'http';

const server = app as unknown as Server;

export default (req: VercelRequest, res: VercelResponse) => {
  return server.emit('request', req, res);
};
