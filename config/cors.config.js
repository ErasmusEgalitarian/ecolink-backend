const getAllowedOrigins = () => {
  const originsEnv = process.env.ALLOWED_ORIGINS || '';
  
  if (!originsEnv) {
    return [];
  }

  return originsEnv
    .split(',')
    .map(origin => origin.trim())
    .filter(origin => origin.length > 0);
};

const corsOptions = {
  origin: (origin, callback) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      return callback(null, true);
    }

    const allowedOrigins = getAllowedOrigins();
    
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
};

module.exports = corsOptions;