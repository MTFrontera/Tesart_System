import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getNextId } from '@/lib/idGenerator';

export async function GET() {
  try {
    const [rows] = await db.execute(
      `SELECT i.InventoryID, i.ProductID, i.StockQuantity, i.LastUpdated, p.ProductName
       FROM inventory i
       LEFT JOIN product p ON i.ProductID = p.ProductID`
    );
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('GET /api/inventory failed:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory', message: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { ProductID, StockQuantity } = await request.json();
    
    if (!ProductID || !StockQuantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
      // Get the next InventoryID using the helper
    const nextInventoryID = await getNextId('inventory', 'InventoryID');

    const lastUpdated = new Date().toISOString().slice(0, 19).replace('T', ' ');
    try {
      await db.execute(
        'INSERT INTO inventory (InventoryID, ProductID, StockQuantity, LastUpdated) VALUES (?, ?, ?, ?)',
        [nextInventoryID, ProductID, StockQuantity, lastUpdated]
      );
    } catch (error: any) {
      if (error.errno === 1062 || error.code === 'ER_DUP_ENTRY') {
        return NextResponse.json({ error: 'Duplication error: Inventory ID already exists.' }, { status: 409 });
      }
      throw error;
    }
    return NextResponse.json({ id: nextInventoryID }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/inventory failed:', error);
    return NextResponse.json({ error: 'Failed to add inventory', message: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { InventoryID, ProductID, StockQuantity } = await request.json();
    
    if (!InventoryID || !ProductID || StockQuantity === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const lastUpdated = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await db.execute(
      'UPDATE inventory SET ProductID = ?, StockQuantity = ?, LastUpdated = ? WHERE InventoryID = ?',
      [ProductID, StockQuantity, lastUpdated, InventoryID]
    );
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('PUT /api/inventory failed:', error);
    return NextResponse.json({ error: 'Failed to update inventory', message: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { InventoryID } = await request.json();
    
    if (!InventoryID) {
      return NextResponse.json({ error: 'Missing InventoryID' }, { status: 400 });
    }
    
    await db.execute('DELETE FROM inventory WHERE InventoryID = ?', [InventoryID]);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('DELETE /api/inventory failed:', error);
    return NextResponse.json({ error: 'Failed to delete inventory', message: error?.message ?? String(error) }, { status: 500 });
  }
}
