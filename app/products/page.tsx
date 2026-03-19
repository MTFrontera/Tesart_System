'use client';

import { useEffect, useState } from 'react';

interface Product {
  ProductID: number;
  ProductName: string;
  Category: string;
  UnitPrice: number | string;
  ReturnPolicy: string;
  Warranty: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({
    ProductName: '',
    Category: '',
    UnitPrice: '',
    ReturnPolicy: '',
    Warranty: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        const res = await fetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ProductID: editingId,
            ProductName: form.ProductName,
            Category: form.Category,
            UnitPrice: parseFloat(form.UnitPrice) || 0,
            ReturnPolicy: form.ReturnPolicy,
            Warranty: form.Warranty,
          }),
        });
        if (!res.ok) {
          alert('Error updating product');
          return;
        }
        alert('Product updated successfully');
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ProductName: form.ProductName,
            Category: form.Category,
            UnitPrice: parseFloat(form.UnitPrice) || 0,
            ReturnPolicy: form.ReturnPolicy,
            Warranty: form.Warranty,
          }),
        });
        if (!res.ok) {
          alert('Error adding product');
          return;
        }
        alert('Product added successfully');
      }
      setForm({ ProductName: '', Category: '', UnitPrice: '', ReturnPolicy: '', Warranty: '' });
      setEditingId(null);
      fetchProducts();
    } catch (error) {
      alert('Error: ' + String(error));
    }
  };

  const startEdit = (product: Product) => {
    setEditingId(product.ProductID);
    setForm({
      ProductName: product.ProductName,
      Category: product.Category,
      UnitPrice: product.UnitPrice.toString(),
      ReturnPolicy: product.ReturnPolicy,
      Warranty: product.Warranty,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ ProductName: '', Category: '', UnitPrice: '', ReturnPolicy: '', Warranty: '' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ProductID: id }),
      });
      if (!res.ok) {
        alert('Error deleting product');
        return;
      }
      alert('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      alert('Error: ' + String(error));
    }
  };

  return (
    <div>
      <h1 className="page-title">Products</h1>
      <div className="card add-form-card mb-4">
        <div className="card-body">
          <h5 className="card-title">{editingId ? 'Edit Product' : 'Add New Product'}</h5>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Product Name"
                  value={form.ProductName}
                  onChange={(e) => setForm({ ...form, ProductName: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Category"
                  value={form.Category}
                  onChange={(e) => setForm({ ...form, Category: e.target.value })}
                />
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-md-6">
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  placeholder="Unit Price"
                  value={form.UnitPrice}
                  onChange={(e) => setForm({ ...form, UnitPrice: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Return Policy"
                  value={form.ReturnPolicy}
                  onChange={(e) => setForm({ ...form, ReturnPolicy: e.target.value })}
                />
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-md-12">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Warranty"
                  value={form.Warranty}
                  onChange={(e) => setForm({ ...form, Warranty: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-3">
              <button type="submit" className="btn btn-custom">{editingId ? 'Update Product' : 'Add Product'}</button>
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
                <th>Category</th>
                <th>Price</th>
                <th>Warranty</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={`${product.ProductID}-${index}`}>
                  <td>{product.ProductID}</td>
                  <td>{product.ProductName}</td>
                  <td>{product.Category}</td>
                  <td>₱{Number(product.UnitPrice).toFixed(2)}</td>
                  <td>{product.Warranty}</td>
                  <td>
                    <button className="btn btn-sm btn-warning me-2" onClick={() => startEdit(product)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(product.ProductID)}>Delete</button>
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
