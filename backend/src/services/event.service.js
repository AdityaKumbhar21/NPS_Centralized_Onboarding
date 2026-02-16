const amqp = require('amqplib');

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
      console.error('RabbitMQ connection closed. Reconnecting...');
      setTimeout(connect, 5000);
    });

    connection.on('error', (err) => {
      console.error('RabbitMQ error:', err.message);
    });

  } catch (err) {
    console.error('RabbitMQ connection failed. Retrying...', err.message);
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
    console.error('Failed to emit event:', err.message);
  }
};

module.exports = { emitEvent };
