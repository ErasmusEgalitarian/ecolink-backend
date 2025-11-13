const { ZodError } = require('zod');

/**
 * Middleware validation Zod
 * @param {import('zod').ZodSchema} schema 
 * @returns {Function} 
 */
const validate = (schema) => {
    return (req, res, next) => {
        try {
            const validatedData = schema.parse(req.body);
            
            req.body = validatedData;
            
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = error.issues?.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                })) || [];

                return res.status(400).json({
                    message: 'Validation error',
                    errors: formattedErrors
                });
            }

            console.error('Validation middleware error:', error);
            return res.status(500).json({
                message: 'Internal server error during validation',
                error: error.message
            });
        }
    };
};

module.exports = validate;
