import { useCallback } from 'react';
import { useData } from '../context/DataContext';

/**
 * Custom hook for freezing/unfreezing memberships
 */
export const useFreezeMembership = () => {
  const { getCustomer, updateCustomer } = useData();

  const freezeMembership = useCallback((customerId, startDate, endDate, reason = '') => {
    const customer = getCustomer(customerId);
    
    if (!customer) {
      return { success: false, error: 'Customer not found' };
    }

    if (customer.status === 'frozen') {
      return { success: false, error: 'Membership is already frozen' };
    }

    const freezePeriod = {
      id: Date.now(),
      startDate,
      endDate,
      reason,
      createdAt: new Date().toISOString()
    };

    const updatedFreezePeriods = [...(customer.freezePeriods || []), freezePeriod];

    updateCustomer(customerId, {
      status: 'frozen',
      freezePeriods: updatedFreezePeriods
    });

    return {
      success: true,
      message: `Membership frozen from ${startDate} to ${endDate}`,
      freezePeriod
    };
  }, [getCustomer, updateCustomer]);

  const unfreezeMembership = useCallback((customerId) => {
    const customer = getCustomer(customerId);
    
    if (!customer) {
      return { success: false, error: 'Customer not found' };
    }

    if (customer.status !== 'frozen') {
      return { success: false, error: 'Membership is not frozen' };
    }

    // Check if membership is expired
    const isExpired = new Date(customer.endDate) < new Date();
    
    updateCustomer(customerId, {
      status: isExpired ? 'expired' : 'active'
    });

    return {
      success: true,
      message: 'Membership unfrozen successfully',
      newStatus: isExpired ? 'expired' : 'active'
    };
  }, [getCustomer, updateCustomer]);

  const checkFreezeStatus = useCallback((customerId) => {
    const customer = getCustomer(customerId);
    
    if (!customer) {
      return { isFrozen: false };
    }

    const now = new Date();
    const activeFreezes = (customer.freezePeriods || []).filter(freeze => {
      const start = new Date(freeze.startDate);
      const end = new Date(freeze.endDate);
      return now >= start && now <= end;
    });

    return {
      isFrozen: customer.status === 'frozen',
      activeFreezes,
      totalFreezeDays: activeFreezes.reduce((total, freeze) => {
        const start = new Date(freeze.startDate);
        const end = new Date(freeze.endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return total + days;
      }, 0)
    };
  }, [getCustomer]);

  return {
    freezeMembership,
    unfreezeMembership,
    checkFreezeStatus
  };
};
