import { useStats } from '../../hooks/useStats';
import { formatCurrency } from '../../utils/formatDate';
import './StatsPanel.css';

const StatsPanel = () => {
  const stats = useStats();

  return (
    <div className="stats-panel">
      <h2>Dashboard Overview</h2>
      
      <div className="stats-grid">
        {/* Income Stats */}
        <div className="stat-card card primary-stat">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">Total Income</div>
            <div className="stat-value">{formatCurrency(stats.totalIncome)}</div>
            <div className="stat-sublabel">{stats.totalSessions} total sessions</div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">Monthly Income</div>
            <div className="stat-value">{formatCurrency(stats.monthlyIncome)}</div>
            <div className="stat-sublabel">{stats.monthlyAttendance} sessions this month</div>
          </div>
        </div>

        {/* Customer Stats */}
        <div className="stat-card card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-label">Total Customers</div>
            <div className="stat-value">{stats.totalCustomers}</div>
            <div className="stat-breakdown">
              <span className="active">{stats.activeCount} Active</span>
              <span className="frozen">{stats.frozenCount} Frozen</span>
              <span className="expired">{stats.expiredCount} Expired</span>
            </div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-label">Avg Sessions/Customer</div>
            <div className="stat-value">{stats.avgSessionsPerCustomer}</div>
            <div className="stat-sublabel">{stats.lowSessionCustomers} need renewal soon</div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon">🥋</div>
          <div className="stat-content">
            <div className="stat-label">Total Classes</div>
            <div className="stat-value">{stats.totalClasses}</div>
            <div className="stat-sublabel">Active class offerings</div>
          </div>
        </div>
      </div>

      {/* Class Popularity */}
      <div className="stats-section">
        <h3>Class Popularity</h3>
        <div className="popularity-list">
          {stats.classPopularity.map((cls, idx) => (
            <div key={cls.id} className="popularity-item card">
              <div className="rank">#{idx + 1}</div>
              <div className="popularity-details">
                <div className="popularity-name">{cls.name}</div>
                <div className="popularity-stats">
                  <span>{cls.attendance} total attendances</span>
                  <span>•</span>
                  <span>{cls.enrolledCount}/{cls.capacity} enrolled</span>
                  <span>•</span>
                  <span>{cls.utilizationRate}% capacity</span>
                </div>
              </div>
              <div className="popularity-bar">
                <div 
                  className="popularity-fill"
                  style={{ width: `${cls.utilizationRate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="stats-section">
        <h3>Revenue Trend (Last 6 Months)</h3>
        <div className="revenue-chart">
          {stats.monthlyRevenue.map((item, idx) => {
            const maxRevenue = Math.max(...stats.monthlyRevenue.map(r => r.revenue));
            const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
            
            return (
              <div key={idx} className="chart-bar">
                <div className="bar-value">{formatCurrency(item.revenue)}</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill"
                    style={{ height: `${height}%` }}
                  />
                </div>
                <div className="bar-label">{item.month}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
