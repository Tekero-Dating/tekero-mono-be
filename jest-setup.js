const { SuperSequelize } = require('./test/helpers/control-over-db');
const { dbOpts } = require('./src/config/config');
const { exec } = require('child_process');

/**
 *  Current script make up and running a DB connection by
 *  creating a test db for running test with real DB
 *  but in isolated environment
 */
module.exports = async () => {
  const db = new SuperSequelize({
    ...dbOpts,
    database: 'postgres'
  });
  try {
    await db.createDatabase(dbOpts.database, 'template_postgis');
    await db.applyPostgis();
    console.log('Test database created and postgis extension applied');
  } catch (e) {
    console.log({ e });
  }
  await new Promise((resolve, reject) => {
    exec('npm run seed:test-local', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing seed script: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.error(`Seed script stderr: ${stderr}`);
      }
      console.log(`Seed script stdout: ${stdout}`);
      resolve();
    });
  });
}
