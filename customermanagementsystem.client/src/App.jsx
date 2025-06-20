import { useState, useEffect } from 'react';
import CustomerList from './components/CustomerList';
import CustomerForm from './components/CustomerForm';
import customerService from './services/customerService';
import './App.css';

function App() {
  const [customers, setCustomers] = useState([]);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    loadCustomers();
  }, [currentPage, searchTerm]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await customerService.getCustomers(currentPage, pageSize, searchTerm);
      setCustomers(response.customers);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalCount);
    } catch (err) {
      setError('Failed to load customers');
      console.error('Error loading customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = () => {
    setCurrentCustomer(null);
    setShowForm(true);
  };

  const handleEditCustomer = (customer) => {
    setCurrentCustomer(customer);
    setShowForm(true);
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        setLoading(true);
        await customerService.deleteCustomer(id);
        await loadCustomers();
        setError('');
      } catch (err) {
        setError('Failed to delete customer');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFormSubmit = async (customerData) => {
    try {
      setLoading(true);
      setError('');
      
      if (currentCustomer) {
        await customerService.updateCustomer(currentCustomer.id, customerData);
      } else {
        await customerService.createCustomer(customerData);
      }
      
      setShowForm(false);
      setCurrentCustomer(null);
      await loadCustomers();
    } catch (err) {
      setError(err.message || 'Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setCurrentCustomer(null);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="app">
      <div className="container">
        <header className="app-header">
          <h1>Customer Management System</h1>
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}
        </header>

        {showForm ? (
          <CustomerForm
            customer={currentCustomer}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            loading={loading}
          />
        ) : (
          <CustomerList
            customers={customers}
            onEdit={handleEditCustomer}
            onDelete={handleDeleteCustomer}
            onCreate={handleCreateCustomer}
            onSearch={handleSearch}
            loading={loading}
            searchTerm={searchTerm}
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}

export default App;