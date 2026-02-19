import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import CustomerCard from '../components/Customer/CustomerCard';
import CustomerForm from '../components/Customer/CustomerForm';
import SearchBar from '../components/Shared/SearchBar';
import FilterPanel from '../components/Shared/FilterPanel';
import './CustomersPage.css';

const CustomersPage = () => {
  const { customers } = useData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const filters = [
    { 
      value: 'all', 
      label: 'All', 
      icon: '👥',
      count: customers.length 
    },
    { 
      value: 'active', 
      label: 'Active', 
      icon: '✓',
      count: customers.filter(c => c.status === 'active').length 
    },
    { 
      value: 'frozen', 
      label: 'Frozen', 
      icon: '❄️',
      count: customers.filter(c => c.status === 'frozen').length 
    },
    { 
      value: 'expired', 
      label: 'Expired', 
      icon: '⚠️',
      count: customers.filter(c => c.status === 'expired').length 
    },
    { 
      value: 'low-sessions', 
      label: 'Low Sessions', 
      icon: '🎟️',
      count: customers.filter(c => c.remainingSessions < 5 && c.status === 'active').length 
    }
  ];

  const filteredCustomers = customers.filter(customer => {
    // Search filter
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.id.toString().includes(searchTerm);

    // Status filter
    let matchesStatus = true;
    if (statusFilter === 'low-sessions') {
      matchesStatus = customer.remainingSessions < 5 && customer.status === 'active';
    } else if (statusFilter !== 'all') {
      matchesStatus = customer.status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  const handleUpdate = () => {
    setUpdateTrigger(prev => prev + 1);
  };

  return (
    <div className="customers-page">
      <div className="page-header">
        <h1>Customers</h1>
        <button className="primary" onClick={() => setShowForm(true)}>
          + Add New Customer
        </button>
      </div>

      <div className="page-controls">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by name, phone, email, or ID..."
        />
        
        <FilterPanel
          filters={filters}
          activeFilter={statusFilter}
          onFilterChange={setStatusFilter}
        />
      </div>

      <div className="customers-grid">
        {filteredCustomers.map(customer => (
          <CustomerCard
            key={customer.id}
            customer={customer}
            onClick={(cust) => navigate(`/customers/${cust.id}`)}
          />
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="empty-state-large">
          <h3>No customers found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      )}

      {showForm && (
        <CustomerForm
          onClose={() => setShowForm(false)}
          onSubmit={handleUpdate}
        />
      )}
    </div>
  );
};

export default CustomersPage;
