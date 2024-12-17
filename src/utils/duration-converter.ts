/**
 * Converts a formatted duration string into milliseconds.
 * Supported formats: 1m, 2h, 3d, 1h 30m, 2d 6h, etc.
 * @param {string} durationStr - The duration string to parse.
 * @returns {number} - The total duration in milliseconds.
 * @throws {Error} - If the input format is invalid.
 */
export const durationToMilliseconds = (durationStr: string) => {
  if (typeof durationStr !== 'string') {
    throw new Error('Input must be a string');
  }

  const timeUnits = {
    ms: 1,
    s: 1000,
    m: 1000 * 60,
    h: 1000 * 60 * 60,
    d: 1000 * 60 * 60 * 24,
  };

  const regex = /(\d+)(ms|s|m|h|d)/g;
  let totalMilliseconds = 0;
  let match;


  while ((match = regex.exec(durationStr)) !== null) {
    const value = parseInt(match[1], 10);
    const unit = match[2];
    if (timeUnits[unit]) {
      totalMilliseconds += value * timeUnits[unit];
    } else {
      throw new Error(`Invalid time unit: ${unit}`);
    }
  }

  if (totalMilliseconds === 0) {
    throw new Error('Invalid duration string format');
  }

  return totalMilliseconds;
}
