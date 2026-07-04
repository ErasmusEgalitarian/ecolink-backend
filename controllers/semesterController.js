const mongoose = require('mongoose');
const Semester = require('../models/Semester');
const Donation = require('../models/Donation');
const User = require('../models/User');

const findCurrentSemester = (now = new Date()) =>
    Semester.findOne({ startDate: { $lte: now }, endDate: { $gt: now } });

const MATERIAL_TYPES = ['metal', 'paper', 'plastic', 'glass'];

const computeSemesterDonationStats = async (semester) => {
    const result = await Donation.aggregate([
        {
            $match: {
                donationDate: { $gte: semester.startDate, $lt: semester.endDate },
            },
        },
        {
            $group: {
                _id: '$materialType',
                quantity: { $sum: '$qtdMaterial' },
            },
        },
    ]);

    const quantityByType = Object.fromEntries(
        result.map((row) => [row._id, row.quantity])
    );

    const totalQuantity = MATERIAL_TYPES.reduce(
        (sum, materialType) => sum + (quantityByType[materialType] || 0),
        0
    );

    const materials = MATERIAL_TYPES.map((materialType) => {
        const quantity = quantityByType[materialType] || 0;
        const percentage = totalQuantity > 0
            ? Math.round((quantity / totalQuantity) * 100)
            : 0;

        return { materialType, quantity, percentage };
    });

    return {
        semesterId: semester._id,
        name: semester.name,
        year: semester.year,
        period: semester.period,
        startDate: semester.startDate,
        endDate: semester.endDate,
        totalQuantity,
        materials,
    };
};

const computeProgress = async (userId, semester) => {
    const result = await Donation.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                donationDate: { $gte: semester.startDate, $lt: semester.endDate },
            },
        },
        { $group: { _id: null, total: { $sum: '$qtdMaterial' } } },
    ]);

    const donatedAmount = result[0]?.total || 0;
    const goalAmount = semester.goalAmount;
    const percentage = goalAmount > 0
        ? Math.min(Math.round((donatedAmount / goalAmount) * 100), 100)
        : 0;

    return {
        semesterId: semester._id,
        name: semester.name,
        year: semester.year,
        period: semester.period,
        startDate: semester.startDate,
        endDate: semester.endDate,
        donatedAmount,
        goalAmount,
        percentage,
        reachedGoal: donatedAmount >= goalAmount,
    };
};

const createSemester = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate('roleId');
        if (user?.roleId?.name !== 'Admin') {
            return res.status(403).json({ success: false, message: 'Only admins can create semesters' });
        }

        const { year, period, name, startDate, endDate, goalAmount } = req.body;

        const exists = await Semester.findOne({ year, period });
        if (exists) {
            return res.status(409).json({
                success: false,
                message: `Semester ${year}.${period} already exists`,
            });
        }

        const semester = await Semester.create({ year, period, name, startDate, endDate, goalAmount });
        res.status(201).json({ success: true, message: 'Semester created successfully', data: semester });
    } catch (error) {
        console.error('Error creating semester:', error);
        next(error);
    }
};

const getSemesters = async (req, res, next) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const semesters = await Semester.find().sort({ year: -1, period: -1 });

        const donatedNames = [];
        for (const semester of semesters) {
            const count = await Donation.countDocuments({
                userId,
                donationDate: { $gte: semester.startDate, $lt: semester.endDate },
            });
            if (count > 0) donatedNames.push(semester.name);
        }

        res.status(200).json({ success: true, data: donatedNames });
    } catch (error) {
        console.error('Error fetching semesters:', error);
        next(error);
    }
};

const getCurrentSemester = async (req, res, next) => {
    try {
        const semester = await findCurrentSemester();
        if (!semester) {
            return res.status(404).json({ success: false, message: 'No active semester found' });
        }
        res.status(200).json({ success: true, data: semester });
    } catch (error) {
        console.error('Error fetching current semester:', error);
        next(error);
    }
};

const getCurrentProgress = async (req, res, next) => {
    try {
        const semester = await findCurrentSemester();
        if (!semester) {
            return res.status(404).json({ success: false, message: 'No active semester found' });
        }
        const progress = await computeProgress(req.user.id, semester);
        res.status(200).json({ success: true, data: progress });
    } catch (error) {
        console.error('Error fetching current progress:', error);
        next(error);
    }
};

const getCurrentDonationStats = async (req, res, next) => {
    try {
        const semester = await findCurrentSemester();
        if (!semester) {
            return res.status(404).json({ success: false, message: 'No active semester found' });
        }
        const stats = await computeSemesterDonationStats(semester);
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        console.error('Error fetching current donation stats:', error);
        next(error);
    }
};

const getAllProgress = async (req, res, next) => {
    try {
        const semesters = await Semester.find().sort({ year: -1, period: -1 });
        const progress = await Promise.all(
            semesters.map(s => computeProgress(req.user.id, s))
        );
        res.status(200).json({ success: true, data: progress });
    } catch (error) {
        console.error('Error fetching progress history:', error);
        next(error);
    }
};

const getSemesterProgress = async (req, res, next) => {
    try {
        const semester = await Semester.findById(req.params.id);
        if (!semester) {
            return res.status(404).json({ success: false, message: 'Semester not found' });
        }
        const progress = await computeProgress(req.user.id, semester);
        res.status(200).json({ success: true, data: progress });
    } catch (error) {
        console.error('Error fetching semester progress:', error);
        next(error);
    }
};

module.exports = {
    createSemester,
    getSemesters,
    getCurrentSemester,
    getCurrentProgress,
    getCurrentDonationStats,
    getAllProgress,
    getSemesterProgress,
};
