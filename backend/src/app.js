require('dotenv').config();
const express = require('express');
const app = express();
const prisma = require('./config/database');
const redisClient = require('./config/redis');
const logger = require('./config/logger');
const rateLimit = require('express-rate-limit');
const errorMiddleware = require('./middlewares/error.middleware');


app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })); 
app.use(errorMiddleware);
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/kyc', require('./routes/kyc.routes'));
app.use('/api/user', require('./routes/user.routes'));
app.use('/api/document', require('./routes/document.routes'));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));

module.exports = { app, prisma, redisClient }; 