const amqp = require('amqplib');
const logger = require('../config/logger');
const { logEvent } = require('../services/analytics.service');

const QUEUE_NAME = 'nps_events';
const RETRY_INTERVAL_MS = 5000;

const startConsumer = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });

    // In dev, purge stale messages from previous runs so they don't flood logs on restart.
    // In production, queued messages are intentionally preserved across restarts.
    if (process.env.NODE_ENV !== 'production') {
      const purged = await channel.purgeQueue(QUEUE_NAME);
      if (purged.messageCount > 0) {
        logger.info(`[Analytics Consumer] Dev mode: purged ${purged.messageCount} stale message(s) from queue.`);
      }
    }

    channel.prefetch(1);

    logger.info('[Analytics Consumer] Listening to nps_events queue...');

    channel.consume(QUEUE_NAME, async (msg) => {
      if (!msg) return;

      try {
        const payload = JSON.parse(msg.content.toString());
        const { eventType, data = {}, timestamp } = payload;

        
        await logEvent(eventType, data.userId || null, {
          ...data,
          queuedAt: timestamp
        });

        logger.info(`[Analytics Consumer] Logged event: ${eventType} | userId: ${data.userId || 'N/A'}`);

        channel.ack(msg);
      } catch (err) {
        logger.error('[Analytics Consumer] Failed to process message', {
          message: err && err.message ? err.message : 'Unknown error'
        });
        
        channel.nack(msg, false, false);
      }
    });

    connection.on('close', () => {
      logger.warn('[Analytics Consumer] Connection closed. Reconnecting...');
      setTimeout(startConsumer, RETRY_INTERVAL_MS);
    });

    connection.on('error', (err) => {
      logger.error('[Analytics Consumer] Connection error', {
        message: err && err.message ? err.message : 'Unknown error'
      });
    });

  } catch (err) {
    logger.error('[Analytics Consumer] Failed to start. Retrying...', {
      message: err && err.message ? err.message : 'Unknown error'
    });
    setTimeout(startConsumer, RETRY_INTERVAL_MS);
  }
};

module.exports = { startConsumer };
