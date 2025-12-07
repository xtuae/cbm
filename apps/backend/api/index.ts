import type { VercelRequest, VercelResponse } from '@vercel/node';
import { app } from '../src/server.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Express app is a request handler, so just pass req/res through
  return (app as any)(req, res);
}
