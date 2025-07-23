import { pgTable, text, integer, timestamp, boolean, decimal, uuid, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['client', 'seller', 'curator', 'admin']);
export const genderEnum = pgEnum('gender', ['male', 'female']);
export const productCategoryEnum = pgEnum('product_category', ['ebook', 'ecourse', 'resep_masakan', 'jasa_design', 'software']);
export const productStatusEnum = pgEnum('product_status', ['pending', 'approved', 'rejected']);
export const reviewStatusEnum = pgEnum('review_status', ['pending', 'completed']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  gender: genderEnum('gender'),
  role: userRoleEnum('role').notNull().default('client'),
  isEmailVerified: boolean('is_email_verified').default(false),
  emailVerificationToken: text('email_verification_token'),
  sellerPoints: integer('seller_points').default(0),
  curatorPoints: integer('curator_points').default(0),
  isCuratorApproved: boolean('is_curator_approved').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// NextAuth required tables (from @auth/drizzle-adapter)
export const accounts = pgTable("accounts", {
    userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<"oauth" | "oidc" | "email">().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
})

export const sessions = pgTable("sessions", {
    sessionToken: text("sessionToken").notNull().primaryKey(),
    userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable("verification_tokens", {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
})

// Products table
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  sellerId: uuid('seller_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: productCategoryEnum('category').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').default(0),
  thumbnailUrl: text('thumbnail_url'),
  contentUrl: text('content_url'),
  status: productStatusEnum('status').default('pending'),
  reviewScore: decimal('review_score', { precision: 4, scale: 2 }), // Max 5.00
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Product Reviews table (for curator reviews)
export const productReviews = pgTable('product_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id),
  curatorId: uuid('curator_id').notNull().references(() => users.id),
  question1Score: integer('question1_score').notNull(), // Originality
  question2Score: integer('question2_score').notNull(), // Description clarity
  question3Score: integer('question3_score').notNull(), // Thumbnail quality
  question4Score: integer('question4_score').notNull(), // Content quality
  question5Score: integer('question5_score').notNull(), // Information accuracy
  question6Score: integer('question6_score').notNull(), // Uniqueness
  question7Score: integer('question7_score').notNull(), // Sales potential
  question8Score: integer('question8_score').notNull(), // License and instructions
  totalScore: decimal('total_score', { precision: 5, scale: 2 }).notNull(), // Max 40.00 (8 questions × 5 points)
  averageScore: decimal('average_score', { precision: 4, scale: 2 }).notNull(), // Max 5.00
  comments: text('comments'),
  status: reviewStatusEnum('status').default('pending'),
  pointsEarned: integer('points_earned').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Customer Reviews table (for customer feedback)
export const customerReviews = pgTable('customer_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id),
  customerId: uuid('customer_id').notNull().references(() => users.id),
  rating: integer('rating').notNull(), // 1-5 stars
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Seller Responses to Customer Reviews table
export const sellerResponses = pgTable('seller_responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  sellerId: uuid('seller_id').notNull().references(() => users.id),
  reviewId: uuid('review_id').notNull().references(() => customerReviews.id),
  response: text('response').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Orders table
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').notNull().references(() => users.id),
  productId: uuid('product_id').notNull().references(() => products.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  paymentStatus: text('payment_status').default('pending'), // pending, completed, failed
  paymentMethod: text('payment_method'),
  transactionId: text('transaction_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Redeemable Products table (products that can be redeemed with curator points)
export const redeemableProducts = pgTable('redeemable_products', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  pointsCost: integer('points_cost').notNull(),
  stock: integer('stock').default(0),
  thumbnailUrl: text('thumbnail_url'),
  contentUrl: text('content_url'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Product Redemptions table (for redeeming products with points)
export const productRedemptions = pgTable('product_redemptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  redeemableProductId: uuid('redeemable_product_id').notNull().references(() => redeemableProducts.id),
  pointsSpent: integer('points_spent').notNull(),
  status: text('status').default('completed'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Vouchers table has been removed in favor of redeemable products system

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  products: many(products),
  productReviews: many(productReviews),
  customerReviews: many(customerReviews),
  orders: many(orders),
  productRedemptions: many(productRedemptions),
  // vouchers relation removed
  accounts: many(accounts),
  sessions: many(sessions),
  sellerResponses: many(sellerResponses),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id],
    }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  seller: one(users, {
    fields: [products.sellerId],
    references: [users.id],
  }),
  productReviews: many(productReviews),
  customerReviews: many(customerReviews),
  orders: many(orders),
}));

export const productReviewsRelations = relations(productReviews, ({ one }) => ({
  product: one(products, {
    fields: [productReviews.productId],
    references: [products.id],
  }),
  curator: one(users, {
    fields: [productReviews.curatorId],
    references: [users.id],
  }),
}));

export const customerReviewsRelations = relations(customerReviews, ({ one, many }) => ({
  product: one(products, {
    fields: [customerReviews.productId],
    references: [products.id],
  }),
  customer: one(users, {
    fields: [customerReviews.customerId],
    references: [users.id],
  }),
  sellerResponses: many(sellerResponses),
}));

export const sellerResponsesRelations = relations(sellerResponses, ({ one }) => ({
  seller: one(users, {
    fields: [sellerResponses.sellerId],
    references: [users.id],
  }),
  review: one(customerReviews, {
    fields: [sellerResponses.reviewId],
    references: [customerReviews.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  customer: one(users, {
    fields: [orders.customerId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [orders.productId],
    references: [products.id],
  }),
}));

export const redeemableProductsRelations = relations(redeemableProducts, ({ many }) => ({
  productRedemptions: many(productRedemptions),
}));

export const productRedemptionsRelations = relations(productRedemptions, ({ one }) => ({
  user: one(users, {
    fields: [productRedemptions.userId],
    references: [users.id],
  }),
  redeemableProduct: one(redeemableProducts, {
    fields: [productRedemptions.redeemableProductId],
    references: [redeemableProducts.id],
  }),
}));

// vouchers relations removed
