import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getNextId } from '@/lib/idGenerator';

export async function GET() {
  try {
    const [rows] = await db.execute(
      `SELECT o.OrderID, o.CustomerID, o.EmployeeID, o.OrderDate, o.OrderStatus, o.DeliveryMethod, o.TotalAmount,
              c.FirstName AS CustomerFirst, c.LastName AS CustomerLast,
              e.FirstName AS EmployeeFirst, e.LastName AS EmployeeLast
       FROM \`order\` o
       LEFT JOIN customer c ON o.CustomerID = c.CustomerID
       LEFT JOIN employee e ON o.EmployeeID = e.EmployeeID`
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('GET /api/orders failed:', error);
    return NextResponse.json({ error: 'Failed to fetch orders', message: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { CustomerID, EmployeeID, OrderDate, OrderStatus, DeliveryMethod, TotalAmount } = await request.json();
    
    if (!CustomerID || !EmployeeID || !OrderDate || !OrderStatus || !DeliveryMethod || !TotalAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Convert datetime-local string to proper timestamp
    const orderDateTime = new Date(OrderDate).toISOString();
    
    // Get the next OrderID using the helper
    const nextOrderID = await getNextId('`order`', 'OrderID');
    
    try {
      await db.execute(
        'INSERT INTO `order` (OrderID, CustomerID, EmployeeID, OrderDate, OrderStatus, DeliveryMethod, TotalAmount) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [nextOrderID, CustomerID, EmployeeID, orderDateTime, OrderStatus, DeliveryMethod, parseFloat(String(TotalAmount))]
      );
    } catch (error: any) {
      if (error.errno === 1062 || error.code === 'ER_DUP_ENTRY') {
        return NextResponse.json({ error: 'Duplication error: Order ID already exists.' }, { status: 409 });
      }
      throw error;
    }
    return NextResponse.json({ id: nextOrderID }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/orders failed:', error);
    return NextResponse.json({ error: 'Failed to add order', message: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { OrderID, CustomerID, EmployeeID, OrderDate, OrderStatus, DeliveryMethod, TotalAmount } = await request.json();
    
    if (!OrderID || !CustomerID || !EmployeeID || !OrderStatus || !DeliveryMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    await db.execute(
      'UPDATE `order` SET CustomerID = ?, EmployeeID = ?, OrderDate = ?, OrderStatus = ?, DeliveryMethod = ?, TotalAmount = ? WHERE OrderID = ?',
      [CustomerID, EmployeeID, OrderDate, OrderStatus, DeliveryMethod, TotalAmount, OrderID]
    );
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('PUT /api/orders failed:', error);
    return NextResponse.json({ error: 'Failed to update order', message: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { OrderID } = await request.json();
    
    if (!OrderID) {
      return NextResponse.json({ error: 'Missing OrderID' }, { status: 400 });
    }
    
    await db.execute('DELETE FROM `order` WHERE OrderID = ?', [OrderID]);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('DELETE /api/orders failed:', error);
    return NextResponse.json({ error: 'Failed to delete order', message: error?.message ?? String(error) }, { status: 500 });
  }
}
