import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await db.execute(
      `SELECT e.EmployeeID, e.FirstName, e.LastName, e.Role, e.ContactNumber, e.ReportsTo,
              CONCAT(m.FirstName, ' ', m.LastName) AS ManagerName
       FROM employee e
       LEFT JOIN employee m ON e.ReportsTo = m.EmployeeID`
    );
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('GET /api/employees failed:', error);
    return NextResponse.json({ error: 'Failed to fetch employees', message: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { FirstName, LastName, Role, ContactNumber, ReportsTo } = await request.json();
    
    if (!FirstName || !LastName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Get the next EmployeeID by finding the max and adding 1
    const [maxResults] = await db.execute('SELECT MAX(EmployeeID) as maxId FROM employee');
    const maxId = (maxResults && maxResults.length > 0) ? (maxResults[0] as any).maxId : 0;
    const nextEmployeeID = (maxId || 0) + 1;
    
    const [result] = await db.execute(
      'INSERT INTO employee (EmployeeID, FirstName, LastName, Role, ContactNumber, ReportsTo) VALUES (?, ?, ?, ?, ?, ?)',
      [nextEmployeeID, FirstName, LastName, Role || null, ContactNumber || null, ReportsTo || null]
    );
    return NextResponse.json({ id: nextEmployeeID }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/employees failed:', error.message);
    return NextResponse.json({ error: 'Failed to add employee', message: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { EmployeeID, FirstName, LastName, Role, ContactNumber, ReportsTo } = await request.json();
    
    if (!EmployeeID || !FirstName || !LastName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    await db.execute(
      'UPDATE employee SET FirstName = ?, LastName = ?, Role = ?, ContactNumber = ?, ReportsTo = ? WHERE EmployeeID = ?',
      [FirstName, LastName, Role, ContactNumber, ReportsTo || null, EmployeeID]
    );
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('PUT /api/employees failed:', error);
    return NextResponse.json({ error: 'Failed to update employee', message: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { EmployeeID } = await request.json();
    
    if (!EmployeeID) {
      return NextResponse.json({ error: 'Missing EmployeeID' }, { status: 400 });
    }
    
    await db.execute('DELETE FROM employee WHERE EmployeeID = ?', [EmployeeID]);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('DELETE /api/employees failed:', error);
    return NextResponse.json({ error: 'Failed to delete employee', message: error?.message ?? String(error) }, { status: 500 });
  }
}
