// Load environment variables
require('dotenv').config();

import { db } from '@/lib/db';
import { users, products, productReviews, customerReviews, orders, accounts, redeemableProducts } from '@/lib/db/schema';

async function showDatabaseStatus() {
  try {
    console.log('📊 Database Status Report');
    console.log('========================\n');

    // Count users by role
    const userCount = await db.select().from(users);
    console.log(`👥 Users: ${userCount.length} total`);
    
    const usersByRole = userCount.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(usersByRole).forEach(([role, count]) => {
      console.log(`   - ${role}: ${count}`);
    });

    // Count products by status
    const productCount = await db.select().from(products);
    console.log(`\n📦 Products: ${productCount.length} total`);
    
    const productsByStatus = productCount.reduce((acc, product) => {
      const status = product.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(productsByStatus).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count}`);
    });

    // Count reviews
    const reviewCount = await db.select().from(productReviews);
    console.log(`\n⭐ Product Reviews: ${reviewCount.length}`);

    const customerReviewCount = await db.select().from(customerReviews);
    console.log(`⭐ Customer Reviews: ${customerReviewCount.length}`);

    // Count orders
    const orderCount = await db.select().from(orders);
    console.log(`\n🛒 Orders: ${orderCount.length}`);

    // Count accounts
    const accountCount = await db.select().from(accounts);
    console.log(`\n🔑 User Accounts: ${accountCount.length}`);
    
    // Count redeemable products
    const redeemableProductCount = await db.select().from(redeemableProducts);
    console.log(`🎁 Redeemable Products: ${redeemableProductCount.length}`);

    console.log('\n========================');
    
    if (userCount.length === 0) {
      console.log('ℹ️  Database is empty. Run "npm run db:seed" to populate with sample data.');
    } else {
      console.log('✅ Database contains data. Use "npm run db:clear" to reset if needed.');
    }

  } catch (error) {
    console.error('❌ Error checking database status:', error);
    throw error;
  }
}

// Run status check if called directly
if (require.main === module) {
  showDatabaseStatus()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { showDatabaseStatus };
