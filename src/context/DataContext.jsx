import { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Initial mock data
const initialCustomers = [
  {
    id: 1,
    name: 'John Smith',
    phone: '555-0101',
    photoUrl: '',
    email: 'john@example.com',
    membershipType: 'Monthly Premium',
    subscriptionFee: 150,
    startDate: '2024-01-15',
    endDate: '2025-01-15',
    remainingSessions: 12, // Global sessions (deprecated - kept for backward compatibility)
    status: 'active',
    enrolledClasses: [1, 2],
    classSessions: {
      1: 12, // BJJ - 12 sessions
      2: 8   // Muay Thai - 8 sessions
    },
    attendanceLog: [],
    freezePeriods: [],
    dropInSessions: 0
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    phone: '555-0102',
    photoUrl: '',
    email: 'sarah@example.com',
    membershipType: '3-Month Basic',
    subscriptionFee: 300,
    startDate: '2024-11-01',
    endDate: '2025-02-01',
    remainingSessions: 24,
    status: 'active',
    enrolledClasses: [1],
    classSessions: {
      1: 24 // BJJ - 24 sessions
    },
    attendanceLog: [],
    freezePeriods: [],
    dropInSessions: 0
  }
];

const initialClasses = [
  {
    id: 1,
    name: 'Brazilian Jiu-Jitsu',
    instructor: 'Master Carlos',
    schedule: 'Mon, Wed, Fri - 6:00 PM',
    capacity: 20,
    enrolledCount: 15,
    description: 'Ground fighting and grappling techniques',
    sessionsPerVisit: 1,
    monthlyFee: 120,
    dropInFee: 25
  },
  {
    id: 2,
    name: 'Muay Thai',
    instructor: 'Kru Somchai',
    schedule: 'Tue, Thu - 7:00 PM',
    capacity: 15,
    enrolledCount: 12,
    description: 'The art of eight limbs - striking martial art',
    sessionsPerVisit: 1,
    monthlyFee: 100,
    dropInFee: 20
  },
  {
    id: 3,
    name: 'Kids Karate',
    instructor: 'Sensei Mike',
    schedule: 'Sat - 10:00 AM',
    capacity: 25,
    enrolledCount: 18,
    description: 'Traditional karate for children ages 6-12',
    sessionsPerVisit: 1,
    monthlyFee: 80,
    dropInFee: 15
  }
];

export const DataProvider = ({ children }) => {
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('customers');
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [classes, setClasses] = useState(() => {
    const saved = localStorage.getItem('classes');
    return saved ? JSON.parse(saved) : initialClasses;
  });

  const [attendanceRecords, setAttendanceRecords] = useState(() => {
    const saved = localStorage.getItem('attendanceRecords');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  // Customer operations
  const addCustomer = (customer) => {
    const newCustomer = {
      ...customer,
      id: Date.now(),
      attendanceLog: [],
      freezePeriods: [],
      status: 'active',
      dropInSessions: 0
    };
    setCustomers([...customers, newCustomer]);
    return newCustomer;
  };

  const updateCustomer = (id, updates) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCustomer = (id) => {
    setCustomers(customers.filter(c => c.id !== id));
  };

  const getCustomer = (id) => {
    return customers.find(c => c.id === id);
  };

  // Class operations
  const addClass = (classData) => {
    const newClass = {
      ...classData,
      id: Date.now(),
      enrolledCount: 0
    };
    setClasses([...classes, newClass]);
    return newClass;
  };

  const updateClass = (id, updates) => {
    setClasses(classes.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteClass = (id) => {
    setClasses(classes.filter(c => c.id !== id));
  };

  const getClass = (id) => {
    return classes.find(c => c.id === id);
  };

  // Add individual or class-based sessions
  const addSessions = (customerId, count, classId = null) => {
    const customer = getCustomer(customerId);
    if (!customer) {
      return { success: false, error: 'Customer not found' };
    }

    const numericCount = parseInt(count, 10);
    if (!Number.isFinite(numericCount) || numericCount <= 0) {
      return { success: false, error: 'Sessions must be a positive number' };
    }

    if (classId) {
      const parsedClassId = parseInt(classId, 10);
      const cls = getClass(parsedClassId);
      if (!cls) {
        return { success: false, error: 'Class not found' };
      }

      const classSessions = { ...(customer.classSessions || {}) };
      classSessions[parsedClassId] = (classSessions[parsedClassId] || 0) + numericCount;

      const enrolledClasses = customer.enrolledClasses || [];
      const updatedEnrolled = enrolledClasses.includes(parsedClassId)
        ? enrolledClasses
        : [...enrolledClasses, parsedClassId];

      updateCustomer(customerId, {
        classSessions,
        enrolledClasses: updatedEnrolled
      });

      return {
        success: true,
        type: 'class',
        classId: parsedClassId,
        sessionsAdded: numericCount
      };
    }

    const dropInSessions = (customer.dropInSessions || 0) + numericCount;
    updateCustomer(customerId, { dropInSessions });

    return {
      success: true,
      type: 'dropin',
      sessionsAdded: numericCount
    };
  };

  // Attendance operations
  const recordAttendance = (customerId, classId) => {
    const record = {
      id: Date.now(),
      customerId,
      classId,
      timestamp: new Date().toISOString()
    };

    setAttendanceRecords([...attendanceRecords, record]);

    // Get sessions to deduct based on class
    const selectedClass = getClass(classId);
    const sessionsToDeduct = selectedClass?.sessionsPerVisit || 1;

    // Update customer's attendance log and decrement sessions for that specific class
    const customer = getCustomer(customerId);
    const parsedClassId = parseInt(classId, 10);
    const updatedClassSessions = { ...(customer?.classSessions || {}) };

    if (updatedClassSessions[parsedClassId] !== undefined) {
      updatedClassSessions[parsedClassId] = Math.max(0, updatedClassSessions[parsedClassId] - sessionsToDeduct);
    }

    // Ensure customer is enrolled in the class after a clock-in (auto-enroll on first check-in)
    const enrolledClasses = customer?.enrolledClasses || [];
    const updatedEnrolled = enrolledClasses.includes(parsedClassId) ? enrolledClasses : [...enrolledClasses, parsedClassId];

    updateCustomer(customerId, {
      attendanceLog: [...(customer?.attendanceLog || []), record],
      classSessions: updatedClassSessions,
      enrolledClasses: updatedEnrolled
    });

    return record;
  };

  const value = {
    customers,
    classes,
    attendanceRecords,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomer,
    addClass,
    updateClass,
    deleteClass,
    getClass,
    recordAttendance,
    addSessions
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
