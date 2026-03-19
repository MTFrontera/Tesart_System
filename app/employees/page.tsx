'use client';

import { useEffect, useState } from 'react';

interface Employee {
  EmployeeID: number;
  FirstName: string;
  LastName: string;
  Role: string;
  ContactNumber: string;
  ReportsTo: number | null;
  ManagerName?: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState({
    FirstName: '',
    LastName: '',
    Role: '',
    ContactNumber: '',
    ReportsTo: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const res = await fetch('/api/employees');
    const data = await res.json();
    setEmployees(Array.isArray(data) ? data : []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        const res = await fetch('/api/employees', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            EmployeeID: editingId,
            FirstName: form.FirstName,
            LastName: form.LastName,
            Role: form.Role,
            ContactNumber: form.ContactNumber,
            ReportsTo: form.ReportsTo ? Number(form.ReportsTo) : null,
          }),
        });
        if (!res.ok) {
          alert('Error updating employee');
          return;
        }
        alert('Employee updated successfully');
      } else {
        const res = await fetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            FirstName: form.FirstName,
            LastName: form.LastName,
            Role: form.Role,
            ContactNumber: form.ContactNumber,
            ReportsTo: form.ReportsTo ? Number(form.ReportsTo) : null,
          }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          console.error('Employee API Error:', errorData);
          alert('Error adding employee: ' + (errorData.message || errorData.error));
          return;
        }
        alert('Employee added successfully');
      }
      setForm({ FirstName: '', LastName: '', Role: '', ContactNumber: '', ReportsTo: '' });
      setEditingId(null);
      fetchEmployees();
    } catch (error) {
      alert('Error: ' + String(error));
    }
  };

  const startEdit = (employee: Employee) => {
    setEditingId(employee.EmployeeID);
    setForm({
      FirstName: employee.FirstName,
      LastName: employee.LastName,
      Role: employee.Role,
      ContactNumber: employee.ContactNumber,
      ReportsTo: employee.ReportsTo?.toString() || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ FirstName: '', LastName: '', Role: '', ContactNumber: '', ReportsTo: '' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    try {
      const res = await fetch('/api/employees', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ EmployeeID: id }),
      });
      if (!res.ok) {
        alert('Error deleting employee');
        return;
      }
      alert('Employee deleted successfully');
      fetchEmployees();
    } catch (error) {
      alert('Error: ' + String(error));
    }
  };

  return (
    <div>
      <h1 className="page-title">Employees</h1>
      <div className="card add-form-card mb-4">
        <div className="card-body">
          <h5 className="card-title">{editingId ? 'Edit Employee' : 'Add New Employee'}</h5>
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
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Role"
                  value={form.Role ?? ''}
                  onChange={(e) => setForm({ ...form, Role: e.target.value })}
                />
              </div>
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contact Number"
                  value={form.ContactNumber ?? ''}
                  onChange={(e) => setForm({ ...form, ContactNumber: e.target.value })}
                />
              </div>
              <div className="col-md-4">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Reports To (ID)"
                  value={form.ReportsTo ?? ''}
                  onChange={(e) => setForm({ ...form, ReportsTo: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-3">
              <button type="submit" className="btn btn-custom">{editingId ? 'Update Employee' : 'Add Employee'}</button>
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
                <th>Role</th>
                <th>Contact</th>
                <th>Manager</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee, index) => (
                <tr key={`${employee.EmployeeID}-${index}`}>
                  <td>{employee.EmployeeID}</td>
                  <td>{employee.FirstName} {employee.LastName}</td>
                  <td>{employee.Role}</td>
                  <td>{employee.ContactNumber}</td>
                  <td>{employee.ManagerName || '—'}</td>
                  <td>
                    <button className="btn btn-sm btn-warning me-2" onClick={() => startEdit(employee)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(employee.EmployeeID)}>Delete</button>
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
