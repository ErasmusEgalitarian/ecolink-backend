const mongoose = require('mongoose');

const SemesterSchema = new mongoose.Schema(
    {
        year: { type: Number, required: true, min: 2026 },
        period: { type: Number, required: true, enum: [1, 2, 3, 4] },
        name: { type: String, required: true, trim: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        goalAmount: { type: Number, required: true, min: 1 },
    },
    { timestamps: true }
);

SemesterSchema.index({ year: 1, period: 1 }, { unique: true });

SemesterSchema.pre('validate', function (next) {
    if (this.startDate && this.endDate && this.endDate <= this.startDate) {
        this.invalidate('endDate', 'endDate must be after startDate');
    }
    next();
});

module.exports = mongoose.model('Semester', SemesterSchema, 'semesters');
