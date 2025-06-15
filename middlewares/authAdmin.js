const verifyToken = require('./authMiddleware');
const mongoose   = require('mongoose');
const User       = require('../models/User');

module.exports = (req, res, next) => {
  verifyToken(req, res, async () => {
    try {
      const user = await User.findById(req.user.id).lean();
      if (!user) {
        return res.status(401).json({ message: 'Usuário não encontrado' });
      }
      if (!user.roleId) {
        return res.status(401).json({ message: 'roleId não configurado no usuário' });
      }

      const roleDoc = await mongoose
        .connection
        .db
        .collection('roles')
        .findOne({ _id: new mongoose.Types.ObjectId(user.roleId) });

      if (!roleDoc) {
        return res.status(401).json({ message: 'Role não encontrada' });
      }
      if (roleDoc.name !== 'Admin') {
        return res.status(403).json({ message: 'Acesso negado: apenas Admin' });
      }

      next();
    } catch (err) {
      console.error('authorizeAdmin:', err);
      res.status(500).json({ message: 'Erro interno ao verificar permissão' });
    }
  });
};
