import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await db.execute(
      `SELECT od.OrderDetailID, od.OrderID, od.ProductID, od.Quantity, od.UnitPrice, od.Subtotal,
              p.ProductName, o.OrderID as OrderNum
       FROM orderdetails od
       LEFT JOIN product p ON od.ProductID = p.ProductID
       LEFT JOIN \`order\` o ON od.OrderID = o.OrderID`
    );
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('GET /api/orderdetails failed:', error);
    return NextResponse.json({ error: 'Failed to fetch order details', message: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { OrderID, ProductID, Quantity, UnitPrice, Subtotal } = await request.json();
    
    if (!OrderID || !ProductID || !Quantity || !UnitPrice) {
      console.error('Missing fields:', { OrderID, ProductID, Quantity, UnitPrice });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Get the next OrderDetailID by finding the max and adding 1
    try {
      const [maxResults] = await db.execute('SELECT MAX(OrderDetailID) as maxId FROM orderdetails');
      const maxId = (maxResults && maxResults.length > 0) ? (maxResults[0] as any).maxId : 0;
      const nextOrderDetailID = (maxId || 0) + 1;
      
      // Calculate subtotal if not provided
      const calculatedSubtotal = Subtotal || (parseFloat(String(Quantity)) * parseFloat(String(UnitPrice)));
      
      await db.execute(
        'INSERT INTO orderdetails (OrderDetailID, OrderID, ProductID, Quantity, UnitPrice, Subtotal) VALUES (?, ?, ?, ?, ?, ?)',
        [nextOrderDetailID, OrderID, ProductID, parseInt(String(Quantity)), parseFloat(String(UnitPrice)), calculatedSubtotal]
      );
      console.log('Order detail added successfully:', { id: nextOrderDetailID, OrderID, ProductID, Quantity, UnitPrice, Subtotal: calculatedSubtotal });
      return NextResponse.json({ id: nextOrderDetailID }, { status: 201 });
    } catch (dbError: any) {
      console.error('Database error in orderdetails POST:', dbError.message);
      throw dbError;
    }
  } catch (error: any) {
    console.error('POST /api/orderdetails error:', error.message);
    return NextResponse.json({ error: 'Failed to add order detail', message: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { OrderDetailID, OrderID, ProductID, Quantity, UnitPrice, Subtotal } = await request.json();
    
    if (!OrderDetailID || !OrderID || !ProductID || !Quantity || !UnitPrice) {
      console.error('Missing fields for update:', { OrderDetailID, OrderID, ProductID, Quantity, UnitPrice });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Calculate subtotal if not provided
    const calculatedSubtotal = Subtotal || (parseFloat(String(Quantity)) * parseFloat(String(UnitPrice)));
    
    try {
      await db.execute(
        'UPDATE orderdetails SET OrderID = ?, ProductID = ?, Quantity = ?, UnitPrice = ?, Subtotal = ? WHERE OrderDetailID = ?',
        [OrderID, ProductID, parseInt(String(Quantity)), parseFloat(String(UnitPrice)), calculatedSubtotal, OrderDetailID]
      );
      console.log('Order detail updated successfully:', { OrderDetailID, OrderID, ProductID, Quantity, UnitPrice, Subtotal: calculatedSubtotal });
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (dbError: any) {
      console.error('Database error in orderdetails PUT:', dbError.message);
      throw dbError;
    }
  } catch (error: any) {
    console.error('PUT /api/orderdetails failed:', error);
    return NextResponse.json({ error: 'Failed to update order detail', message: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { OrderDetailID } = await request.json();
    
    if (!OrderDetailID) {
      return NextResponse.json({ error: 'Missing OrderDetailID' }, { status: 400 });
    }
    
    await db.execute('DELETE FROM orderdetails WHERE OrderDetailID = ?', [OrderDetailID]);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('DELETE /api/orderdetails failed:', error);
    return NextResponse.json({ error: 'Failed to delete order detail', message: error?.message ?? String(error) }, { status: 500 });
  }
}
