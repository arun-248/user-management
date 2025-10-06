const app = require('./app');
const logger = require('./utils/logger');
// Initialize DB (creates tables and seeds managers)
require('./db');


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server listening on http://localhost:${PORT}`);
  console.log(`Server listening on http://localhost:${PORT}`);
});
