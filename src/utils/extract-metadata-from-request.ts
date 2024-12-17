import { Request } from 'express';
import { UserFingerprint } from '../contracts/db/models/sessions.entity';

export function extractUserFingerprint(req: Request): UserFingerprint {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];
  const accept = req.headers['accept'];
  const acceptLanguage = req.headers['accept-language'];
  const acceptEncoding = req.headers['accept-encoding'];
  const referer = req.headers['referer'] || req.headers['referrer'];
  const connection = req.headers['connection'];
  const timestamp = new Date().toISOString();

  return {
    ip: ip?.toString() || null,
    userAgent,
    accept,
    acceptLanguage,
    acceptEncoding,
    referer,
    connection,
    timestamp,
  };
}
