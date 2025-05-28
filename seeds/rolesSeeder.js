const Role = require('../models/Role');
const mongoose = require('mongoose');

const ROLE_IDS = {
  ADMIN: new mongoose.Types.ObjectId('683607d382cf7e288f7ca45e'),
  EDITOR: new mongoose.Types.ObjectId('683607d382cf7e288f7ca45f'),
  VIEWER: new mongoose.Types.ObjectId('683607d382cf7e288f7ca460')
};

const createInitialRoles = async () => {
  try {
    const count = await Role.estimatedDocumentCount();
    
    if (count === 0) {
      await Role.create([
        { 
          _id: ROLE_IDS.ADMIN, 
          name: 'Admin', 
          description: 'Administrador geral, tem todas as permissões.' 
        },
        { 
          _id: ROLE_IDS.EDITOR, 
          name: 'Editor', 
          description: 'Catador, pode fazer postagens.' 
        },
        { 
          _id: ROLE_IDS.VIEWER, 
          name: 'Viewer', 
          description: 'Estudante, pode registrar doação e ver postagens.' 
        },
      ]);
      console.log('Roles collection created with initial data!');
    }
  } catch (err) {
    console.error('Error creating initial roles:', err);
  }
};

createInitialRoles();

module.exports = {
  ROLE_IDS
};