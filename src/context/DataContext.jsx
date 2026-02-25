import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase/config';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';

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
  const [customers, setCustomers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  // Load initial data from Firestore (fallback to local mock data if empty or failed)
  useEffect(() => {
    const loadFromFirestore = async () => {
      try {
        const [classesSnap, customersSnap] = await Promise.all([
          getDocs(collection(db, 'classes')),
          getDocs(collection(db, 'customers')),
        ]);

        const loadedClasses = classesSnap.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }));
        const loadedCustomers = customersSnap.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }));

        console.log('[DataContext] Loaded from Firestore:', { classes: loadedClasses.length, customers: loadedCustomers.length });
        setClasses(loadedClasses.length ? loadedClasses : initialClasses);
        setCustomers(loadedCustomers.length ? loadedCustomers : initialCustomers);
      } catch (err) {
        console.error('Failed to load data from Firestore, using local defaults.', err);
        setClasses(initialClasses);
        setCustomers(initialCustomers);
      }
    };

    loadFromFirestore();
  }, []);

  // Customer operations
  const addCustomer = (customer) => {
    const newId = Date.now();
    const newCustomer = {
      ...customer,
      id: newId,
      attendanceLog: [],
      freezePeriods: [],
      status: 'active',
      dropInSessions: 0,
    };
    setCustomers((prev) => [...prev, newCustomer]);

    (async () => {
      try {
        await setDoc(doc(collection(db, 'customers'), String(newId)), newCustomer);
      } catch (err) {
        console.error('Failed to persist customer to Firestore', err);
      }
    })();

    return newCustomer;
  };

  const updateCustomer = (id, updates) => {
    const strId = String(id);
    setCustomers((prev) => prev.map((c) => (String(c.id) === strId ? { ...c, ...updates } : c)));

    (async () => {
      try {
        const ref = doc(collection(db, 'customers'), strId);
        await setDoc(ref, { ...(customers.find((c) => String(c.id) === strId) || {}), ...updates }, { merge: true });
      } catch (err) {
        console.error('Failed to update customer in Firestore', err);
      }
    })();
  };

  const deleteCustomer = (id) => {
    const strId = String(id);
    setCustomers((prev) => prev.filter((c) => String(c.id) !== strId));

    (async () => {
      try {
        await deleteDoc(doc(collection(db, 'customers'), strId));
      } catch (err) {
        console.error('Failed to delete customer from Firestore', err);
      }
    })();
  };

  const getCustomer = (id) => {
    const strId = String(id);
    return customers.find(c => String(c.id) === strId);
  };

  // Class operations
  const addClass = (classData) => {
    const newId = Date.now();
    const newClass = {
      ...classData,
      id: newId,
      enrolledCount: 0,
    };
    setClasses((prev) => [...prev, newClass]);

    (async () => {
      try {
        await setDoc(doc(collection(db, 'classes'), String(newId)), newClass);
      } catch (err) {
        console.error('Failed to persist class to Firestore', err);
      }
    })();

    return newClass;
  };

  const updateClass = (id, updates) => {
    const strId = String(id);
    setClasses((prev) => prev.map((c) => (String(c.id) === strId ? { ...c, ...updates } : c)));

    (async () => {
      try {
        const ref = doc(collection(db, 'classes'), strId);
        await setDoc(ref, { ...(classes.find((c) => String(c.id) === strId) || {}), ...updates }, { merge: true });
      } catch (err) {
        console.error('Failed to update class in Firestore', err);
      }
    })();
  };

  const deleteClass = (id) => {
    const strId = String(id);
    setClasses((prev) => prev.filter((c) => String(c.id) !== strId));

    (async () => {
      try {
        await deleteDoc(doc(collection(db, 'classes'), strId));
      } catch (err) {
        console.error('Failed to delete class from Firestore', err);
      }
    })();
  };

  const getClass = (id) => {
    if (!id) return null;
    const strId = String(id).toLowerCase();
    // Try matching by ID first, then by Name as a fallback
    return classes.find(c =>
      String(c.id).toLowerCase() === strId ||
      String(c.name).toLowerCase() === strId
    );
  };

  // Add individual or class-based sessions
  const addSessions = (customerId, count, classId = null) => {
    console.log('[addSessions] called with:', { customerId, count, classId });
    const customer = getCustomer(customerId);
    console.log('[addSessions] customer found:', customer ? { id: customer.id, name: customer.name, classSessions: customer.classSessions, dropInSessions: customer.dropInSessions, enrolledClasses: customer.enrolledClasses } : null);
    if (!customer) {
      console.log('[addSessions] ERROR: Customer not found');
      return { success: false, error: 'Customer not found' };
    }

    const numericCount = parseInt(count, 10);
    if (!Number.isFinite(numericCount) || numericCount <= 0) {
      console.log('[addSessions] ERROR: Invalid count', count, numericCount);
      return { success: false, error: 'Sessions must be a positive number' };
    }

    if (classId) {
      const strClassId = String(classId);
      const cls = getClass(strClassId);
      console.log('[addSessions] class lookup:', { strClassId, classFound: !!cls, className: cls?.name });
      if (!cls) {
        console.log('[addSessions] ERROR: Class not found for id', strClassId);
        return { success: false, error: 'Class not found' };
      }

      // Build updated classSessions with consistent keys
      const classSessions = { ...(customer.classSessions || {}) };
      // Find existing key for this class (compare as strings)
      const existingKey = Object.keys(classSessions).find(k => String(k) === strClassId);
      const currentSessions = existingKey !== undefined ? classSessions[existingKey] : 0;
      // Use the existing key format, or fall back to the classId
      const keyToUse = existingKey !== undefined ? existingKey : classId;
      classSessions[keyToUse] = currentSessions + numericCount;
      console.log('[addSessions] class sessions updated:', { existingKey, currentSessions, keyToUse, newTotal: classSessions[keyToUse], classSessions });

      // Type-safe enrollment check
      const enrolledClasses = customer.enrolledClasses || [];
      const alreadyEnrolled = enrolledClasses.some(e => String(e) === strClassId);
      const updatedEnrolled = alreadyEnrolled
        ? enrolledClasses
        : [...enrolledClasses, classId];
      console.log('[addSessions] enrollment:', { alreadyEnrolled, updatedEnrolled });

      updateCustomer(customerId, {
        classSessions,
        enrolledClasses: updatedEnrolled
      });

      const result = {
        success: true,
        type: 'class',
        classId: classId,
        sessionsAdded: numericCount
      };
      console.log('[addSessions] SUCCESS (class):', result);
      return result;
    }

    // Drop-in sessions (no specific class)
    const dropInSessions = (customer.dropInSessions || 0) + numericCount;
    console.log('[addSessions] drop-in sessions:', { oldDropIn: customer.dropInSessions || 0, added: numericCount, newTotal: dropInSessions });
    updateCustomer(customerId, { dropInSessions });

    const result = {
      success: true,
      type: 'dropin',
      sessionsAdded: numericCount
    };
    console.log('[addSessions] SUCCESS (dropin):', result);
    return result;
  };

  // Attendance operations
  const recordAttendance = (customerId, classId) => {
    const strClassId = String(classId);
    const record = {
      id: Date.now(),
      customerId,
      classId: classId,
      timestamp: new Date().toISOString()
    };

    setAttendanceRecords([...attendanceRecords, record]);

    // Get sessions to deduct based on class
    const selectedClass = getClass(strClassId);
    const sessionsToDeduct = selectedClass?.sessionsPerVisit || 1;

    // Update customer's attendance log and decrement sessions for that specific class
    const customer = getCustomer(customerId);
    const updatedClassSessions = { ...(customer?.classSessions || {}) };

    // Find matching key in classSessions (compare as strings)
    const classKey = Object.keys(updatedClassSessions).find(k => String(k) === strClassId);
    if (classKey !== undefined && updatedClassSessions[classKey] !== undefined) {
      updatedClassSessions[classKey] = Math.max(0, updatedClassSessions[classKey] - sessionsToDeduct);
    }

    // Ensure customer is enrolled in the class after a clock-in (auto-enroll on first check-in)
    const enrolledClasses = customer?.enrolledClasses || [];
    const alreadyEnrolled = enrolledClasses.some(e => String(e) === strClassId);
    const updatedEnrolled = alreadyEnrolled ? enrolledClasses : [...enrolledClasses, classId];

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
