import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getNextId } from '@/lib/idGenerator';

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

    const phoneValue = PhoneNumber ? Number(String(PhoneNumber).replace(/\D/g, '')) : null;
    const nextCustomerID = CustomerID ? CustomerID : await getNextId('customer', 'customerid');

    try {
      await db.execute(
        'INSERT INTO customer (customerid, firstname, lastname, email, phonenumber, address) VALUES (?, ?, ?, ?, ?, ?)',
        [nextCustomerID, FirstName, LastName, Email || null, phoneValue, Address || null]
      );
    } catch (error: any) {
      if (error.errno === 1062 || error.code === 'ER_DUP_ENTRY') {
        return NextResponse.json({ error: 'Duplication error: Customer ID already exists.' }, { status: 409 });
      }
      throw error;
    }
    return NextResponse.json({ id: nextCustomerID }, { status: 201 });
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

    const phoneValue = PhoneNumber ? Number(String(PhoneNumber).replace(/\D/g, '')) : null;

    await db.execute(
      'UPDATE customer SET FirstName = ?, LastName = ?, Email = ?, PhoneNumber = ?, Address = ? WHERE CustomerID = ?',
      [FirstName, LastName, Email || null, phoneValue, Address || null, CustomerID]
    );
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('PUT /api/customers failed:', error);
    return NextResponse.json({ error: 'Failed to update customer', message: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const CustomerID = body.CustomerID ?? body.customerid ?? body.id ?? body.customerId;
    const Email = body.Email ?? body.email;
    const PhoneNumber = body.PhoneNumber ?? body.phonenumber ?? body.phoneNumber;
    const Address = body.Address ?? body.address;

    if (CustomerID != null) {
      const idNumber = Number(CustomerID);
      if (Number.isNaN(idNumber)) {
        return NextResponse.json({ error: 'Invalid CustomerID' }, { status: 400 });
      }
      await db.execute('DELETE FROM customer WHERE customerid = ?', [idNumber]);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Fallback delete when CustomerID is missing (delete the null-ID row or match by other fields)
    if (Email) {
      await db.execute('DELETE FROM customer WHERE customerid IS NULL AND email = ?', [Email]);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    if (PhoneNumber) {
      const phoneValue = Number(String(PhoneNumber).replace(/\D/g, ''));
      await db.execute('DELETE FROM customer WHERE customerid IS NULL AND phonenumber = ?', [phoneValue]);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    if (Address) {
      await db.execute('DELETE FROM customer WHERE customerid IS NULL AND address = ?', [Address]);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json({ error: 'Missing CustomerID (and no fallback fields provided)' }, { status: 400 });
  } catch (error: any) {
    console.error('DELETE /api/customers failed:', error);
    return NextResponse.json({ error: 'Failed to delete customer', message: error?.message ?? String(error) }, { status: 500 });
  }
}