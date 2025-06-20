import { useEffect, useState, useCallback, useRef } from 'react';
import './App.css';
import CustomerForm from './components/CustomerForm';
import CustomerList from './components/CustomerList';
import customerService from './services/customerService';

interface Customer {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    createdDate: string;
}

interface CustomerFormData {
    name: string;
    email: string;
    phone?: string;
    address?: string;
}

interface ApiResponse {
    data: Customer[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
}

type ViewMode = 'list' | 'create' | 'edit';

function App() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [pageSize] = useState<number>(10);

    const loadingRef = useRef<boolean>(false);
    const mountedRef = useRef<boolean>(true);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
            customerService.cancelRequests();
        };
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (mountedRef.current) {
                loadCustomers();
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [currentPage, searchTerm]);

    const loadCustomers = useCallback(async () => {
        if (loadingRef.current) return;

        try {
            loadingRef.current = true;
            setLoading(true);
            setError('');

            const response: ApiResponse = await customerService.getCustomers(
                currentPage,
                pageSize,
                searchTerm
            );

            if (mountedRef.current) {
                setCustomers(response.data || []);
                setTotalCount(response.totalCount || 0);
                setTotalPages(response.totalPages || 1);
                setCurrentPage(response.currentPage || currentPage);
            }
        } catch (err) {
            if (mountedRef.current) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to load customers';
                console.error('Failed to load customers:', errorMessage);
                setError(errorMessage);
                setCustomers([]);
                setTotalCount(0);
                setTotalPages(1);
            }
        } finally {
            loadingRef.current = false;
            if (mountedRef.current) {
                setLoading(false);
            }
        }
    }, [currentPage, pageSize, searchTerm]);

    const handleCreateCustomer = async (formData: CustomerFormData) => {
        try {
            setError('');
            await customerService.createCustomer(formData);

            if (mountedRef.current) {
                setCurrentPage(1);
                setSearchTerm('');
                await loadCustomers();
                setViewMode('list');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create customer';
            if (mountedRef.current) {
                setError(errorMessage);
            }
            throw err;
        }
    };

    const handleUpdateCustomer = async (formData: CustomerFormData) => {
        if (!editingCustomer) return;

        try {
            setError('');
            await customerService.updateCustomer(editingCustomer.id, formData);

            if (mountedRef.current) {
                await loadCustomers();
                setViewMode('list');
                setEditingCustomer(null);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update customer';
            if (mountedRef.current) {
                setError(errorMessage);
            }
            throw err;
        }
    };

    const handleDeleteCustomer = async (customerId: number) => {
        if (!window.confirm('Are you sure you want to delete this customer?')) {
            return;
        }

        try {
            setLoading(true);
            setError('');

            await customerService.deleteCustomer(customerId);

            if (mountedRef.current) {
                if (customers.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    await loadCustomers();
                }
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete customer';
            if (mountedRef.current) {
                setError(errorMessage);
            }
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
        }
    };

    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term);
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handleCreateClick = useCallback(() => {
        setViewMode('create');
        setEditingCustomer(null);
        setError('');
    }, []);

    const handleEditClick = useCallback((customer: Customer) => {
        setEditingCustomer(customer);
        setViewMode('edit');
        setError('');
    }, []);

    const handleCancelForm = useCallback(() => {
        setViewMode('list');
        setEditingCustomer(null);
        setError('');
    }, []);

    const handleFormSubmit = async (formData: CustomerFormData) => {
        try {
            if (viewMode === 'create') {
                await handleCreateCustomer(formData);
            } else if (viewMode === 'edit') {
                await handleUpdateCustomer(formData);
            }
        } catch (err) {
            // Error handling is done in individual functions
        }
    };

    const handleRetry = useCallback(() => {
        setError('');
        loadCustomers();
    }, [loadCustomers]);

    return (
        <div className="app">
            <div className="container">
                <header className="app-header">
                    <h1>Customer Management System</h1>
                    <p>Manage your customers efficiently</p>

                    {error && (
                        <div className="alert alert-error">
                            <div className="error-content">
                                <span>{error}</span>
                                <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={handleRetry}
                                    disabled={loading}
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    )}
                </header>

                <main>
                    {viewMode === 'list' && (
                        <CustomerList
                            customers={customers}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteCustomer}
                            onCreate={handleCreateClick}
                            onSearch={handleSearch}
                            loading={loading}
                            searchTerm={searchTerm}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalCount={totalCount}
                            onPageChange={handlePageChange}
                        />
                    )}

                    {(viewMode === 'create' || viewMode === 'edit') && (
                        <CustomerForm
                            customer={editingCustomer}
                            onSubmit={handleFormSubmit}
                            onCancel={handleCancelForm}
                            loading={loading}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}

export default App;