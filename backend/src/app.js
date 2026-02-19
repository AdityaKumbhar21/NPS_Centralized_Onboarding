require('dotenv').config();

const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const helmet = require('helmet');

const prisma = require('./config/database');
const redisClient = require('./config/redis');
const logger = require('./config/logger');
const { startConsumer } = require('./consumers/analytics.consumer');

const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
  })
);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/kyc', require('./routes/kyc.routes'));
app.use('/api/user', require('./routes/user.routes'));
app.use('/api/document', require('./routes/document.routes'));
app.use('/api/pfm', require('./routes/pfm.routes'));
app.use('/api/payment', require('./routes/payment.routes'));
app.use('/api/consent', require('./routes/consent.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  // Start RabbitMQ → Analytics DB consumer
  startConsumer().catch(err => logger.error('Analytics consumer failed to start:', err));
});

module.exports = { app, prisma, redisClient };
