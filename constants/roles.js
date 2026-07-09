const mongoose = require('mongoose');

const EDITOR_ROLE_ID = '683607d382cf7e288f7ca45f';
const ADMIN_ROLE_ID = '683607d382cf7e288f7ca45e';
const VIEWER_ROLE_ID = '683607d382cf7e288f7ca460';

module.exports = {
    EDITOR_ROLE_ID,
    ADMIN_ROLE_ID,
    VIEWER_ROLE_ID,
    ROLE_IDS: {
        ADMIN: new mongoose.Types.ObjectId(ADMIN_ROLE_ID),
        EDITOR: new mongoose.Types.ObjectId(EDITOR_ROLE_ID),
        VIEWER: new mongoose.Types.ObjectId(VIEWER_ROLE_ID),
    },
};
