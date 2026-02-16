const prisma = require('../config/database');

const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();

  } catch (err) {
    return res.status(500).json({ message: 'Authorization error' });
  }
};

module.exports = adminMiddleware;
