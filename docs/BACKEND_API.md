# Backend API Documentation

## Overview
adalah platform marketplace digital untuk menjual produk digital seperti ebook, ecourse, resep masakan, jasa design, dan software. Backend dibangun menggunakan Next.js 15 dengan App Router, Drizzle ORM, PostgreSQL, dan Better Auth.

## Tech Stack
- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL (Neon DB)
- **ORM**: Drizzle ORM
- **Authentication**: Better Auth
- **File Storage**: Cloudinary
- **Email**: Brevo
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Font**: Poppins

## Database Schema

### Users
- **Roles**: client, seller, curator, admin
- **Fields**: id, email, password, name, role, isEmailVerified, sellerPoints, curatorPoints
- **Points System**: 
  - Seller: submit (2), approved (10), rejected (5)
  - Curator: review completion based on category

### Products
- **Categories**: ebook, ecourse, resep_masakan, jasa_design, software
- **Status**: pending, approved, rejected
- **Fields**: id, sellerId, title, description, category, price, thumbnailUrl, contentUrl, status, reviewScore

### Product Reviews (Curator Reviews)
- **8 Questions System**: 
  1. Originality and copyright compliance
  2. Description clarity and completeness  
  3. Thumbnail attractiveness and representation
  4. Content quality
  5. Information accuracy and relevance
  6. Product uniqueness vs similar products
  7. High sales potential
  8. Clear license and instructions
- **Scoring**: 1-5 per question, average calculated, minimum 2.8 to pass
- **Points**: Ebook/Ecourse (300), Others (200)

### Redeemable Products
- **Creation**: Curators can exchange activity points for redeemable products
- **Types**: Various categories of digital and physical products
- **Usage**: Redemption with expiration and stock management

## API Endpoints

### Authentication
```
POST /api/auth/register - Register new user with OTP
POST /api/auth/verify-otp - Verify email with OTP code
POST /api/auth/resend-otp - Resend OTP code
GET/POST /api/auth/[...all] - Better Auth handlers
```

### Products
```
POST /api/products - Submit new product (seller)
GET /api/products - Get products with filters
PATCH /api/products/[id] - Update product
```

### Reviews
```
POST /api/reviews - Submit curator review
GET /api/reviews - Get reviews by product/curator
```

### Customer Reviews
```
POST /api/customer-reviews - Add customer rating/comment
GET /api/customer-reviews - Get customer reviews
PATCH /api/customer-reviews - Update review
DELETE /api/customer-reviews - Delete review
```

### Orders
```
POST /api/orders - Create new order with voucher support
GET /api/orders - Get orders by user/status
PATCH /api/orders - Update payment status
```

### Redeemable Products
```
GET /api/redeemable-products - Get redeemable products
POST /api/redeemable-products - Create redeemable product (admin)
GET /api/redeemable-products/[id] - Get specific redeemable product
PATCH /api/redeemable-products/[id] - Update redeemable product
DELETE /api/redeemable-products/[id] - Delete redeemable product
POST /api/redeem-products - Redeem product with activity points (curator)
GET /api/redeem-products - Get redeemed products history
```

### Analytics
```
GET /api/analytics - Dashboard analytics by role
```

## User Roles & Permissions

### Client
- Browse and purchase products
- Leave reviews on purchased products
- View order history
- Manage profile

### Seller
- Submit products for review
- View product status and reviews
- Track earnings and points
- Manage product listings

### Curator
- Review submitted products (8-question system)
- Approve/reject based on 2.8+ average score
- Earn activity points for reviews
- Exchange activity points for redeemable products

### Admin
- All seller + curator permissions
- View analytics and reports
- Manage users and system

## Points System

### Seller Points
- Submit product: +2 points
- Product approved: +10 points  
- Product rejected: +5 points

### Curator Activity Points (per review)
- Ebook: 300 activity points
- Ecourse: 300 activity points
- Resep Masakan: 200 activity points
- Jasa Design: 200 activity points
- Software: 200 activity points

## Review Scoring System

### 8 Evaluation Questions
1. **Originality**: Copyright compliance (1-5)
2. **Description**: Clarity and completeness (1-5)
3. **Thumbnail**: Visual appeal and representation (1-5)  
4. **Content Quality**: Overall quality assessment (1-5)
5. **Information Accuracy**: Factual and relevant content (1-5)
6. **Uniqueness**: Differentiation from competitors (1-5)
7. **Sales Potential**: Market viability (1-5)
8. **Documentation**: Clear license and instructions (1-5)

### Calculation
- Total Score = Sum of all 8 scores
- Average Score = Total Score ÷ 8
- **Pass Threshold**: ≥ 2.8 average
- Result: Average ≥ 2.8 → Approved, < 2.8 → Rejected

## File Upload System

### Cloudinary Integration
- **Thumbnails**: Optimized to 800x600, WebP format
- **Content Files**: Original format preserved
- **Folders**: Organized by type (thumbnails, content)

## Email System

### Brevo Integration
- **OTP Verification**: 6-digit codes, 10-minute expiry
- **Password Reset**: Secure token-based reset
- **Notifications**: Order confirmations, review notifications

## Environment Variables
```env
DATABASE_URL=postgres://...
BETTER_AUTH_SECRET=your-secret
BETTER_AUTH_URL=http://localhost:3000
BREVO_API_KEY=your-brevo-key
BREVO_FROM_EMAIL=noreply@marketplacets.com
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database Commands
```bash
# Generate migrations
npm run db:generate

# Apply migrations  
npm run db:migrate

# Push schema changes
npm run db:push

# Open Drizzle Studio
npm run db:studio
```

## Development Setup
1. Install dependencies: `npm install`
2. Set up environment variables in `.env.local`
3. Generate and apply database migrations
4. Start development server: `npm run dev`

## Deployment
- **Frontend + Backend**: Vercel
- **Database**: Neon DB
- **File Storage**: Cloudinary
- **Email**: Brevo

## API Response Format
```json
{
  "message": "Success message",
  "data": { /* response data */ },
  "error": "Error message (if any)"
}
```

## Error Handling
- Standardized error responses
- Input validation
- Database constraint enforcement
- File upload error handling
- Email delivery error handling
