const DashboardModel = require('../models/dashboard.model');

const getDashboardData = async () => {
  // Pedimos todo junto
  const [stats, topProducts, lowStock] = await Promise.all([
    DashboardModel.getGeneralStats(),
    DashboardModel.getTopProducts(),
    DashboardModel.getLowStockProducts()
  ]);

  return {
    stats,
    charts: {
      topProducts // Aquí podrías agregar más datos para gráficos en el futuro
    },
    alerts: {
      lowStock
    }
  };
};

module.exports = {
  getDashboardData
};