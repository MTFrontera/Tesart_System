import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

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
    const { ProductName, Category, UnitPrice, Description, ReturnPolicy, Warranty } = await request.json();
    const [result] = await db.execute(
      'INSERT INTO product (ProductName, Category, UnitPrice, Description, ReturnPolicy, Warranty) VALUES (?, ?, ?, ?, ?, ?)',
      [ProductName, Category, UnitPrice, Description, ReturnPolicy, Warranty]
    );
    return NextResponse.json({ id: (result as any).insertId }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/products failed:', error);
    return NextResponse.json({ error: 'Failed to add product', message: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { ProductID, ProductName, Category, UnitPrice, Description, ReturnPolicy, Warranty } = await request.json();
    
    if (!ProductID || !ProductName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    await db.execute(
      'UPDATE product SET ProductName = ?, Category = ?, UnitPrice = ?, Description = ?, ReturnPolicy = ?, Warranty = ? WHERE ProductID = ?',
      [ProductName, Category, UnitPrice, Description, ReturnPolicy, Warranty, ProductID]
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
