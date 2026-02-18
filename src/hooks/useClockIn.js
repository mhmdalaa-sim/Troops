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

    // Check if customer is enrolled in this class
    if (!customer.enrolledClasses || !customer.enrolledClasses.includes(classId)) {
      return { 
        success: false, 
        error: `Customer is not enrolled in ${selectedClass.name}. Please enroll them first.` 
      };
    }

    // Get sessions for this specific class
    const classSessions = customer.classSessions || {};
    const availableSessions = classSessions[classId] || 0;
    const sessionsToDeduct = selectedClass.sessionsPerVisit || 1;

    // Check if customer has enough sessions for this class
    if (availableSessions < sessionsToDeduct) {
      return { 
        success: false, 
        error: `Not enough sessions for ${selectedClass.name}. Need ${sessionsToDeduct} but only ${availableSessions} remaining.` 
      };
    }

    // Record attendance
    const record = recordAttendance(customerId, classId);
    const newSessionCount = availableSessions - sessionsToDeduct;

    return {
      success: true,
      record,
      remainingSessions: newSessionCount,
      message: `Welcome ${customer.name} to ${selectedClass.name}! ${newSessionCount} sessions remaining for this class.`
    };
  }, [getCustomer, recordAttendance, updateCustomer, getClass]);

  return { clockIn };
};
