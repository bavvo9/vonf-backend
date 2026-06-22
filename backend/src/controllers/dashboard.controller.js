const DashboardService = require('../services/dashboard.service');

const getDashboard = async (req, res, next) => {
  try {
    const data = await DashboardService.getDashboardData();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard
};