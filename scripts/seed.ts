// Load environment variables
require('dotenv').config();

import { db } from '@/lib/db';
import {
  users,
  products,
  productReviews,
  accounts,
  customerReviews,
  orders,
  redeemableProducts,
} from '@/lib/db/schema';
import { hashPassword } from '@/lib/utils/auth';

// Import dependencies for Neon database
// This is needed to ensure WebSocket support for Neon
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
neonConfig.webSocketConstructor = ws;

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Check if users already exist
    const existingUsers = await db.select().from(users).limit(1);
    
    if (existingUsers.length > 0) {
      console.log('⚠️  Database already seeded. Skipping to avoid duplicates.');
      console.log('ℹ️  If you want to re-seed, please clear the database first.');
      return;
    }

    // Create sample users
    const hashedPassword = await hashPassword('password123');

    const sampleUsers = await db
      .insert(users)
      .values([
        {
          email: 'admin@marketplacets.com',
          password: hashedPassword,
          name: 'Admin MarketplaceTS',
          gender: 'male',
          role: 'admin',
          isEmailVerified: true,
          sellerPoints: 100,
          curatorPoints: 1000,
        },
        {
          email: 'seller@marketplacets.com',
          password: hashedPassword,
          name: 'John Seller',
          gender: 'male',
          role: 'seller',
          isEmailVerified: true,
          sellerPoints: 50,
          curatorPoints: 0,
        },
        {
          email: 'curator@marketplacets.com',
          password: hashedPassword,
          name: 'Jane Curator',
          gender: 'female',
          role: 'curator',
          isEmailVerified: true,
          sellerPoints: 0,
          curatorPoints: 800,
        },
        {
          email: 'client@marketplacets.com',
          password: hashedPassword,
          name: 'Mike Client',
          gender: 'male',
          role: 'client',
          isEmailVerified: true,
          sellerPoints: 0,
          curatorPoints: 0,
        },
      ])
      .returning();

    console.log('✅ Sample users created');

    // Create account entries for Better Auth
    for (const user of sampleUsers) {
      await db.insert(accounts).values({
        userId: user.id,
        type: 'email',
        provider: 'credentials',
        providerAccountId: user.email,
      });
    }

    console.log('✅ Better Auth accounts created');

    // Create sample products
    const sellerId = sampleUsers.find(u => u.role === 'seller')?.id;
    const adminId = sampleUsers.find(u => u.role === 'admin')?.id;

    if (sellerId && adminId) {
      const sampleProducts = await db
        .insert(products)
        .values([
          // E-course
          {
            sellerId,
            title: 'Full-Stack JavaScript Mastery',
            description: 'Become a full-stack developer with Node.js, React, and PostgreSQL.',
            category: 'ecourse',
            price: '349000',
            status: 'pending',
            isActive: true,
            thumbnailUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
            contentUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1738&q=80',
          },
          // E-book
          {
            sellerId: adminId,
            title: 'The Art of Digital Branding',
            description: 'A deep dive into creating a powerful and memorable brand identity online.',
            category: 'ebook',
            price: '129000',
            status: 'approved',
            isActive: true,
            reviewScore: '4.5',
            thumbnailUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
            contentUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
          },
          // Resep Masakan
          {
            sellerId,
            title: 'Authentic Italian Pasta',
            description: 'Master the art of making fresh pasta from scratch with classic Italian recipes.',
            category: 'resep_masakan',
            price: '79000',
            status: 'approved',
            isActive: true,
            reviewScore: '4.9',
            thumbnailUrl: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
            contentUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
          },
          // Jasa Desain
          {
            sellerId: adminId,
            title: 'Custom UI/UX Design for Mobile Apps',
            description: 'Professional UI/UX design services to create intuitive and beautiful mobile applications.',
            category: 'jasa_design',
            price: '2500000',
            status: 'approved',
            isActive: true,
            reviewScore: '4.7',
            thumbnailUrl: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
            contentUrl: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1736&q=80',
          },
          // Software
          {
            sellerId,
            title: 'Project Management Suite',
            description: 'A comprehensive software suite for managing projects, tasks, and team collaboration.',
            category: 'software',
            price: '750000',
            status: 'rejected',
            isActive: false,
            reviewScore: '3.2',
            thumbnailUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
            contentUrl: 'https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1650&q=80',
          },
        ])
        .returning();

      console.log('✅ Sample products created');

      // Create sample reviews for approved products
      const curatorId = sampleUsers.find(u => u.role === 'curator')?.id;
      const approvedProducts = sampleProducts.filter(p => p.status === 'approved');

      if (curatorId && approvedProducts.length > 0) {
        for (const product of approvedProducts) {
          const isDesignService = product.category === 'jasa_design';
          const q4 = isDesignService ? 0 : 4; // No content quality for services
          const q8 = isDesignService ? 0 : 4; // No license for services
          const totalScore = 4 + 5 + 5 + q4 + 5 + 4 + 5 + q8;
          const avgScore = totalScore / (isDesignService ? 6 : 8);

          await db.insert(productReviews).values({
            productId: product.id,
            curatorId,
            question1Score: 4, // Originality
            question2Score: 5, // Description
            question3Score: 5, // Thumbnail
            question4Score: q4, // Content Quality
            question5Score: 5, // Information Accuracy
            question6Score: 4, // Uniqueness
            question7Score: 5, // Sales Potential
            question8Score: q8, // License
            totalScore: totalScore.toString(),
            averageScore: avgScore.toFixed(2),
            comments: `A very promising product in the ${product.category} category. High potential for success.`,
            pointsEarned: Math.round(avgScore * 100),
            status: 'completed',
          });
        }
        console.log(`✅ ${approvedProducts.length} sample product reviews created`);
      }

      // Create sample customer reviews
      const clientUser = sampleUsers.find(u => u.role === 'client');
      const productForReview = sampleProducts.find(p => p.category === 'resep_masakan');

      if (clientUser && productForReview) {
        await db.insert(customerReviews).values([
          {
            productId: productForReview.id,
            customerId: clientUser.id,
            rating: 5,
            comment: 'Resepnya otentik dan mudah diikuti. Hasilnya luar biasa enak!',
          },
          {
            productId: approvedProducts[0].id,
            customerId: clientUser.id,
            rating: 4,
            comment: 'Materi brandingnya sangat mendalam, tapi beberapa bagian agak sulit dipahami pemula.',
          },
        ]);
        console.log('✅ 2 sample customer reviews created');
      }

      // Create sample orders
      if (clientUser && approvedProducts.length > 1) {
        await db.insert(orders).values([
          {
            customerId: clientUser.id,
            productId: approvedProducts[0].id,
            amount: approvedProducts[0].price,
            paymentStatus: 'completed',
            paymentMethod: 'qris',
            transactionId: `txn_${new Date().getTime()}_1`,
          },
          {
            customerId: clientUser.id,
            productId: approvedProducts[1].id,
            amount: approvedProducts[1].price,
            paymentStatus: 'completed',
            paymentMethod: 'virtual_account',
            transactionId: `txn_${new Date().getTime()}_2`,
          },
        ]);
        console.log('✅ 2 sample orders created');
      }

      // Voucher creation removed - replaced with redeemable products system
      
      // Create sample redeemable products (products that can be redeemed with curator points)
      await db.insert(redeemableProducts).values([
        {
          title: 'Voucher Belanja Minimarket 50K',
          description: 'Voucher belanja senilai Rp 50.000 yang dapat digunakan di jaringan minimarket nasional.',
          category: 'voucher_belanja',
          pointsCost: 300,
          stock: 100,
          thumbnailUrl: 'https://images.unsplash.com/photo-1601598851547-4302969d0614?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
          contentUrl: 'https://example.com/vouchers/minimarket-50k',
          isActive: true,
        },
        {
          title: 'Paket Sembako Premium',
          description: 'Paket sembako premium berisi bahan makanan pokok berkualitas untuk kebutuhan sehari-hari.',
          category: 'barang_konsumsi',
          pointsCost: 500,
          stock: 50,
          thumbnailUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
          contentUrl: 'https://example.com/products/sembako-premium',
          isActive: true,
        },
        {
          title: 'Voucher Makan di Restoran 100K',
          description: 'Voucher makan senilai Rp 100.000 yang dapat digunakan di berbagai restoran partner.',
          category: 'voucher_makanan',
          pointsCost: 600,
          stock: 30,
          thumbnailUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
          contentUrl: 'https://example.com/vouchers/restaurant-100k',
          isActive: true,
        },
        {
          title: 'Voucher Bensin 200K',
          description: 'Voucher bensin senilai Rp 200.000 yang dapat digunakan di SPBU nasional.',
          category: 'voucher_bensin',
          pointsCost: 1000,
          stock: 10,
          thumbnailUrl: 'https://images.unsplash.com/photo-1545235617-9465d2a55698?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
          contentUrl: 'https://example.com/vouchers/fuel-200k',
          isActive: true,
        },
        {
          title: 'Paket Perawatan Diri Premium',
          description: 'Paket produk perawatan diri premium termasuk sabun, shampo, dan perawatan kulit.',
          category: 'barang_konsumsi',
          pointsCost: 750,
          stock: 25,
          thumbnailUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
          contentUrl: 'https://example.com/products/personal-care-package',
          isActive: true,
        },
      ]);
      console.log('✅ Sample redeemable products created');
    }

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seeder if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedDatabase };
