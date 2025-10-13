# Security Configuration Guide

## 🔒 Security Features Implemented

### 1. **Rate Limiting**
- **Authentication endpoints**: Limited to 5 attempts per 15 minutes
- **General API**: Limited to 100 requests per 15 minutes
- **Sensitive operations**: Limited to 10 requests per hour

### 2. **Input Validation & Sanitization**
- XSS protection via input sanitization
- SQL injection prevention with parameterized queries
- Input length validation (10,000 character limit)
- Email and password validation using express-validator

### 3. **Authentication & Authorization**
- JWT tokens with configurable expiration (default: 7 days)
- Token blacklisting for logout functionality
- Bcrypt password hashing with salt rounds of 12
- Token verification on all protected routes

### 4. **Security Headers**
- Helmet.js for comprehensive HTTP security headers
- Content Security Policy (CSP) configured
- HSTS (HTTP Strict Transport Security) enabled
- X-Frame-Options: DENY to prevent clickjacking
- X-Content-Type-Options: nosniff
- Referrer Policy: strict-origin-when-cross-origin

### 5. **CORS Configuration**
- Whitelist of allowed origins
- Credentials support with strict origin checking

### 6. **Data Protection**
- Environment variables for sensitive configuration
- No hardcoded secrets in codebase
- Database connection uses SSL in production
- Payload size limit (10MB) to prevent DoS attacks

### 7. **Security Logging**
- Security events logged (login, register, logout, password changes)
- IP address and user agent tracking for audit trails

## 📋 Environment Variables Required

Create a `.env` file in the backend directory with:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES=7d

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# Optional: Render deployment
RENDER=true
```

## 🚀 Security Best Practices

### For Development
1. Never commit `.env` files to version control
2. Use different JWT secrets for development and production
3. Enable debug logging to monitor security events
4. Test rate limiting with tools like Apache Bench

### For Production
1. **Environment Variables**:
   - Use strong, randomly generated JWT_SECRET (minimum 32 characters)
   - Set NODE_ENV=production
   - Configure proper CORS_ORIGIN

2. **Database Security**:
   - Always use SSL connections (sslmode=require)
   - Use connection pooling with proper limits
   - Implement database user with minimal required permissions

3. **Token Management**:
   - Consider reducing JWT expiration time for sensitive applications
   - Implement refresh token mechanism for better security
   - Clear tokens on client-side logout

4. **Monitoring**:
   - Set up alerts for multiple failed authentication attempts
   - Monitor rate limit violations
   - Track security event logs

5. **Additional Recommendations**:
   - Use HTTPS only in production
   - Implement 2FA for sensitive operations
   - Regular security audits with npm audit
   - Keep dependencies updated

## 🛡️ Security Checklist for Deployment

- [ ] Strong JWT_SECRET configured
- [ ] Database using SSL connection
- [ ] NODE_ENV set to production
- [ ] CORS properly configured
- [ ] Rate limiting tested and configured
- [ ] Security headers verified (use securityheaders.com)
- [ ] No sensitive data in logs
- [ ] Error messages don't leak system information
- [ ] Dependencies are up to date (npm audit)
- [ ] HTTPS enforced on production server

## 🔍 Testing Security

### Rate Limiting Test
```bash
# Test authentication rate limiting (should block after 5 attempts)
for i in {1..10}; do
  curl -X POST http://localhost:5000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' &
done
```

### Security Headers Test
```bash
# Check security headers
curl -I http://localhost:5000
```

### Input Sanitization Test
```bash
# Test XSS prevention
curl -X POST http://localhost:5000/notes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"<script>alert(1)</script>","content":"test"}'
```

## 📞 Security Incident Response

If you discover a security vulnerability:

1. **Do not** create a public GitHub issue
2. Email security concerns to the maintainer
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)

## 🔄 Regular Maintenance

### Weekly
- Check for npm security updates: `npm audit`
- Review security logs for anomalies

### Monthly
- Update dependencies: `npm update`
- Review and rotate API keys/secrets
- Test backup and recovery procedures

### Quarterly
- Full security audit
- Penetration testing (if applicable)
- Review and update security policies

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)
