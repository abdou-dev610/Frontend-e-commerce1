import AuditLog from '../models/AuditLog.js';

export const logAuditTrail = async (auditData) => {
  try {
    const {
      adminId,
      adminEmail,
      action,
      entityType,
      entityId,
      previousValues = {},
      newValues = {},
      ipAddress = null,
      userAgent = null,
      status = 'success',
      errorMessage = null
    } = auditData;

    const changes = {};
    for (const key in newValues) {
      if (previousValues[key] !== newValues[key]) {
        changes[key] = { from: previousValues[key], to: newValues[key] };
      }
    }

    const log = new AuditLog({
      adminId,
      adminEmail,
      action,
      entityType,
      entityId,
      changes,
      previousValues,
      newValues,
      ipAddress,
      userAgent,
      status,
      errorMessage
    });

    await log.save();
    return log;
  } catch (error) {
    console.error('❌ Error logging audit trail:', error);
    // Ne pas bloquer l'opération si l'audit log échoue
    return null;
  }
};

export const getAuditLogs = async (filters = {}, limit = 50, skip = 0) => {
  try {
    const query = {};
    if (filters.adminId) query.adminId = filters.adminId;
    if (filters.action) query.action = filters.action;
    if (filters.entityType) query.entityType = filters.entityType;
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
    }

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await AuditLog.countDocuments(query);

    return { logs, total };
  } catch (error) {
    console.error('❌ Error fetching audit logs:', error);
    throw error;
  }
};
