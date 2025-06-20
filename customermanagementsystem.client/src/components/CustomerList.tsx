import { useState } from 'react';
import type { FormEvent } from 'react';
import type { CustomerWithRequiredFields, CustomerListProps } from '../types/customer.types';

const CustomerList: React.FC<CustomerListProps> = ({
    customers,
    onEdit,
    onDelete,
    onCreate,
    onSearch,
    loading,
    searchTerm,
    currentPage,
    totalPages,
    totalCount,
    onPageChange
}) => {
    const [localSearchTerm, setLocalSearchTerm] = useState<string>(searchTerm);

    const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSearch(localSearchTerm);
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderPagination = (): JSX.Element | null => {
        if (totalPages <= 1) return null;

        const pages: JSX.Element[] = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
                    onClick={() => onPageChange(i)}
                    disabled={loading}
                >
                    {i}
                </button>
            );
        }

        return (
            <div className="pagination">
                <button
                    className="pagination-btn"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                >
                    Previous
                </button>
                {startPage > 1 && (
                    <>
                        <button
                            className="pagination-btn"
                            onClick={() => onPageChange(1)}
                            disabled={loading}
                        >
                            1
                        </button>
                        {startPage > 2 && <span className="pagination-ellipsis">...</span>}
                    </>
                )}
                {pages}
                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
                        <button
                            className="pagination-btn"
                            onClick={() => onPageChange(totalPages)}
                            disabled={loading}
                        >
                            {totalPages}
                        </button>
                    </>
                )}
                <button
                    className="pagination-btn"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                >
                    Next
                </button>
            </div>
        );
    };

    return (
        <div className="customer-list">
            <div className="list-header">
                <h2>Customer List ({totalCount} customers)</h2>
                <div className="list-actions">
                    <form onSubmit={handleSearchSubmit} className="search-form">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={localSearchTerm}
                            onChange={(e) => setLocalSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <button
                            type="submit"
                            className="btn btn-secondary"
                            disabled={loading}
                        >
                            Search
                        </button>
                    </form>
                    <button
                        className="btn btn-primary"
                        onClick={onCreate}
                        disabled={loading}
                    >
                        Add New Customer
                    </button>
                </div>
            </div>

            {loading && <div className="loading">Loading...</div>}

            {!loading && customers.length === 0 && (
                <div className="empty-state">
                    <p>No customers found.</p>
                </div>
            )}

            {!loading && customers.length > 0 && (
                <>
                    <div className="table-container">
                        <table className="customer-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Address</th>
                                    <th>Created Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer: CustomerWithRequiredFields) => (
                                    <tr key={customer.id}>
                                        <td>{customer.name}</td>
                                        <td>{customer.email}</td>
                                        <td>{customer.phone || 'N/A'}</td>
                                        <td>{customer.address || 'N/A'}</td>
                                        <td>{formatDate(customer.createdDate)}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => onEdit(customer)}
                                                    disabled={loading}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => onDelete(customer.id)}
                                                    disabled={loading}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {renderPagination()}
                </>
            )}
        </div>
    );
};

export default CustomerList;