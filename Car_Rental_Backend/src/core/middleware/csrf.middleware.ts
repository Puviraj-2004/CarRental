import { Request, Response, NextFunction } from 'express';

const CSRF_HEADER = 'x-csrf-token';
const CSRF_COOKIE = 'csrf-token';


export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    next();
    return;
  }

  const cookieToken  = req.cookies?.[CSRF_COOKIE];
  const headerToken  = req.headers[CSRF_HEADER];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    res.status(403).json({ error: 'Invalid CSRF token' });
    return;
  }

  next();
}
