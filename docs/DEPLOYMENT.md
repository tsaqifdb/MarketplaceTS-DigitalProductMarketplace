# Deployment Guide

## Prerequisites
- GitHub repository dengan kode terbaru
- Akun Vercel
- Akun Neon DB atau PostgreSQL database
- Akun Cloudinary
- Akun Brevo untuk email service

## Environment Variables Setup

### Database (Neon DB)
1. Buat database di [Neon Console](https://console.neon.tech/)
2. Copy connection string
3. Set `DATABASE_URL`

### Authentication
1. Generate secret: `openssl rand -base64 32`
2. Set `BETTER_AUTH_SECRET`
3. Set `BETTER_AUTH_URL` dengan domain production

### Email (Brevo)
1. Buat akun di [Brevo](https://www.brevo.com/)
2. Generate API key di Settings > API Keys
3. Set `BREVO_API_KEY` dan `BREVO_FROM_EMAIL`

### File Storage (Cloudinary)
1. Buat akun di [Cloudinary](https://cloudinary.com/)
2. Get credentials dari Dashboard
3. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

## Vercel Deployment

### 1. Connect Repository
```bash
# Push code to GitHub
git add .
git commit -m "Initial backend implementation"
git push origin main
```

### 2. Deploy to Vercel
1. Import project dari GitHub di [Vercel Dashboard](https://vercel.com/dashboard)
2. Select repository
3. Configure environment variables:

```env
DATABASE_URL=postgresql://username:password@host:port/database
BETTER_AUTH_SECRET=your-generated-secret
BETTER_AUTH_URL=https://your-app.vercel.app
BREVO_API_KEY=your-brevo-api-key
BREVO_FROM_EMAIL=noreply@yourdomain.com
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 3. Database Migration
```bash
# Setelah deploy, run migration via Vercel Functions atau locally
npm run db:push
npm run db:seed  # Optional: populate test data
```

## Database Setup (Neon DB)

### 1. Create Database
1. Sign up di [Neon](https://neon.tech/)
2. Create new project
3. Copy connection string
4. Update DATABASE_URL di environment variables

### 2. Schema Migration
```bash
# Local development
npm run db:generate
npm run db:push

# Production (via Vercel Function)
# Create API endpoint untuk migration jika diperlukan
```

## Email Configuration (Brevo)

### 1. Domain Setup
1. Add dan verify domain di Brevo
2. Setup DKIM dan SPF records
3. Configure sender authentication

### 2. Email Templates
Templates sudah built-in di kode dengan styling yang sesuai brand .

## File Storage (Cloudinary)

### 1. Configuration
1. Setup upload presets untuk different file types
2. Configure auto-optimization settings
3. Setup folder structure:
   - `marketplacets/thumbnails/` - Product thumbnails
   - `marketplacets/content/` - Product files
   - `marketplacets/avatars/` - User profile pictures

### 2. Optimization Settings
- Images: Auto WebP conversion, quality auto:good
- Files: Original format preserved
- Thumbnails: Resized to 800x600

## Security Setup

### 1. Environment Variables
- Never commit .env files
- Use Vercel environment variables untuk production
- Separate staging dan production environments

### 2. Database Security
- Use connection pooling
- Enable SSL/TLS
- Regular backup schedule

### 3. API Security
- Rate limiting (implement jika diperlukan)
- Input validation dan sanitization
- CORS configuration
- Authentication middleware

## Monitoring & Analytics

### 1. Vercel Analytics
Enable Vercel Analytics untuk:
- Performance monitoring
- Error tracking
- Usage analytics

### 2. Database Monitoring
Monitor di Neon Console:
- Connection count
- Query performance
- Storage usage

### 3. Error Handling
- Set up error reporting (Sentry recommended)
- Monitor API response times
- Track email delivery rates

## Performance Optimization

### 1. Database
- Index optimization untuk frequently queried fields
- Connection pooling
- Query optimization

### 2. Images
- Cloudinary auto-optimization
- Next.js Image component
- WebP format enforcement

### 3. API
- Response caching dimana appropriate
- Optimize database queries
- Minimize API response size

## Maintenance

### 1. Regular Tasks
- Database backup verification
- Monitor disk usage
- Update dependencies
- Security patches

### 2. Scaling Considerations
- Database connection limits
- File storage quota
- API rate limits
- Email sending limits

## Troubleshooting

### Common Issues

#### Database Connection
```bash
# Test connection
npm run db:studio
```

#### Environment Variables
```bash
# Verify di Vercel dashboard
vercel env ls
```

#### Email Delivery
- Check Brevo logs
- Verify domain authentication
- Test dengan different email providers

#### File Upload
- Check Cloudinary usage limits
- Verify API credentials
- Test upload sizes

### Debug Commands
```bash
# Local development
npm run dev

# Check database schema
npm run db:studio

# Test API endpoints
npm run test  # Jika ada tests

# View logs
vercel logs
```

## Post-Deployment Checklist

### 1. Functionality Testing
- [ ] User registration dan OTP verification
- [ ] Product submission flow
- [ ] Curator review process
- [ ] Order creation dan payment
- [ ] Voucher system
- [ ] Email notifications
- [ ] File uploads

### 2. Performance Testing
- [ ] API response times
- [ ] Database query performance
- [ ] Image loading speeds
- [ ] Email delivery times

### 3. Security Testing
- [ ] Authentication flows
- [ ] Authorization checks
- [ ] Input validation
- [ ] File upload security

### 4. Monitoring Setup
- [ ] Error tracking
- [ ] Performance monitoring
- [ ] Database monitoring
- [ ] Email delivery monitoring

## Support & Documentation

### Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Better Auth Documentation](https://better-auth.com/)

### API Documentation
Tersedia di `docs/BACKEND_API.md` dan `docs/API_TESTING.md`
