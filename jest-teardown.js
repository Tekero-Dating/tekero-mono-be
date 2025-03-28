const { closeApp } = require('./test/helpers/get-app');
const { SuperSequelize } = require('./test/helpers/control-over-db');
const { dbOpts } = require('./src/config/config');

Object.defineProperty(global, 'crypto', {
  value: undefined,
  writable: true,
  configurable: true
}); // TODO: this disgusting shit needed. idk why.
/**
 * Current script just killing existing DB connection
 * with dropping test database
 */
module.exports = async () => {
  console.log("TEARDOWN started!!!!");
  const db = new SuperSequelize(dbOpts);
  await db.dropDbToWhichConnected();
  try {
    await closeApp();
  } catch (e) {
    console.log('TEARDOWN: cant close app', e);
  }
  console.log('TEARDOWN finished');
}
