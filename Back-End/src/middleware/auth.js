const { User, RolePermission } = require('../models');
const { verifyToken } = require('../utils/jwt');

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const decoded = verifyToken(token);
    const user = await User.findByPk(decoded.sub);

    if (!user || user.status !== 'Active') {
      return res.status(401).json({ success: false, message: 'Invalid or inactive account' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You do not have permission for this action' });
    }
    return next();
  };
}

function authorizeCompany(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  if (!req.user.companyId || String(req.user.companyId) !== String(req.params.companyId)) {
    return res.status(403).json({ success: false, message: 'You cannot access another restaurant' });
  }
  return next();
}

function authorizePermission(...permissions) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }
      const allowedCount = await RolePermission.count({
        where: { role: req.user.role, permission: permissions, allowed: true },
      });
      if (allowedCount !== permissions.length) {
        return res.status(403).json({ success: false, message: `Missing permission: ${permissions.join(', ')}` });
      }
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = {
  authenticate,
  authorize,
  authorizeCompany,
  authorizePermission,
};
