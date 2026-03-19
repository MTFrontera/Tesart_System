'use client';

import { useState, useEffect } from 'react';

interface Customer {
  customerid: number | null;
  firstname: string;
  lastname: string;
  email: string;
  phonenumber: string | number;
  address: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState({
    FirstName: '',
    LastName: '',
    Email: '',
    PhoneNumber: '',
    Address: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const res = await fetch('/api/customers');
    const data = await res.json();
    setCustomers(Array.isArray(data) ? data : []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        // Update existing customer
        const res = await fetch('/api/customers', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            CustomerID: editingId,
            FirstName: form.FirstName,
            LastName: form.LastName,
            Email: form.Email,
            PhoneNumber: form.PhoneNumber,
            Address: form.Address,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          alert('Error updating customer: ' + (errorData.message || errorData.error));
          return;
        }
        alert('Customer updated successfully');
      } else {
        // Add new customer
        const res = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            FirstName: form.FirstName,
            LastName: form.LastName,
            Email: form.Email,
            PhoneNumber: form.PhoneNumber,
            Address: form.Address,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          alert('Error adding customer: ' + (errorData.message || errorData.error));
          return;
        }
        alert('Customer added successfully');
      }

      setForm({ FirstName: '', LastName: '', Email: '', PhoneNumber: '', Address: '' });
      setEditingId(null);
      fetchCustomers();
    } catch (error) {
      console.error('Submit error:', error);
      alert('Error: ' + String(error));
    }
  };

  const startEdit = (customer: Customer) => {
    setEditingId(customer.customerid);
    setForm({
      FirstName: customer.firstname,
      LastName: customer.lastname,
      Email: customer.email,
      PhoneNumber: customer.phonenumber.toString(),
      Address: customer.address,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ FirstName: '', LastName: '', Email: '', PhoneNumber: '', Address: '' });
  };

  const handleDelete = async (customer: Customer) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      const res = await fetch('/api/customers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          CustomerID: customer.customerid,
          Email: customer.email,
          PhoneNumber: customer.phonenumber,
          Address: customer.address,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert('Error deleting customer: ' + (errorData.message || errorData.error));
        return;
      }

      alert('Customer deleted successfully');
      fetchCustomers();
    } catch (error) {
      alert('Error: ' + String(error));
    }
  };

  return (
    <div>
      <h1 className="page-title">Customers</h1>
      <div className="card add-form-card mb-4">
        <div className="card-body">
          <h5 className="card-title">{editingId ? 'Edit Customer' : 'Add New Customer'}</h5>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="First Name"
                  value={form.FirstName ?? ''}
                  onChange={(e) => setForm({ ...form, FirstName: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Last Name"
                  value={form.LastName ?? ''}
                  onChange={(e) => setForm({ ...form, LastName: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-md-6">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  value={form.Email ?? ''}
                  onChange={(e) => setForm({ ...form, Email: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Phone Number"
                  value={form.PhoneNumber ?? ''}
                  onChange={(e) => setForm({ ...form, PhoneNumber: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-2">
              <input
                type="text"
                className="form-control"
                placeholder="Address"
                value={form.Address ?? ''}
                onChange={(e) => setForm({ ...form, Address: e.target.value })}
              />
            </div>
            <div className="mt-3">
              <button type="submit" className="btn btn-custom">{editingId ? 'Update Customer' : 'Add Customer'}</button>
              {editingId && <button type="button" className="btn btn-secondary ms-2" onClick={cancelEdit}>Cancel</button>}
            </div>
          </form>
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          <table className="table">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer, index) => (
                <tr key={`${customer.customerid}-${index}`}>
                  <td>{customer.customerid}</td>
                  <td>{customer.firstname} {customer.lastname}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phonenumber}</td>
                  <td>{customer.address}</td>
                  <td>
                    <button className="btn btn-sm btn-warning me-2" onClick={() => startEdit(customer)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(customer)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}