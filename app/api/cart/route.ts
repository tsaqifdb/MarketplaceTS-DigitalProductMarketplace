import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Cart, CartItem } from '@/lib/types/cart';

// GET endpoint to retrieve the cart from the session
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const cart: Cart = session.cart || { items: [] };
    
    return NextResponse.json({ cart });
  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data keranjang' },
      { status: 500 }
    );
  }
}

// POST endpoint to save the cart to the session
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { items } = await request.json() as { items: CartItem[] };
    
    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Format data tidak valid' },
        { status: 400 }
      );
    }
    
    // Save cart to session
    const cart: Cart = {
      items
    };
    
    // The session is updated on the client-side after this request.
    // The cart data is returned to the client to facilitate this.
    
    return NextResponse.json({
      message: 'Keranjang berhasil disimpan',
      cart
    });
  } catch (error) {
    console.error('Save cart error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menyimpan keranjang' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to clear the cart
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Clear cart from session
    // The session is updated on the client-side after this request.
    
    return NextResponse.json({
      message: 'Keranjang berhasil dikosongkan'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengosongkan keranjang' },
      { status: 500 }
    );
  }
}