import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'TesArt Management System',
  description: 'Management system for TesArt',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
      </head>
      <body>
        <nav className="custom-navbar">
          <div className="nav-links">
            <Link href="/" className="active">Dashboard</Link>
            <Link href="/customers">Customers</Link>
            <Link href="/employees">Employees</Link>
            <Link href="/products">Products</Link>
            <Link href="/orders">Orders</Link>
            <Link href="/orderdetails">Order Details</Link>
            <Link href="/inventory">Inventory</Link>
            <Link href="/payments">Payments</Link>
            <Link href="/deliveries">Deliveries</Link>
          </div>
        </nav>
        <main className="container mt-4">
          {children}
        </main>
      </body>
    </html>
  )
}