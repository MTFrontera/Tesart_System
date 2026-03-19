'use client';

import { useEffect, useState } from 'react';

interface Delivery {
  DeliveryID: number;
  OrderID?: number;
  DriverID?: number;
  AssistantID?: number;
  DeliveryType: string;
  DeliveryDate: string;
  DeliveryStatus: string;
  CustomerFirst?: string;
  CustomerLast?: string;
  DriverFirst?: string;
  DriverLast?: string;
  AssistantFirst?: string;
  AssistantLast?: string;
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

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [form, setForm] = useState({
    OrderID: '',
    DeliveryType: '',
    DeliveryDate: '',
    DeliveryStatus: '',
    DriverID: '',
    AssistantID: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    const res = await fetch('/api/deliveries');
    const data = await res.json();
    setDeliveries(Array.isArray(data) ? data : []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        const res = await fetch('/api/deliveries', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            DeliveryID: editingId,
            OrderID: parseInt(form.OrderID),
            DeliveryType: form.DeliveryType,
            DeliveryDate: form.DeliveryDate,
            DeliveryStatus: form.DeliveryStatus,
            DriverID: parseInt(form.DriverID),
            AssistantID: parseInt(form.AssistantID),
          }),
        });
        if (!res.ok) {
          alert('Error updating delivery');
          return;
        }
        alert('Delivery updated successfully');
      } else {
        const res = await fetch('/api/deliveries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            OrderID: parseInt(form.OrderID),
            DeliveryType: form.DeliveryType,
            DeliveryDate: form.DeliveryDate,
            DeliveryStatus: form.DeliveryStatus,
            DriverID: parseInt(form.DriverID),
            AssistantID: parseInt(form.AssistantID),
          }),
        });
        if (!res.ok) {
          alert('Error adding delivery');
          return;
        }
        alert('Delivery added successfully');
      }
      setForm({ OrderID: '', DeliveryType: '', DeliveryDate: '', DeliveryStatus: '', DriverID: '', AssistantID: '' });
      setEditingId(null);
      fetchDeliveries();
    } catch (error) {
      alert('Error: ' + String(error));
    }
  };

  const startEdit = (delivery: Delivery) => {
    setEditingId(delivery.DeliveryID);
    setForm({
      OrderID: delivery.OrderID?.toString() || '',
      DeliveryType: delivery.DeliveryType,
      DeliveryDate: formatToDatetimeLocal(delivery.DeliveryDate),
      DeliveryStatus: delivery.DeliveryStatus,
      DriverID: delivery.DriverID?.toString() || '',
      AssistantID: delivery.AssistantID?.toString() || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ OrderID: '', DeliveryType: '', DeliveryDate: '', DeliveryStatus: '', DriverID: '', AssistantID: '' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this delivery?')) return;
    try {
      const res = await fetch('/api/deliveries', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ DeliveryID: id }),
      });
      if (!res.ok) {
        alert('Error deleting delivery');
        return;
      }
      alert('Delivery deleted successfully');
      fetchDeliveries();
    } catch (error) {
      alert('Error: ' + String(error));
    }
  };

  return (
    <div>
      <h1 className="page-title">Deliveries</h1>
      <div className="card add-form-card mb-4">
        <div className="card-body">
          <h5 className="card-title">{editingId ? 'Edit Delivery' : 'Add New Delivery'}</h5>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-3">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Order ID"
                  value={form.OrderID ?? ''}
                  onChange={(e) => setForm({ ...form, OrderID: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Delivery Type"
                  value={form.DeliveryType ?? ''}
                  onChange={(e) => setForm({ ...form, DeliveryType: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-3">
                <input
                  type="datetime-local"
                  className="form-control"
                  placeholder="Delivery Date"
                  value={form.DeliveryDate ?? ''}
                  onChange={(e) => setForm({ ...form, DeliveryDate: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Delivery Status"
                  value={form.DeliveryStatus ?? ''}
                  onChange={(e) => setForm({ ...form, DeliveryStatus: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-md-6">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Driver ID"
                  value={form.DriverID ?? ''}
                  onChange={(e) => setForm({ ...form, DriverID: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Assistant ID"
                  value={form.AssistantID ?? ''}
                  onChange={(e) => setForm({ ...form, AssistantID: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="mt-3">
              <button type="submit" className="btn btn-custom">{editingId ? 'Update Delivery' : 'Add Delivery'}</button>
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
                <th>Driver</th>
                <th>Assistant</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((delivery, index) => (
                <tr key={`${delivery.DeliveryID}-${index}`}>
                  <td>{delivery.DeliveryID}</td>
                  <td>{delivery.OrderID}</td>
                  <td>{delivery.CustomerFirst} {delivery.CustomerLast}</td>
                  <td>{delivery.DriverFirst} {delivery.DriverLast}</td>
                  <td>{delivery.AssistantFirst} {delivery.AssistantLast}</td>
                  <td>{new Date(delivery.DeliveryDate).toLocaleString()}</td>
                  <td>{delivery.DeliveryStatus}</td>
                  <td>
                    <button className="btn btn-sm btn-warning me-2" onClick={() => startEdit(delivery)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(delivery.DeliveryID)}>Delete</button>
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
