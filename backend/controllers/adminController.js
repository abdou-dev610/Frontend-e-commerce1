import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { logAuditTrail } from '../services/auditService.js';

const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

export const getStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      revenueResult,
      monthRevenueResult,
      lastMonthRevenueResult,
      totalUsers,
      ordersByPaymentMethod,
      monthlyRevenue,
      topProducts,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: 'pending' }),
      Order.countDocuments({ orderStatus: 'confirmed' }),
      Order.countDocuments({ orderStatus: 'shipped' }),
      Order.countDocuments({ orderStatus: 'delivered' }),
      Order.countDocuments({ orderStatus: 'cancelled' }),
      Order.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'completed', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'completed', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      User.countDocuments(),
      Order.aggregate([
        { $group: { _id: '$paymentMethod', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
        { $sort: { count: -1 } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'completed', createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Order.aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.name',
            totalQty: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $sort: { totalQty: -1 } },
        { $limit: 5 },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(5),
    ]);

    return res.json({
      totalOrders,
      ordersByStatus: {
        pending: pendingOrders,
        confirmed: confirmedOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },
      totalRevenue: revenueResult[0]?.total || 0,
      monthRevenue: monthRevenueResult[0]?.total || 0,
      lastMonthRevenue: lastMonthRevenueResult[0]?.total || 0,
      totalUsers,
      ordersByPaymentMethod,
      monthlyRevenue: monthlyRevenue.map(item => ({
        month: MONTHS_FR[item._id.month - 1],
        revenue: item.revenue,
        orders: item.orders,
      })),
      topProducts,
      recentOrders,
    });
  } catch (error) {
    console.error('Get Stats Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // ✅ Aggregation pipeline pour éviter le N+1 queries
    const users = await User.aggregate([
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            {
              $lookup: {
                from: 'orders',
                localField: '_id',
                foreignField: 'userId',
                as: 'userOrders'
              }
            },
            {
              $addFields: {
                orderCount: { $size: '$userOrders' },
                totalSpent: {
                  $sum: {
                    $map: {
                      input: {
                        $filter: {
                          input: '$userOrders',
                          as: 'order',
                          cond: { $eq: ['$$order.paymentStatus', 'completed'] }
                        }
                      },
                      as: 'order',
                      in: '$$order.totalAmount'
                    }
                  }
                }
              }
            },
            { $project: { userOrders: 0, password: 0 } },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
          ]
        }
      }
    ]);

    const total = users[0].metadata[0]?.total || 0;
    const usersData = users[0].data;

    return res.json({
      users: usersData,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get Users Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const { id } = req.params;
    const orders = await Order.find({ userId: id }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    console.error('Get User Orders Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const toggleAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.userId) {
      return res.status(400).json({ message: 'Vous ne pouvez pas modifier votre propre rôle' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const previousIsAdmin = user.isAdmin;
    user.isAdmin = !user.isAdmin;
    await user.save();

    // 📋 Log audit
    await logAuditTrail({
      adminId: req.userId,
      adminEmail: req.userEmail,
      action: 'user_admin_toggle',
      entityType: 'user',
      entityId: id,
      previousValues: { isAdmin: previousIsAdmin },
      newValues: { isAdmin: user.isAdmin },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    const userObj = user.toObject();
    delete userObj.password;
    return res.json(userObj);
  } catch (error) {
    console.error('Toggle Admin Error:', error);

    await logAuditTrail({
      adminId: req.userId,
      adminEmail: req.userEmail,
      action: 'user_admin_toggle',
      entityType: 'user',
      entityId: id,
      status: 'failed',
      errorMessage: error.message,
      ipAddress: req.ip
    });

    return res.status(500).json({ message: 'Server error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.userId) {
      return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // ⚠️ Vérifier les commandes non archivées avant suppression
    const orderCount = await Order.countDocuments({ userId: id, archived: { $ne: true } });
    if (orderCount > 0) {
      return res.status(400).json({
        message: `Impossible de supprimer cet utilisateur. Il possède ${orderCount} commande(s). Veuillez d'abord archiver ses commandes.`,
        orderCount
      });
    }

    // Supprimer l'utilisateur
    await User.findByIdAndDelete(id);

    // 📋 Log audit
    await logAuditTrail({
      adminId: req.userId,
      adminEmail: req.userEmail,
      action: 'user_delete',
      entityType: 'user',
      entityId: id,
      previousValues: {
        email: user.email,
        fullName: user.fullName,
        isAdmin: user.isAdmin
      },
      newValues: {},
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    return res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Delete User Error:', error);

    await logAuditTrail({
      adminId: req.userId,
      adminEmail: req.userEmail,
      action: 'user_delete',
      entityType: 'user',
      entityId: id,
      status: 'failed',
      errorMessage: error.message,
      ipAddress: req.ip
    });

    return res.status(500).json({ message: 'Server error' });
  }
};

export const archiveUserOrders = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const result = await Order.updateMany(
      { userId: id, archived: { $ne: true } },
      { $set: { archived: true, updatedAt: new Date() } }
    );

    await logAuditTrail({
      adminId: req.userId,
      adminEmail: req.userEmail,
      action: 'orders_archived',
      entityType: 'user',
      entityId: id,
      previousValues: { archivedCount: 0 },
      newValues: { archivedCount: result.modifiedCount },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    return res.json({
      message: `${result.modifiedCount} commande(s) archivée(s) avec succès`,
      archivedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Archive User Orders Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getAdminProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const products = await Product.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments();

    return res.json({
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get Admin Products Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const { getAuditLogs: fetchLogs } = await import('../services/auditService.js');

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const { logs, total } = await fetchLogs({
      adminId: req.query.adminId,
      action: req.query.action,
      entityType: req.query.entityType,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    }, limit, skip);

    return res.json({
      logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get Audit Logs Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
