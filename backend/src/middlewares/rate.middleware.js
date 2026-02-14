const rateLimit = require('express-rate-limit');
module.exports = rateLimit({ windowMs: 60 * 60 * 1000, max: 5, message: 'Too many requests' });