import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174000', // Mock UUID
  email: 'test@example.com',
  role: 'user',
};

const mockAdmin = {
  id: '123e4567-e89b-12d3-a456-426614174001', // Mock UUID
  email: 'admin@example.com',
  role: 'admin',
};

// Temporary bypass for testing - TODO: Fix proper authentication
export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // For now, create a mock user - replace with proper auth later
  req.user = mockUser;
  next();
};

// Temporary bypass for testing - TODO: Fix proper authentication
export const authenticateAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // For now, create a mock admin - replace with proper auth later
  req.user = mockAdmin;
  next();
};
