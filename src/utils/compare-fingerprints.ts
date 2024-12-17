/**
 * Compares old and new fingerprints.
 */
import { UserFingerprint } from '../contracts/db/models/sessions.entity';

export const areFingerprintsMatch = (
  oldFingerprint: UserFingerprint,
  newFingerprint: UserFingerprint,
): boolean => {
  return (
    oldFingerprint.ip === newFingerprint.ip &&
    oldFingerprint.userAgent === newFingerprint.userAgent &&
    oldFingerprint.acceptLanguage === newFingerprint.acceptLanguage &&
    oldFingerprint.acceptEncoding === newFingerprint.acceptEncoding
  );
}
