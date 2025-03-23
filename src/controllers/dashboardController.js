// src/controllers/dashboardController.js
const { Ride, Driver, sequelize } = require('../models');
const { Op } = require('sequelize');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    // Get today's date
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));
    
    // Get start of current week and month
    const startOfThisWeek = new Date(today);
    startOfThisWeek.setDate(today.getDate() - today.getDay());
    startOfThisWeek.setHours(0, 0, 0, 0);
    
    const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Get counts for today
    const todayRides = await Ride.count({
      where: {
        requestTime: {
          [Op.between]: [startOfToday, endOfToday]
        }
      }
    });
    
    const todayCompletedRides = await Ride.count({
      where: {
        status: 'completed',
        endTime: {
          [Op.between]: [startOfToday, endOfToday]
        }
      }
    });
    
    const todayCancelledRides = await Ride.count({
      where: {
        status: 'cancelled',
        cancellationTime: {
          [Op.between]: [startOfToday, endOfToday]
        }
      }
    });
    
    const todayRevenue = await Ride.sum('actualFare', {
      where: {
        status: 'completed',
        endTime: {
          [Op.between]: [startOfToday, endOfToday]
        }
      }
    }) || 0;
    
    // Get counts for this week
    const thisWeekRides = await Ride.count({
      where: {
        requestTime: {
          [Op.gte]: startOfThisWeek
        }
      }
    });
    
    const thisWeekRevenue = await Ride.sum('actualFare', {
      where: {
        status: 'completed',
        endTime: {
          [Op.gte]: startOfThisWeek
        }
      }
    }) || 0;
    
    // Get counts for this month
    const thisMonthRides = await Ride.count({
      where: {
        requestTime: {
          [Op.gte]: startOfThisMonth
        }
      }
    });
    
    const thisMonthRevenue = await Ride.sum('actualFare', {
      where: {
        status: 'completed',
        endTime: {
          [Op.gte]: startOfThisMonth
        }
      }
    }) || 0;
    
    // Get active drivers count
    const activeDriversCount = await Driver.count({
      where: {
        isActive: true
      }
    });
    
    // Get online drivers count
    const onlineDriversCount = await Driver.count({
      where: {
        isOnline: true
      }
    });
    
    // Get pending rides
    const pendingRidesCount = await Ride.count({
      where: {
        status: 'pending'
      }
    });
    
    // Get latest rides
    const latestRides = await Ride.findAll({
      include: [
        {
          model: Driver,
          as: 'driver',
          attributes: ['id', 'name', 'phone']
        }
      ],
      order: [['requestTime', 'DESC']],
      limit: 5
    });
    
    // Prepare response
    const stats = {
      today: {
        rides: todayRides,
        completedRides: todayCompletedRides,
        cancelledRides: todayCancelledRides,
        revenue: todayRevenue,
        completionRate: todayRides > 0 ? (todayCompletedRides / todayRides * 100).toFixed(2) : 0
      },
      thisWeek: {
        rides: thisWeekRides,
        revenue: thisWeekRevenue
      },
      thisMonth: {
        rides: thisMonthRides,
        revenue: thisMonthRevenue
      },
      drivers: {
        total: await Driver.count(),
        active: activeDriversCount,
        online: onlineDriversCount
      },
      rides: {
        pending: pendingRidesCount,
        inProgress: await Ride.count({
          where: {
            status: {
              [Op.in]: ['accepted', 'arriving', 'in_progress']
            }
          }
        }),
        total: await Ride.count()
      },
      latestRides
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get revenue chart data
// @route   GET /api/dashboard/revenue-chart
// @access  Private/Admin
exports.getRevenueChartData = async (req, res) => {
  try {
    // Default to last 7 days if no period specified
    const period = req.query.period || 'week';
    
    let startDate, interval, format;
    const today = new Date();
    
    // Set parameters based on period
    switch (period) {
      case 'week':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        interval = 'day';
        format = '%Y-%m-%d';
        break;
      case 'month':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 30);
        interval = 'day';
        format = '%Y-%m-%d';
        break;
      case 'year':
        startDate = new Date(today);
        startDate.setFullYear(today.getFullYear() - 1);
        interval = 'month';
        format = '%Y-%m';
        break;
      default:
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        interval = 'day';
        format = '%Y-%m-%d';
    }
    
    // Get revenue data grouped by interval
    let revenueData;
    
    if (interval === 'day') {
      revenueData = await Ride.findAll({
        attributes: [
          [sequelize.fn('DATE_FORMAT', sequelize.col('endTime'), format), 'date'],
          [sequelize.fn('SUM', sequelize.col('actualFare')), 'revenue']
        ],
        where: {
          status: 'completed',
          endTime: {
            [Op.between]: [startDate, today]
          }
        },
        group: [sequelize.fn('DATE_FORMAT', sequelize.col('endTime'), format)],
        order: [[sequelize.fn('DATE_FORMAT', sequelize.col('endTime'), format), 'ASC']],
        raw: true
      });
    } else {
      revenueData = await Ride.findAll({
        attributes: [
          [sequelize.fn('DATE_FORMAT', sequelize.col('endTime'), format), 'date'],
          [sequelize.fn('SUM', sequelize.col('actualFare')), 'revenue']
        ],
        where: {
          status: 'completed',
          endTime: {
            [Op.between]: [startDate, today]
          }
        },
        group: [sequelize.fn('DATE_FORMAT', sequelize.col('endTime'), format)],
        order: [[sequelize.fn('DATE_FORMAT', sequelize.col('endTime'), format), 'ASC']],
        raw: true
      });
    }
    
    res.json({
      success: true,
      data: revenueData.map(item => ({
        date: item.date,
        revenue: parseFloat(item.revenue) || 0
      }))
    });
  } catch (error) {
    console.error('Get revenue chart data error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get ride distribution data
// @route   GET /api/dashboard/ride-distribution
// @access  Private/Admin
exports.getRideDistribution = async (req, res) => {
  try {
    // Get distribution by vehicle type
    const vehicleDistribution = await Ride.findAll({
      attributes: [
        'vehicleType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['vehicleType'],
      raw: true
    });
    
    // Get distribution by status
    const statusDistribution = await Ride.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });
    
    // Get distribution by time of day
    const timeDistribution = await Ride.findAll({
      attributes: [
        [sequelize.fn('HOUR', sequelize.col('requestTime')), 'hour'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('HOUR', sequelize.col('requestTime'))],
      order: [[sequelize.fn('HOUR', sequelize.col('requestTime')), 'ASC']],
      raw: true
    });
    
    res.json({
      success: true,
      data: {
        byVehicleType: vehicleDistribution,
        byStatus: statusDistribution,
        byTimeOfDay: timeDistribution
      }
    });
  } catch (error) {
    console.error('Get ride distribution error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};