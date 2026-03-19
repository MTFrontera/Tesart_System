'use client';

import { useEffect, useState } from 'react';

interface OrderDetail {
  OrderDetailID: number;
  OrderID: number;
  ProductID: number;
  Quantity: number;
  UnitPrice: number | string;
  Subtotal: number | string;
  ProductName?: string;
}

interface Product {
  ProductID: number;
  ProductName: string;
  UnitPrice: number;
}

export default function OrderDetailsPage() {
  const [details, setDetails] = useState<OrderDetail[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({
    OrderID: '',
    ProductID: '',
    Quantity: '',
    UnitPrice: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchOrderDetails();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchOrderDetails = async () => {
    const res = await fetch('/api/orderdetails');
    const data = await res.json();
    setDetails(Array.isArray(data) ? data : []);
  };

  const calculateSubtotal = () => {
    const qty = parseInt(form.Quantity) || 0;
    const price = parseFloat(form.UnitPrice) || 0;
    return (qty * price).toFixed(2);
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = e.target.value;
    setForm({ ...form, ProductID: productId });
    
    // Auto-fill unit price from selected product
    const selected = products.find(p => p.ProductID === parseInt(productId));
    if (selected) {
      setForm(prev => ({ ...prev, UnitPrice: selected.UnitPrice.toString() }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const subtotal = calculateSubtotal();
      
      if (editingId !== null) {
        const res = await fetch('/api/orderdetails', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            OrderDetailID: editingId,
            OrderID: parseInt(form.OrderID),
            ProductID: parseInt(form.ProductID),
            Quantity: parseInt(form.Quantity),
            UnitPrice: parseFloat(form.UnitPrice),
            Subtotal: parseFloat(subtotal),
          }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          alert('Error updating order detail: ' + (errorData.message || errorData.error));
          return;
        }
        alert('Order detail updated successfully');
      } else {
        const res = await fetch('/api/orderdetails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            OrderID: parseInt(form.OrderID),
            ProductID: parseInt(form.ProductID),
            Quantity: parseInt(form.Quantity),
            UnitPrice: parseFloat(form.UnitPrice),
            Subtotal: parseFloat(subtotal),
          }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          console.error('Order detail API Error:', errorData);
          alert('Error adding order detail: ' + (errorData.message || errorData.error));
          return;
        }
        alert('Order detail added successfully');
      }
      setForm({ OrderID: '', ProductID: '', Quantity: '', UnitPrice: '' });
      setEditingId(null);
      fetchOrderDetails();
    } catch (error) {
      console.error('Submit error:', error);
      alert('Error: ' + String(error));
    }
  };

  const startEdit = (detail: OrderDetail) => {
    setEditingId(detail.OrderDetailID);
    setForm({
      OrderID: detail.OrderID.toString(),
      ProductID: detail.ProductID.toString(),
      Quantity: detail.Quantity.toString(),
      UnitPrice: detail.UnitPrice.toString(),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ OrderID: '', ProductID: '', Quantity: '', UnitPrice: '' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this order detail?')) return;
    try {
      const res = await fetch('/api/orderdetails', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ OrderDetailID: id }),
      });
      if (!res.ok) {
        alert('Error deleting order detail');
        return;
      }
      alert('Order detail deleted successfully');
      fetchOrderDetails();
    } catch (error) {
      alert('Error: ' + String(error));
    }
  };

  return (
    <div>
      <h1 className="page-title">Order Details</h1>
      <div className="card add-form-card mb-4">
        <div className="card-body">
          <h5 className="card-title">{editingId ? 'Edit Order Detail' : 'Add New Order Detail'}</h5>
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
                <select
                  className="form-control"
                  value={form.ProductID}
                  onChange={handleProductChange}
                  required
                >
                  <option value="">Select Product</option>
                  {products.map((product) => (
                    <option key={product.ProductID} value={product.ProductID}>
                      {product.ProductName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-md-6">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Quantity"
                  value={form.Quantity ?? ''}
                  onChange={(e) => setForm({ ...form, Quantity: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  placeholder="Unit Price"
                  value={form.UnitPrice ?? ''}
                  onChange={(e) => setForm({ ...form, UnitPrice: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="mt-2">
              <div className="alert alert-info">
                <strong>Subtotal:</strong> ₱{calculateSubtotal()}
              </div>
            </div>
            <div className="mt-3">
              <button type="submit" className="btn btn-custom">{editingId ? 'Update Detail' : 'Add Detail'}</button>
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
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {details.map((detail, index) => (
                <tr key={`${detail.OrderDetailID}-${index}`}>
                  <td>{detail.OrderDetailID}</td>
                  <td>{detail.OrderID}</td>
                  <td>{detail.ProductName || `Product ${detail.ProductID}`}</td>
                  <td>{detail.Quantity}</td>
                  <td>₱{Number(detail.UnitPrice).toFixed(2)}</td>
                  <td>₱{Number(detail.Subtotal).toFixed(2)}</td>
                  <td>
                    <button className="btn btn-sm btn-warning me-2" onClick={() => startEdit(detail)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(detail.OrderDetailID)}>Delete</button>
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
