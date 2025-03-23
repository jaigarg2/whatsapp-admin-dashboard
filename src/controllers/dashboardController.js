const Ride = require('../models/Ride');
const Driver = require('../models/Driver');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get start of current week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    // Get start of current month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Get ride statistics
    const totalRides = await Ride.countDocuments();
    const completedRides = await Ride.countDocuments({ status: 'completed' });
    const cancelledRides = await Ride.countDocuments({ status: 'cancelled' });
    const todayRides = await Ride.countDocuments({
      'timestamps.created': { $gte: today }
    });
    const weekRides = await Ride.countDocuments({
      'timestamps.created': { $gte: startOfWeek }
    });
    const monthRides = await Ride.countDocuments({
      'timestamps.created': { $gte: startOfMonth }
    });
    
    // Get total earnings (sum of all completed rides' final fare)
    const earnings = await Ride.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$fare.final' } } }
    ]);
    
    const totalEarnings = earnings.length > 0 ? earnings[0].total : 0;
    
    // Get today's earnings
    const todayEarnings = await Ride.aggregate([
      { 
        $match: { 
          status: 'completed',
          'timestamps.completed': { $gte: today }
        } 
      },
      { $group: { _id: null, total: { $sum: '$fare.final' } } }
    ]);
    
    // Get driver statistics
    const totalDrivers = await Driver.countDocuments();
    const activeDrivers = await Driver.countDocuments({ status: { $in: ['online', 'busy'] } });
    
    // Get latest rides
    const latestRides = await Ride.find()
      .sort({ 'timestamps.created': -1 })
      .limit(5)
      .populate('driver', 'name phone vehicleNumber');
    
    // Response data
    const stats = {
      rides: {
        total: totalRides,
        completed: completedRides,
        cancelled: cancelledRides,
        today: todayRides,
        thisWeek: weekRides,
        thisMonth: monthRides
      },
      earnings: {
        total: totalEarnings,
        today: todayEarnings.length > 0 ? todayEarnings[0].total : 0
      },
      drivers: {
        total: totalDrivers,
        active: activeDrivers
      },
      latestRides
    };
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get earnings by period
// @route   GET /api/dashboard/earnings
// @access  Private
exports.getEarningsByPeriod = async (req, res) => {
  try {
    const { period = 'daily', startDate, endDate } = req.query;
    
    let start, end, groupFormat;
    
    // Set default end date to today
    end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);
    
    // Set grouping format and start date based on period
    if (period === 'daily') {
      // Default to last 7 days if no start date
      start = startDate ? new Date(startDate) : new Date(end);
      start.setDate(end.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$timestamps.completed' } };
    } else if (period === 'weekly') {
      // Default to last 8 weeks if no start date
      start = startDate ? new Date(startDate) : new Date(end);
      start.setDate(end.getDate() - (8 * 7));
      start.setHours(0, 0, 0, 0);
      
      // Group by week number (week starts on Sunday)
      groupFormat = { 
        year: { $year: '$timestamps.completed' },
        week: { $week: '$timestamps.completed' }
      };
    } else if (period === 'monthly') {
      // Default to last 6 months if no start date
      start = startDate ? new Date(startDate) : new Date(end);
      start.setMonth(end.getMonth() - 5);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      
      // Group by year and month
      groupFormat = { 
        year: { $year: '$timestamps.completed' },
        month: { $month: '$timestamps.completed' }
      };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid period, must be one of: daily, weekly, monthly'
      });
    }
    
    // Aggregate earnings by the specified period
    const earnings = await Ride.aggregate([
      { 
        $match: { 
          status: 'completed',
          'timestamps.completed': { $gte: start, $lte: end }
        } 
      },
      { 
        $group: { 
          _id: groupFormat,
          earnings: { $sum: '$fare.final' },
          count: { $sum: 1 }
        } 
      },
      { $sort: { '_id': 1 } }
    ]);
    
    // Format the response data
    let formattedData;
    
    if (period === 'daily') {
      formattedData = earnings.map(item => ({
        date: item._id,
        earnings: item.earnings,
        count: item.count
      }));
    } else if (period === 'weekly') {
      formattedData = earnings.map(item => ({
        week: `${item._id.year}-W${item._id.week}`,
        earnings: item.earnings,
        count: item.count
      }));
    } else if (period === 'monthly') {
      formattedData = earnings.map(item => ({
        month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
        earnings: item.earnings,
        count: item.count
      }));
    }
    
    res.status(200).json({
      success: true,
      data: {
        period,
        startDate: start,
        endDate: end,
        earnings: formattedData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};