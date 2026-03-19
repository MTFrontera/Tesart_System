import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await db.execute(
      `SELECT d.DeliveryID, d.DeliveryType, d.DeliveryDate, d.DeliveryStatus,
              o.OrderID, c.FirstName AS CustomerFirst, c.LastName AS CustomerLast,
              driver.FirstName AS DriverFirst, driver.LastName AS DriverLast,
              assistant.FirstName AS AssistantFirst, assistant.LastName AS AssistantLast
       FROM delivery_pickup d
       LEFT JOIN \`order\` o ON d.OrderID = o.OrderID
       LEFT JOIN customer c ON o.CustomerID = c.CustomerID
       LEFT JOIN employee driver ON d.DriverID = driver.EmployeeID
       LEFT JOIN employee assistant ON d.AssistantID = assistant.EmployeeID`
    );
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('GET /api/deliveries failed:', error);
    return NextResponse.json({ error: 'Failed to fetch deliveries', message: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { OrderID, DriverID, AssistantID, DeliveryType, DeliveryDate, DeliveryStatus } = await request.json();
    
    if (!OrderID || !DriverID || !AssistantID || !DeliveryType || !DeliveryDate || !DeliveryStatus) {
      console.error('Missing fields:', { OrderID, DriverID, AssistantID, DeliveryType, DeliveryDate, DeliveryStatus });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Convert datetime-local string to proper timestamp
    const deliveryDateTime = new Date(DeliveryDate).toISOString();
    
    // Get the next DeliveryID by finding the max and adding 1
    try {
      const [maxResults] = await db.execute('SELECT MAX(DeliveryID) as maxId FROM delivery_pickup');
      const maxId = (maxResults && maxResults.length > 0) ? (maxResults[0] as any).maxId : 0;
      const nextDeliveryID = (maxId || 0) + 1;
      
      await db.execute(
        'INSERT INTO delivery_pickup (DeliveryID, OrderID, DriverID, AssistantID, DeliveryType, DeliveryDate, DeliveryStatus) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [nextDeliveryID, OrderID, DriverID, AssistantID, DeliveryType, deliveryDateTime, DeliveryStatus]
      );
      console.log('Delivery added successfully:', { id: nextDeliveryID, OrderID, DriverID, AssistantID, DeliveryType, DeliveryDate: deliveryDateTime, DeliveryStatus });
      return NextResponse.json({ id: nextDeliveryID }, { status: 201 });
    } catch (dbError: any) {
      console.error('Database error in deliveries POST:', dbError.message);
      throw dbError;
    }
  } catch (error: any) {
    console.error('POST /api/deliveries failed:', error);
    return NextResponse.json({ error: 'Failed to add delivery', message: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { DeliveryID, OrderID, DeliveryType, DeliveryDate, DeliveryStatus, DriverID, AssistantID } = await request.json();
    
    if (!DeliveryID || !OrderID || !DeliveryType || !DeliveryDate || !DeliveryStatus || !DriverID || !AssistantID) {
      console.error('Missing fields for update:', { DeliveryID, OrderID, DeliveryType, DeliveryDate, DeliveryStatus, DriverID, AssistantID });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Convert datetime-local string to proper timestamp
    const deliveryDateTime = DeliveryDate ? new Date(DeliveryDate).toISOString() : null;
    
    await db.execute(
      'UPDATE delivery_pickup SET OrderID = ?, DeliveryType = ?, DeliveryDate = ?, DeliveryStatus = ?, DriverID = ?, AssistantID = ? WHERE DeliveryID = ?',
      [OrderID, DeliveryType, deliveryDateTime, DeliveryStatus, DriverID, AssistantID, DeliveryID]
    );
    console.log('Delivery updated successfully:', { DeliveryID, OrderID, DeliveryType, DeliveryDate: deliveryDateTime, DeliveryStatus, DriverID, AssistantID });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('PUT /api/deliveries failed:', error);
    return NextResponse.json({ error: 'Failed to update delivery', message: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { DeliveryID } = await request.json();
    
    if (!DeliveryID) {
      return NextResponse.json({ error: 'Missing DeliveryID' }, { status: 400 });
    }
    
    await db.execute('DELETE FROM delivery_pickup WHERE DeliveryID = ?', [DeliveryID]);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('DELETE /api/deliveries failed:', error);
    return NextResponse.json({ error: 'Failed to delete delivery', message: error?.message ?? String(error) }, { status: 500 });
  }
}
