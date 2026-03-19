'use client';

import { useEffect, useState } from 'react';

interface Order {
  OrderID: number;
  OrderDate: string;
  OrderStatus: string;
  DeliveryMethod: string;
  TotalAmount: number;
  CustomerFirst?: string;
  CustomerLast?: string;
  EmployeeFirst?: string;
  EmployeeLast?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] = useState({
    CustomerID: '',
    EmployeeID: '',
    OrderDate: '',
    OrderStatus: '',
    DeliveryMethod: '',
    TotalAmount: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await fetch('/api/orders');
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        const res = await fetch('/api/orders', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            OrderID: editingId,
            CustomerID: parseInt(form.CustomerID),
            EmployeeID: parseInt(form.EmployeeID),
            OrderDate: form.OrderDate,
            OrderStatus: form.OrderStatus,
            DeliveryMethod: form.DeliveryMethod,
            TotalAmount: parseFloat(form.TotalAmount),
          }),
        });
        if (!res.ok) {
          alert('Error updating order');
          return;
        }
        alert('Order updated successfully');
      } else {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            CustomerID: parseInt(form.CustomerID),
            EmployeeID: parseInt(form.EmployeeID),
            OrderDate: form.OrderDate,
            OrderStatus: form.OrderStatus,
            DeliveryMethod: form.DeliveryMethod,
            TotalAmount: parseFloat(form.TotalAmount),
          }),
        });
        if (!res.ok) {
          alert('Error adding order');
          return;
        }
        alert('Order added successfully');
      }
      setForm({ CustomerID: '', EmployeeID: '', OrderDate: '', OrderStatus: '', DeliveryMethod: '', TotalAmount: '' });
      setEditingId(null);
      fetchOrders();
    } catch (error) {
      alert('Error: ' + String(error));
    }
  };

  const startEdit = (order: Order) => {
    setEditingId(order.OrderID);
    setForm({
      CustomerID: order.OrderID.toString(),
      EmployeeID: order.OrderID.toString(),
      OrderDate: order.OrderDate,
      OrderStatus: order.OrderStatus,
      DeliveryMethod: order.DeliveryMethod,
      TotalAmount: order.TotalAmount.toString(),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ CustomerID: '', EmployeeID: '', OrderDate: '', OrderStatus: '', DeliveryMethod: '', TotalAmount: '' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      const res = await fetch('/api/orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ OrderID: id }),
      });
      if (!res.ok) {
        alert('Error deleting order');
        return;
      }
      alert('Order deleted successfully');
      fetchOrders();
    } catch (error) {
      alert('Error: ' + String(error));
    }
  };

  return (
    <div>
      <h1 className="page-title">Orders</h1>
      <div className="card add-form-card mb-4">
        <div className="card-body">
          <h5 className="card-title">{editingId ? 'Edit Order' : 'Add New Order'}</h5>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-3">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Customer ID"
                  value={form.CustomerID}
                  onChange={(e) => setForm({ ...form, CustomerID: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-3">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Employee ID"
                  value={form.EmployeeID}
                  onChange={(e) => setForm({ ...form, EmployeeID: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-3">
                <input
                  type="datetime-local"
                  className="form-control"
                  placeholder="Order Date"
                  value={form.OrderDate}
                  onChange={(e) => setForm({ ...form, OrderDate: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Delivery Method"
                  value={form.DeliveryMethod}
                  onChange={(e) => setForm({ ...form, DeliveryMethod: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Order Status"
                  value={form.OrderStatus}
                  onChange={(e) => setForm({ ...form, OrderStatus: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  placeholder="Total Amount"
                  value={form.TotalAmount}
                  onChange={(e) => setForm({ ...form, TotalAmount: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="mt-3">
              <button type="submit" className="btn btn-custom">{editingId ? 'Update Order' : 'Add Order'}</button>
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
                <th>Customer</th>
                <th>Employee</th>
                <th>Date</th>
                <th>Status</th>
                <th>Delivery</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={`${order.OrderID}-${index}`}>
                  <td>{order.OrderID}</td>
                  <td>{order.CustomerFirst} {order.CustomerLast}</td>
                  <td>{order.EmployeeFirst} {order.EmployeeLast}</td>
                  <td>{new Date(order.OrderDate).toLocaleString()}</td>
                  <td>{order.OrderStatus}</td>
                  <td>{order.DeliveryMethod}</td>
                  <td>₱{Number(order.TotalAmount).toFixed(2)}</td>
                  <td>
                    <button className="btn btn-sm btn-warning me-2" onClick={() => startEdit(order)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(order.OrderID)}>Delete</button>
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
