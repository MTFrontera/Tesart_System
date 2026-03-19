import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await db.execute('SELECT * FROM customer');
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('GET /api/customers failed:', error);
    return NextResponse.json({ error: 'Failed to fetch customers', message: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { CustomerID, FirstName, LastName, Email, PhoneNumber, Address } = await request.json();
    
    if (!FirstName || !LastName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    if (CustomerID) {
      // If CustomerID is provided, use it
      const [result] = await db.execute(
        'INSERT INTO customer (CustomerID, FirstName, LastName, Email, PhoneNumber, Address) VALUES (?, ?, ?, ?, ?, ?)',
        [CustomerID, FirstName, LastName, Email, PhoneNumber, Address]
      );
      return NextResponse.json({ id: (result as any).insertId }, { status: 201 });
    } else {
      // If no CustomerID, let the database auto-generate it
      const [result] = await db.execute(
        'INSERT INTO customer (FirstName, LastName, Email, PhoneNumber, Address) VALUES (?, ?, ?, ?, ?)',
        [FirstName, LastName, Email, PhoneNumber, Address]
      );
      return NextResponse.json({ id: (result as any).insertId }, { status: 201 });
    }
  } catch (error: any) {
    console.error('POST /api/customers failed:', error);
    return NextResponse.json({ error: 'Failed to add customer', message: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { CustomerID, FirstName, LastName, Email, PhoneNumber, Address } = await request.json();
    
    if (!CustomerID || !FirstName || !LastName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    await db.execute(
      'UPDATE customer SET FirstName = ?, LastName = ?, Email = ?, PhoneNumber = ?, Address = ? WHERE CustomerID = ?',
      [FirstName, LastName, Email, PhoneNumber, Address, CustomerID]
    );
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('PUT /api/customers failed:', error);
    return NextResponse.json({ error: 'Failed to update customer', message: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { CustomerID } = await request.json();
    
    if (!CustomerID) {
      return NextResponse.json({ error: 'Missing CustomerID' }, { status: 400 });
    }
    
    await db.execute('DELETE FROM customer WHERE CustomerID = ?', [CustomerID]);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('DELETE /api/customers failed:', error);
    return NextResponse.json({ error: 'Failed to delete customer', message: error?.message ?? String(error) }, { status: 500 });
  }
}