import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getNextId } from '@/lib/idGenerator';

export async function GET() {
  try {
    const [rows] = await db.execute('SELECT * FROM product');
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('GET /api/products failed:', error);
    return NextResponse.json({ error: 'Failed to fetch products', message: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { ProductName, Category, UnitPrice, ReturnPolicy, Warranty } = await request.json();
    
    const nextProductID = await getNextId('product', 'ProductID');
    
    try {
      await db.execute(
        'INSERT INTO product (ProductID, ProductName, Category, UnitPrice, ReturnPolicy, Warranty) VALUES (?, ?, ?, ?, ?, ?)',
        [nextProductID, ProductName, Category, UnitPrice, ReturnPolicy, Warranty]
      );
    } catch (error: any) {
      if (error.errno === 1062 || error.code === 'ER_DUP_ENTRY') {
        return NextResponse.json({ error: 'Duplication error: Product ID already exists.' }, { status: 409 });
      }
      throw error;
    }
    return NextResponse.json({ id: nextProductID }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/products failed:', error);
    return NextResponse.json({ error: 'Failed to add product', message: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { ProductID, ProductName, Category, UnitPrice, ReturnPolicy, Warranty } = await request.json();
    
    if (!ProductID || !ProductName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    await db.execute(
      'UPDATE product SET ProductName = ?, Category = ?, UnitPrice = ?, ReturnPolicy = ?, Warranty = ? WHERE ProductID = ?',
      [ProductName, Category, UnitPrice, ReturnPolicy, Warranty, ProductID]
    );
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('PUT /api/products failed:', error);
    return NextResponse.json({ error: 'Failed to update product', message: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { ProductID } = await request.json();
    
    if (!ProductID) {
      return NextResponse.json({ error: 'Missing ProductID' }, { status: 400 });
    }
    
    await db.execute('DELETE FROM product WHERE ProductID = ?', [ProductID]);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('DELETE /api/products failed:', error);
    return NextResponse.json({ error: 'Failed to delete product', message: error?.message ?? String(error) }, { status: 500 });
  }
}
