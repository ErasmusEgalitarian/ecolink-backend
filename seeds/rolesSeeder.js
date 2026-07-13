const Role = require('../models/Role');
const { ROLE_IDS } = require('../constants/roles');

const INITIAL_ROLES = [
    {
        _id: ROLE_IDS.ADMIN,
        name: 'Admin',
        description: 'General administrator, has all permissions.',
    },
    {
        _id: ROLE_IDS.EDITOR,
        name: 'Editor',
        description: 'Collector, you can make posts.',
    },
    {
        _id: ROLE_IDS.VIEWER,
        name: 'Viewer',
        description: 'Student, can register donation and view posts.',
    },
];

const seedRoles = async () => {
    try {
        for (const role of INITIAL_ROLES) {
            await Role.updateOne(
                { _id: role._id },
                { $set: { name: role.name, description: role.description } },
                { upsert: true }
            );
        }
        console.log(`Roles ensured: ${INITIAL_ROLES.map((r) => r.name).join(', ')}`);
    } catch (err) {
        console.error('Error seeding roles:', err);
        throw err;
    }
};

module.exports = seedRoles;
