import { useMemo } from 'react';
import { useData } from '../context/DataContext';

/**
 * Custom hook for calculating dashboard statistics
 */
export const useStats = () => {
  const { customers, classes, attendanceRecords } = useData();

  const stats = useMemo(() => {
    // Active vs Frozen vs Expired
    const activeCount = customers.filter(c => c.status === 'active').length;
    const frozenCount = customers.filter(c => c.status === 'frozen').length;
    const expiredCount = customers.filter(c => c.status === 'expired').length;

    // Total income calculation (assume $50 per session for simplicity)
    const SESSION_PRICE = 50;
    const totalSessions = attendanceRecords.length;
    const totalIncome = totalSessions * SESSION_PRICE;

    // Monthly income (current month)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyAttendance = attendanceRecords.filter(record => {
      const recordDate = new Date(record.timestamp);
      return recordDate.getMonth() === currentMonth && 
             recordDate.getFullYear() === currentYear;
    });
    
    const monthlyIncome = monthlyAttendance.length * SESSION_PRICE;

    // Class popularity
    const classPopularity = classes.map(cls => {
      const classAttendance = attendanceRecords.filter(
        record => record.classId === cls.id
      ).length;
      
      return {
        id: cls.id,
        name: cls.name,
        attendance: classAttendance,
        enrolledCount: cls.enrolledCount,
        capacity: cls.capacity,
        utilizationRate: cls.capacity > 0 
          ? ((cls.enrolledCount / cls.capacity) * 100).toFixed(1)
          : 0
      };
    }).sort((a, b) => b.attendance - a.attendance);

    // Revenue by month (last 6 months)
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth();
      const year = date.getFullYear();
      
      const revenue = attendanceRecords.filter(record => {
        const recordDate = new Date(record.timestamp);
        return recordDate.getMonth() === month && 
               recordDate.getFullYear() === year;
      }).length * SESSION_PRICE;
      
      monthlyRevenue.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue
      });
    }

    // Average sessions per customer
    const avgSessionsPerCustomer = customers.length > 0
      ? (totalSessions / customers.length).toFixed(1)
      : 0;

    // Customers with low sessions (less than 5)
    const lowSessionCustomers = customers.filter(c => 
      c.remainingSessions < 5 && c.status === 'active'
    ).length;

    return {
      totalCustomers: customers.length,
      activeCount,
      frozenCount,
      expiredCount,
      totalIncome,
      monthlyIncome,
      totalSessions,
      monthlyAttendance: monthlyAttendance.length,
      classPopularity,
      monthlyRevenue,
      avgSessionsPerCustomer,
      lowSessionCustomers,
      totalClasses: classes.length
    };
  }, [customers, classes, attendanceRecords]);

  return stats;
};
