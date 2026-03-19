'use client';

import { useEffect, useState } from 'react';

interface Payment {
  PaymentID: number;
  PaymentDate: string;
  PaymentMethod: string;
  AmountPaid: number;
  PaymentStatus: string;
  OrderID?: number;
  TotalAmount?: number;
  CustomerFirst?: string;
  CustomerLast?: string;
}

const formatToDatetimeLocal = (value: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [form, setForm] = useState({
    OrderID: '',
    PaymentDate: '',
    PaymentMethod: '',
    AmountPaid: '',
    PaymentStatus: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    const res = await fetch('/api/payments');
    const data = await res.json();
    setPayments(Array.isArray(data) ? data : []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        const res = await fetch('/api/payments', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            PaymentID: editingId,
            OrderID: parseInt(form.OrderID),
            PaymentDate: form.PaymentDate,
            PaymentMethod: form.PaymentMethod,
            AmountPaid: parseFloat(form.AmountPaid),
            PaymentStatus: form.PaymentStatus,
          }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          alert('Error updating payment: ' + (errorData.message || errorData.error));
          return;
        }
        alert('Payment updated successfully');
      } else {
        const res = await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            OrderID: parseInt(form.OrderID),
            PaymentDate: form.PaymentDate,
            PaymentMethod: form.PaymentMethod,
            AmountPaid: parseFloat(form.AmountPaid),
            PaymentStatus: form.PaymentStatus,
          }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          console.error('Payment API Error:', errorData);
          alert('Error adding payment: ' + (errorData.message || errorData.error));
          return;
        }
        alert('Payment added successfully');
      }
      setForm({ OrderID: '', PaymentDate: '', PaymentMethod: '', AmountPaid: '', PaymentStatus: '' });
      setEditingId(null);
      fetchPayments();
    } catch (error) {
      console.error('Submit error:', error);
      alert('Error: ' + String(error));
    }
  };

  const startEdit = (payment: Payment) => {
    setEditingId(payment.PaymentID);
    setForm({
      OrderID: payment.OrderID?.toString() || '',
      PaymentDate: formatToDatetimeLocal(payment.PaymentDate),
      PaymentMethod: payment.PaymentMethod,
      AmountPaid: payment.AmountPaid.toString(),
      PaymentStatus: payment.PaymentStatus,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ OrderID: '', PaymentDate: '', PaymentMethod: '', AmountPaid: '', PaymentStatus: '' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this payment?')) return;
    try {
      const res = await fetch('/api/payments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ PaymentID: id }),
      });
      if (!res.ok) {
        alert('Error deleting payment');
        return;
      }
      alert('Payment deleted successfully');
      fetchPayments();
    } catch (error) {
      alert('Error: ' + String(error));
    }
  };

  return (
    <div>
      <h1 className="page-title">Payments</h1>
      <div className="card add-form-card mb-4">
        <div className="card-body">
          <h5 className="card-title">{editingId ? 'Edit Payment' : 'Add New Payment'}</h5>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Order ID"
                  value={form.OrderID ?? ''}
                  onChange={(e) => setForm({ ...form, OrderID: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <input
                  type="datetime-local"
                  className="form-control"
                  placeholder="Payment Date"
                  value={form.PaymentDate ?? ''}
                  onChange={(e) => setForm({ ...form, PaymentDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Payment Method"
                  value={form.PaymentMethod ?? ''}
                  onChange={(e) => setForm({ ...form, PaymentMethod: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  placeholder="Amount Paid"
                  value={form.AmountPaid ?? ''}
                  onChange={(e) => setForm({ ...form, AmountPaid: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="mt-2">
              <input
                type="text"
                className="form-control"
                placeholder="Payment Status"
                value={form.PaymentStatus ?? ''}
                onChange={(e) => setForm({ ...form, PaymentStatus: e.target.value })}
                required
              />
            </div>
            <div className="mt-3">
              <button type="submit" className="btn btn-custom">{editingId ? 'Update Payment' : 'Add Payment'}</button>
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
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr key={`${payment.PaymentID}-${index}`}>
                  <td>{payment.PaymentID}</td>
                  <td>{payment.OrderID}</td>
                  <td>{payment.CustomerFirst} {payment.CustomerLast}</td>
                  <td>{new Date(payment.PaymentDate).toLocaleString()}</td>
                  <td>₱{Number(payment.AmountPaid).toFixed(2)}</td>
                  <td>{payment.PaymentStatus}</td>
                  <td>
                    <button className="btn btn-sm btn-warning me-2" onClick={() => startEdit(payment)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(payment.PaymentID)}>Delete</button>
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
