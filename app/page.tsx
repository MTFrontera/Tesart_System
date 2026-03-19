'use client';

import { useEffect, useState } from 'react';

interface Order {
  OrderID: number;
  OrderStatus: string;
  TotalAmount: number;
}

interface Customer {
  CustomerID: number;
}

export default function Home() {
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [customersRes, ordersRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/orders')
      ]);

      if (customersRes.ok && ordersRes.ok) {
        const customers = await customersRes.json();
        const orders = await ordersRes.json();

        setTotalCustomers(Array.isArray(customers) ? customers.length : 0);
        setTotalOrders(Array.isArray(orders) ? orders.length : 0);

        if (Array.isArray(orders)) {
          const pending = orders.filter((o: Order) => o.OrderStatus === 'Pending').length;
          setPendingOrders(pending);

          const revenue = orders.reduce((sum: number, o: Order) => {
            const amount = typeof o.TotalAmount === 'string' ? parseFloat(o.TotalAmount) : o.TotalAmount || 0;
            return sum + amount;
          }, 0);
          setTotalRevenue(Number(revenue) || 0);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <div className="row">
        <div className="col-md-3">
          <div className="card stat-card">
            <div className="card-body">
              <h5 className="card-title">Total Customers</h5>
              <p className="card-text">{loading ? '-' : totalCustomers}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card stat-card">
            <div className="card-body">
              <h5 className="card-title">Total Orders</h5>
              <p className="card-text">{loading ? '-' : totalOrders}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card stat-card">
            <div className="card-body">
              <h5 className="card-title">Pending Orders</h5>
              <p className="card-text">{loading ? '-' : pendingOrders}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card stat-card">
            <div className="card-body">
              <h5 className="card-title">Total Revenue</h5>
              <p className="card-text">{loading ? '-' : `₱${totalRevenue.toFixed(2)}`}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}