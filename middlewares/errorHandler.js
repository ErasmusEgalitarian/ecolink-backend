/**
 * Global Error Handling Middleware
 * Captura todos os erros não tratados e loga no console
 */

const errorHandler = (err, req, res, next) => {
    // Log completo do erro no console do servidor
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ ERROR CAUGHT BY GLOBAL HANDLER');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('📍 Endpoint:', req.method, req.originalUrl);
    console.error('⏰ Timestamp:', new Date().toISOString());
    console.error('👤 User:', req.user?.id || 'Not authenticated');
    console.error('📦 Body:', JSON.stringify(req.body, null, 2));
    console.error('🔍 Error Details:');
    console.error(err);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Determina o status code
    const statusCode = err.statusCode || err.status || 500;
    
    // Monta a resposta de erro
    const errorResponse = {
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            error: err
        })
    };

    // Envia resposta ao cliente
    res.status(statusCode).json(errorResponse);
};

/**
 * Middleware para capturar rotas não encontradas (404)
 */
const notFoundHandler = (req, res, next) => {
    const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
    error.statusCode = 404;
    
    console.warn('⚠️  404 NOT FOUND:', req.method, req.originalUrl);
    
    next(error);
};

module.exports = { errorHandler, notFoundHandler };
