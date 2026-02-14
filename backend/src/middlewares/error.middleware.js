const logger = require('../config/logger');

module.exports = (err, req, res, next) => {
  logger.error(`${err.message} - ${req.path}`);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
};