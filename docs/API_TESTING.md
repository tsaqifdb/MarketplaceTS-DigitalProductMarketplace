# API Testing Guide

## Prerequisites
1. Database sudah di-setup dengan `npm run db:push`
2. Environment variables sudah dikonfigurasi
3. Server berjalan dengan `npm run dev`

## Testing dengan cURL

### 1. Authentication

#### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "role": "seller"
  }'
```

#### Verify OTP
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

#### Resend OTP
```bash
curl -X POST http://localhost:3000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

### 2. Products

#### Submit Product (Seller)
```bash
curl -X POST http://localhost:3000/api/products \
  -F "sellerId=user-id-here" \
  -F "title=My Awesome Ebook" \
  -F "description=This is a great ebook about programming" \
  -F "category=ebook" \
  -F "price=99000" \
  -F "thumbnail=@/path/to/thumbnail.jpg" \
  -F "content=@/path/to/ebook.pdf"
```

#### Get Products
```bash
# All products
curl -X GET http://localhost:3000/api/products

# Filter by seller
curl -X GET "http://localhost:3000/api/products?sellerId=user-id-here"

# Filter by status
curl -X GET "http://localhost:3000/api/products?status=pending"

# Filter by category
curl -X GET "http://localhost:3000/api/products?category=ebook"
```

### 3. Reviews (Curator)

#### Submit Product Review
```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "product-id-here",
    "curatorId": "curator-id-here",
    "scores": [4, 5, 3, 4, 5, 3, 4, 5],
    "comments": "Good product with some areas for improvement"
  }'
```

#### Get Reviews
```bash
# By product
curl -X GET "http://localhost:3000/api/reviews?productId=product-id-here"

# By curator
curl -X GET "http://localhost:3000/api/reviews?curatorId=curator-id-here"
```

### 4. Orders

#### Create Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-id-here",
    "productId": "product-id-here",
    "paymentMethod": "bank_transfer"
  }'
```

#### Update Payment Status
```bash
curl -X PATCH http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order-id-here",
    "paymentStatus": "completed",
    "transactionId": "TXN-123456789"
  }'
```

#### Get Orders
```bash
# By customer
curl -X GET "http://localhost:3000/api/orders?customerId=customer-id-here"

# By payment status
curl -X GET "http://localhost:3000/api/orders?paymentStatus=completed"
```

### 5. Redeemable Products

#### Get Redeemable Products
```bash
# All products
curl -X GET "http://localhost:3000/api/redeemable-products"

# Active products only
curl -X GET "http://localhost:3000/api/redeemable-products?isActive=true"
```

#### Get Specific Redeemable Product
```bash
curl -X GET "http://localhost:3000/api/redeemable-products/product-id-here"
```

#### Create Redeemable Product (Admin)
```bash
curl -X POST http://localhost:3000/api/redeemable-products \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Premium Ebook Bundle",
    "description": "Collection of 5 premium ebooks",
    "category": "digital",
    "pointsCost": 500,
    "stock": 10,
    "thumbnailUrl": "https://example.com/thumbnail.jpg",
    "contentUrl": "https://example.com/content.pdf"
  }'
```

#### Redeem Product (Curator)
```bash
curl -X POST http://localhost:3000/api/redeem-products \
  -H "Content-Type: application/json" \
  -d '{
    "curatorId": "curator-id-here",
    "redeemableProductId": "product-id-here"
  }'
```

#### Get Redeemed Products History
```bash
curl -X GET "http://localhost:3000/api/redeem-products?curatorId=curator-id-here"
```

### 6. Customer Reviews

#### Add Customer Review
```bash
curl -X POST http://localhost:3000/api/customer-reviews \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "product-id-here",
    "customerId": "customer-id-here",
    "rating": 5,
    "comment": "Excellent product! Highly recommended."
  }'
```

#### Update Customer Review
```bash
curl -X PATCH http://localhost:3000/api/customer-reviews \
  -H "Content-Type: application/json" \
  -d '{
    "reviewId": "review-id-here",
    "rating": 4,
    "comment": "Updated review comment"
  }'
```

#### Get Customer Reviews
```bash
# By product
curl -X GET "http://localhost:3000/api/customer-reviews?productId=product-id-here"

# By customer
curl -X GET "http://localhost:3000/api/customer-reviews?customerId=customer-id-here"
```

### 7. Analytics

#### Get Dashboard Analytics
```bash
# General overview
curl -X GET http://localhost:3000/api/analytics

# Seller specific
curl -X GET "http://localhost:3000/api/analytics?role=seller&userId=seller-id-here"

# Curator specific
curl -X GET "http://localhost:3000/api/analytics?role=curator&userId=curator-id-here"

# Client specific
curl -X GET "http://localhost:3000/api/analytics?role=client&userId=client-id-here"
```

## Response Examples

### Success Response
```json
{
  "message": "Operation successful",
  "data": { /* relevant data */ }
}
```

### Error Response
```json
{
  "error": "Error message describing what went wrong"
}
```

### Product Review Response
```json
{
  "message": "Produk telah di-review dan approved",
  "review": {
    "id": "review-id",
    "averageScore": "4.12",
    "totalScore": "33"
  },
  "productStatus": "approved",
  "averageScore": 4.12,
  "curatorPointsEarned": 300
}
```

### Order Response
```json
{
  "message": "Order berhasil dibuat",
  "order": {
    "id": "order-id",
    "amount": "99000"
  }
}
```

## Testing Workflow

### Complete User Journey
1. **Register** → Verify OTP → Login
2. **Seller**: Submit product → Wait for review
3. **Curator**: Review product → Earn activity points
4. **Curator**: Redeem product with activity points
5. **Client**: Browse products → Create order
6. **Client**: Complete payment → Leave review
7. **Admin**: View analytics

### Test Data Generation
```bash
# Run seeder to populate test data
npm run db:seed
```

This will create:
- Sample users (admin, seller, curator, client)
- Sample products in different categories
- Sample reviews and ratings
- Test data for all user roles

## Common Error Codes
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (not logged in)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error (server issues)
