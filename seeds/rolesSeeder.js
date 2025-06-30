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
          description: 'General administrator, has all permissions.' 
        },
        { 
          _id: ROLE_IDS.EDITOR, 
          name: 'Editor', 
          description: 'Collector, you can make posts.' 
        },
        { 
          _id: ROLE_IDS.VIEWER, 
          name: 'Viewer', 
          description: 'Student, can register donation and view posts.' 
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