const Semester = require('../models/Semester');

const SEMESTERS = [
    {
        year: 2026,
        period: 1,
        name: '2026.1',
        startDate: new Date('2026-03-16'),
        endDate: new Date('2026-07-19'),
        goalAmount: 200,
    },
    {
        year: 2026,
        period: 2,
        name: '2026.2',
        startDate: new Date('2026-08-10'),
        endDate: new Date('2026-12-15'),
        goalAmount: 200,
    },
    {
        year: 2026,
        period: 4,
        name: '2026.4',
        startDate: new Date('2027-01-11'),
        endDate: new Date('2027-02-18'),
        goalAmount: 200,
    },
];

const seedSemesters = async () => {
    try {
        for (const data of SEMESTERS) {
            const exists = await Semester.findOne({ year: data.year, period: data.period });
            if (!exists) {
                await Semester.create(data);
                console.log(`Semester ${data.name} created.`);
            }
        }
    } catch (err) {
        console.error('Error seeding semesters:', err);
    }
};

seedSemesters();

module.exports = { seedSemesters };
