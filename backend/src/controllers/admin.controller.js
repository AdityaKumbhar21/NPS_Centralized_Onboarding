const {
  getAnalytics,
  getKycReport,
  getDropoffs
} = require('../services/analytics.service');

const { emitEvent } = require('../services/event.service');

const getAnalyticsController = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const data = await getAnalytics();

    await emitEvent('ADMIN_ANALYTICS_VIEWED', {
      adminId: req.user.userId
    });

    res.status(200).json(data);

  } catch (err) {
    next(err);
  }
};

const getKycReportController = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const report = await getKycReport(page, limit);

    await emitEvent('ADMIN_KYC_REPORT_VIEWED', {
      adminId: req.user.userId
    });

    res.status(200).json(report);

  } catch (err) {
    next(err);
  }
};

const getDropoffController = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const data = await getDropoffs();

    await emitEvent('ADMIN_DROPOFF_VIEWED', {
      adminId: req.user.userId
    });

    res.status(200).json(data);

  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAnalyticsController,
  getKycReportController,
  getDropoffController
};
