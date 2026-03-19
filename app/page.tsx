export default function Home() {
  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <div className="row">
        <div className="col-md-3">
          <div className="card stat-card">
            <div className="card-body">
              <h5 className="card-title">Total Customers</h5>
              <p className="card-text">5</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card stat-card">
            <div className="card-body">
              <h5 className="card-title">Total Orders</h5>
              <p className="card-text">5</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card stat-card">
            <div className="card-body">
              <h5 className="card-title">Pending Orders</h5>
              <p className="card-text">2</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card stat-card">
            <div className="card-body">
              <h5 className="card-title">Total Revenue</h5>
              <p className="card-text">₱1,200.00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}