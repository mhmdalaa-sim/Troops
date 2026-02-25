import { useCallback } from 'react';
import { useData } from '../context/DataContext';

/**
 * Custom hook for clocking in customers
 * Handles attendance tracking and session decrementing
 */
export const useClockIn = () => {
  const { getCustomer, recordAttendance, updateCustomer, getClass } = useData();

  const clockIn = useCallback((customerId, classId = null) => {
    const customer = getCustomer(customerId);

    if (!customer) {
      return { success: false, error: 'Customer not found' };
    }

    // Check if customer has active membership
    if (customer.status === 'expired') {
      return { success: false, error: 'Membership expired' };
    }

    if (customer.status === 'frozen') {
      return { success: false, error: 'Membership is frozen' };
    }

    if (!classId) {
      return { success: false, error: 'Please select a class' };
    }

    // Get the selected class
    const selectedClass = getClass(classId);
    if (!selectedClass) {
      return { success: false, error: 'Class not found' };
    }

    // Get sessions from class-specific or general drop-in balance
    const classSessions = customer.classSessions || {};
    const strClassId = String(classId);
    const enrolledInClass = (customer.enrolledClasses || []).some(e => String(e) === strClassId);
    // Find the matching key in classSessions (compare as strings)
    const classSessionKey = Object.keys(classSessions).find(k => String(k) === strClassId);
    const sessionsForClass = classSessionKey !== undefined ? classSessions[classSessionKey] : 0;
    const dropInSessions = customer.dropInSessions || 0;
    const sessionsToDeduct = selectedClass.sessionsPerVisit || 1;

    console.log('[clockIn] session check:', {
      customerId, classId: strClassId, className: selectedClass.name,
      enrolledInClass, classSessionKey, sessionsForClass,
      dropInSessions, sessionsToDeduct,
      classSessions: JSON.stringify(classSessions),
      enrolledClasses: JSON.stringify(customer.enrolledClasses)
    });

    // Decide which balance to use:
    // 1) If enrolled and has enough class sessions -> use class balance
    // 2) Otherwise, if drop-in has enough -> use drop-in balance
    let source = null;
    if (enrolledInClass && sessionsForClass >= sessionsToDeduct) {
      source = 'class';
    } else if (dropInSessions >= sessionsToDeduct) {
      source = 'dropin';
    }

    console.log('[clockIn] source decision:', source);

    if (!source) {
      return {
        success: false,
        error: `Not enough sessions for ${selectedClass.name}. Need ${sessionsToDeduct}, but class and drop-in balances are too low.`
      };
    }

    // Record attendance
    const record = recordAttendance(customerId, classId);

    if (source === 'class') {
      const newSessionCount = sessionsForClass - sessionsToDeduct;
      return {
        success: true,
        record,
        remainingSessions: newSessionCount,
        message: `Welcome ${customer.name} to ${selectedClass.name}! ${newSessionCount} sessions remaining for this class.`
      };
    }

    // Use drop-in sessions
    const newDropInCount = dropInSessions - sessionsToDeduct;
    updateCustomer(customerId, { dropInSessions: newDropInCount });

    return {
      success: true,
      record,
      remainingSessions: newDropInCount,
      message: `Welcome ${customer.name} to ${selectedClass.name}! ${newDropInCount} drop-in sessions remaining.`
    };
  }, [getCustomer, recordAttendance, updateCustomer, getClass]);

  return { clockIn };
};
