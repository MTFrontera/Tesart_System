import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await db.execute(
      `SELECT p.PaymentID, p.PaymentDate, p.PaymentMethod, p.AmountPaid, p.PaymentStatus,
              o.OrderID, o.TotalAmount, c.FirstName AS CustomerFirst, c.LastName AS CustomerLast
       FROM payment p
       LEFT JOIN \`order\` o ON p.OrderID = o.OrderID
       LEFT JOIN customer c ON o.CustomerID = c.CustomerID`
    );
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('GET /api/payments failed:', error);
    return NextResponse.json({ error: 'Failed to fetch payments', message: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { OrderID, PaymentDate, PaymentMethod, AmountPaid, PaymentStatus } = await request.json();
    
    if (!OrderID || !PaymentDate || !PaymentMethod || !AmountPaid || !PaymentStatus) {
      console.error('Missing fields:', { OrderID, PaymentDate, PaymentMethod, AmountPaid, PaymentStatus });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Convert datetime-local string to proper timestamp
    const paymentDateTime = new Date(PaymentDate).toISOString();
    
    try {
      const result = await db.execute(
        'INSERT INTO payment (OrderID, PaymentDate, PaymentMethod, AmountPaid, PaymentStatus) VALUES (?, ?, ?, ?, ?)',
        [OrderID, paymentDateTime, PaymentMethod, parseFloat(String(AmountPaid)), PaymentStatus]
      );
      const insertId = (result as any)[0]?.insertId || 0;
      console.log('Payment added successfully:', { id: insertId, OrderID, PaymentDate: paymentDateTime, PaymentMethod, AmountPaid, PaymentStatus });
    } catch (error: any) {
      if (error.errno === 1062 || error.code === 'ER_DUP_ENTRY') {
        return NextResponse.json({ error: 'Duplication error: Payment ID already exists.' }, { status: 409 });
      }
      throw error;
    }
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/payments error:', error.message);
    return NextResponse.json({ error: 'Failed to add payment', message: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { PaymentID, OrderID, PaymentDate, PaymentMethod, AmountPaid, PaymentStatus } = await request.json();
    
    if (!PaymentID || !OrderID || !PaymentMethod || !AmountPaid || !PaymentStatus) {
      console.error('Missing fields for update:', { PaymentID, OrderID, PaymentMethod, AmountPaid, PaymentStatus });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Convert datetime-local string to proper timestamp
    const paymentDateTime = PaymentDate ? new Date(PaymentDate).toISOString() : null;
    
    await db.execute(
      'UPDATE payment SET OrderID = ?, PaymentDate = ?, PaymentMethod = ?, AmountPaid = ?, PaymentStatus = ? WHERE PaymentID = ?',
      [OrderID, paymentDateTime, PaymentMethod, AmountPaid, PaymentStatus, PaymentID]
    );
    console.log('Payment updated successfully:', { PaymentID, OrderID, PaymentDate: paymentDateTime, PaymentMethod, AmountPaid, PaymentStatus });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('PUT /api/payments failed:', error);
    return NextResponse.json({ error: 'Failed to update payment', message: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { PaymentID } = await request.json();
    
    if (!PaymentID) {
      return NextResponse.json({ error: 'Missing PaymentID' }, { status: 400 });
    }
    
    await db.execute('DELETE FROM payment WHERE PaymentID = ?', [PaymentID]);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('DELETE /api/payments failed:', error);
    return NextResponse.json({ error: 'Failed to delete payment', message: error?.message ?? String(error) }, { status: 500 });
  }
}
