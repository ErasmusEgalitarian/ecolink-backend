const { ZodError } = require('zod');

const sensitiveFields = new Set(['password', 'cpf', 'phone', 'token', 'code']);

const sanitizeBody = (body = {}) => Object.fromEntries(
    Object.entries(body).map(([key, value]) => [
        key,
        sensitiveFields.has(key) ? '[REDACTED]' : value
    ])
);

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

                console.warn('Validation error:', {
                    method: req.method,
                    path: req.originalUrl,
                    errors: formattedErrors,
                    body: sanitizeBody(req.body)
                });

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
