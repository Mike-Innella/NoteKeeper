// Security middleware and configurations
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss";

// Rate limiting configurations for different endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many authentication attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 requests per hour for sensitive operations
  message: "Rate limit exceeded for this operation",
  standardHeaders: true,
  legacyHeaders: false,
});

// XSS sanitization function
export function sanitizeInput(input) {
  if (typeof input === 'string') {
    // Remove any script tags and dangerous HTML
    return xss(input, {
      whiteList: {}, // No HTML tags allowed
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script']
    });
  }
  return input;
}

// Sanitize request body middleware
export function sanitizeRequestBody(req, res, next) {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    });
  }
  next();
}

// MongoDB injection prevention (for future use if switching to MongoDB)
export const mongoSanitization = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`[Security] Attempted NoSQL injection sanitized in ${key}`);
  }
});

// Content Security Policy configuration
export const cspConfig = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", process.env.CORS_ORIGIN || "http://localhost:5173"],
    objectSrc: ["'none'"],
    mediaSrc: ["'none'"],
    frameSrc: ["'none'"],
    sandbox: ['allow-forms', 'allow-scripts', 'allow-same-origin'],
    reportUri: '/api/csp-report',
    upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
  },
  reportOnly: false // Set to true initially to test without blocking
};

// Security headers configuration
export const securityHeaders = {
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: false,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true
};

// Token blacklist for logout functionality (in-memory for now)
const tokenBlacklist = new Set();

export function blacklistToken(token) {
  tokenBlacklist.add(token);
  // Clean up expired tokens periodically
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, 7 * 24 * 60 * 60 * 1000); // Remove after 7 days
}

export function isTokenBlacklisted(token) {
  return tokenBlacklist.has(token);
}

// Security logging middleware
export function securityLogger(req, res, next) {
  const securityEvents = ['login', 'register', 'logout', 'password-change'];
  const path = req.path.toLowerCase();
  
  if (securityEvents.some(event => path.includes(event))) {
    const logData = {
      timestamp: new Date().toISOString(),
      ip: req.ip || req.connection.remoteAddress,
      method: req.method,
      path: req.path,
      userAgent: req.headers['user-agent'],
      userId: req.user?.userId || 'anonymous'
    };
    
    console.log('[Security Event]', JSON.stringify(logData));
  }
  
  next();
}

// Input length validation
export function validateInputLength(maxLength = 10000) {
  return (req, res, next) => {
    if (req.body) {
      for (const [key, value] of Object.entries(req.body)) {
        if (typeof value === 'string' && value.length > maxLength) {
          return res.status(400).json({ 
            error: `Input ${key} exceeds maximum length of ${maxLength} characters` 
          });
        }
      }
    }
    next();
  };
}

// SQL injection prevention helpers (already using parameterized queries, but adding extra validation)
export function validateSQLInput(input) {
  // Check for common SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE)\b)/gi,
    /(--|#|\/\*|\*\/)/g,
    /(\bOR\b\s*\d+\s*=\s*\d+)/gi,
    /(\bAND\b\s*\d+\s*=\s*\d+)/gi,
  ];
  
  if (typeof input === 'string') {
    for (const pattern of sqlPatterns) {
      if (pattern.test(input)) {
        console.warn('[Security] Potential SQL injection attempt blocked:', input);
        return false;
      }
    }
  }
  return true;
}
