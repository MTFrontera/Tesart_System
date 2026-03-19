'use client';

import { useEffect, useState } from 'react';

interface InventoryRecord {
  InventoryID: number;
  StockQuantity: number;
  LastUpdated: string;
  ProductName?: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryRecord[]>([]);
  const [form, setForm] = useState({
    ProductID: '',
    StockQuantity: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    const res = await fetch('/api/inventory');
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        const res = await fetch('/api/inventory', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            InventoryID: editingId,
            ProductID: parseInt(form.ProductID),
            StockQuantity: parseInt(form.StockQuantity),
          }),
        });
        if (!res.ok) {
          alert('Error updating inventory');
          return;
        }
        alert('Inventory updated successfully');
      } else {
        const res = await fetch('/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ProductID: parseInt(form.ProductID),
            StockQuantity: parseInt(form.StockQuantity),
          }),
        });
        if (!res.ok) {
          alert('Error adding inventory');
          return;
        }
        alert('Inventory added successfully');
      }
      setForm({ ProductID: '', StockQuantity: '' });
      setEditingId(null);
      fetchInventory();
    } catch (error) {
      alert('Error: ' + String(error));
    }
  };

  const startEdit = (item: InventoryRecord) => {
    setEditingId(item.InventoryID);
    setForm({
      ProductID: item.InventoryID.toString(),
      StockQuantity: item.StockQuantity.toString(),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ ProductID: '', StockQuantity: '' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this inventory item?')) return;
    try {
      const res = await fetch('/api/inventory', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ InventoryID: id }),
      });
      if (!res.ok) {
        alert('Error deleting inventory');
        return;
      }
      alert('Inventory deleted successfully');
      fetchInventory();
    } catch (error) {
      alert('Error: ' + String(error));
    }
  };

  return (
    <div>
      <h1 className="page-title">Inventory</h1>
      <div className="card add-form-card mb-4">
        <div className="card-body">
          <h5 className="card-title">{editingId ? 'Edit Inventory' : 'Add Inventory Item'}</h5>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Product ID"
                  value={form.ProductID}
                  onChange={(e) => setForm({ ...form, ProductID: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Stock Quantity"
                  value={form.StockQuantity}
                  onChange={(e) => setForm({ ...form, StockQuantity: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="mt-3">
              <button type="submit" className="btn btn-custom">{editingId ? 'Update Inventory' : 'Add Inventory'}</button>
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
                <th>Product</th>
                <th>Stock</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={`${item.InventoryID}-${index}`}>
                  <td>{item.InventoryID}</td>
                  <td>{item.ProductName || '—'}</td>
                  <td>{item.StockQuantity}</td>
                  <td>{new Date(item.LastUpdated).toLocaleString()}</td>
                  <td>
                    <button className="btn btn-sm btn-warning me-2" onClick={() => startEdit(item)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.InventoryID)}>Delete</button>
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
