const { wait } = require('./src/utils/wait');
const { closeApp } = require('./test/helpers/get-app');
const { SuperSequelize } = require('./test/helpers/control-over-db');
const { dbOpts } = require('./src/config/config');

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
  process.exit(0);
}
