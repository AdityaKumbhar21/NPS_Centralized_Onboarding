const bcrypt = require('bcryptjs');
const redisClient = require('../config/redis');
const logger = require('../config/logger');
const twilioClient = require('../config/twilio');

const sendOtp = async (mobile) => {
  try {
    const attemptsKey = `otp_attempts:${mobile}`;
    const attempts = await redisClient.get(attemptsKey);

    if (attempts && parseInt(attempts) >= 5) {
      throw new Error('Rate limit exceeded');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOtp = await bcrypt.hash(otp, 10);

    
    await redisClient.setEx(`otp:${mobile}`, 300, hashedOtp);

    
    await redisClient.incr(attemptsKey);
    await redisClient.expire(attemptsKey, 3600);

   
    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:+91${mobile}`,  // India example
      body: `Your NPS verification OTP is: ${otp}\nValid for 5 minutes.\nDo not share this with anyone.`
    });

    logger.info(`OTP sent successfully to ${mobile}`);
    return 'OTP sent successfully';
  } catch (error) {
    logger.error('OTP send error:', error.message);
    throw new Error('Failed to send OTP');
  }
};

const verifyOtp = async (mobile, otp) => {
  const storedHash = await redisClient.get(`otp:${mobile}`);

  if (!storedHash) {
    throw new Error('OTP expired');
  }

  const isValid = await bcrypt.compare(otp, storedHash);

  if (!isValid) {
    throw new Error('Invalid OTP');
  }

  await redisClient.del(`otp:${mobile}`);
  await redisClient.del(`otp_attempts:${mobile}`);

  return true;
};

module.exports = { sendOtp, verifyOtp };
