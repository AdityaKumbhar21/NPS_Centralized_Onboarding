const amqp = require('amqplib');
const logger = require('../config/logger');

let connection;
let channel;

const QUEUE_NAME = 'nps_events';

async function connect() {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);

    channel = await connection.createConfirmChannel();

    await channel.assertQueue(QUEUE_NAME, {
      durable: true
    });

    connection.on('close', () => {
      logger.warn('RabbitMQ connection closed. Reconnecting...');
      setTimeout(connect, 5000);
    });

    connection.on('error', (err) => {
      logger.error('RabbitMQ error', { message: err && err.message ? err.message : 'Unknown error' });
    });

  } catch (err) {
    logger.error('RabbitMQ connection failed. Retrying...', { message: err && err.message ? err.message : 'Unknown error' });
    setTimeout(connect, 5000);
  }
}

connect();

const emitEvent = async (eventType, data) => {
  try {
    if (!channel) {
      await connect();
    }

    const message = {
      eventType,
      data,
      timestamp: new Date()
    };

    channel.sendToQueue(
      QUEUE_NAME,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );

  } catch (err) {
    logger.error('Failed to emit event', { message: err && err.message ? err.message : 'Unknown error' });
  }
};

module.exports = { emitEvent };
