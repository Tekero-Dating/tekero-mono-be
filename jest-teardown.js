const { SuperSequelize } = require('./test/helpers/control-over-db');
const { dbOpts } = require('./src/config/config');

module.exports = async () => {
  console.log("TEARDOWN!!!!");
  const db = new SuperSequelize(dbOpts);
  await db.dropDbToWhichConnected();
}
