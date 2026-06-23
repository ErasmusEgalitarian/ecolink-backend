const { z } = require('zod');

const createSemesterSchema = z.object({
    year: z.number({
        required_error: 'Year is required',
        invalid_type_error: 'Year must be a number'
    })
    .int('Year must be an integer')
    .min(2026, 'Year must be 2026 or later'),

    period: z.number({
        required_error: 'Period is required',
        invalid_type_error: 'Period must be a number'
    })
    .int('Period must be an integer')
    .refine(v => [1, 2, 3, 4].includes(v), 'Period must be 1, 2, 3 or 4'),

    name: z.string({ required_error: 'Name is required' })
        .min(1, 'Name cannot be empty')
        .trim(),

    startDate: z.coerce.date({
        required_error: 'startDate is required',
        invalid_type_error: 'startDate must be a valid date'
    }),

    endDate: z.coerce.date({
        required_error: 'endDate is required',
        invalid_type_error: 'endDate must be a valid date'
    }),

    goalAmount: z.number({
        required_error: 'goalAmount is required',
        invalid_type_error: 'goalAmount must be a number'
    })
    .positive('goalAmount must be a positive number'),
}).refine(data => data.endDate > data.startDate, {
    message: 'endDate must be after startDate',
    path: ['endDate'],
});

module.exports = { createSemesterSchema };
