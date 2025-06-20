import { useState, useEffect, useCallback } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import type { Customer, FormData, FormErrors, CustomerFormProps } from '../types/customer.types';

const CustomerForm: React.FC<CustomerFormProps> = ({
    customer,
    onSubmit,
    onCancel,
    loading
}) => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [formLoading, setFormLoading] = useState<boolean>(false);
    const [submitAttempted, setSubmitAttempted] = useState<boolean>(false);

    useEffect(() => {
        if (customer) {
            setFormData({
                name: customer.name || '',
                email: customer.email || '',
                phone: customer.phone || '',
                address: customer.address || ''
            });
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                address: ''
            });
        }
        setErrors({});
        setSubmitAttempted(false);
    }, [customer]);

    const validateForm = useCallback((): boolean => {
        const newErrors: FormErrors = {};

        const trimmedName = formData.name.trim();
        if (!trimmedName) {
            newErrors.name = 'Name is required';
        } else if (trimmedName.length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        } else if (trimmedName.length > 100) {
            newErrors.name = 'Name cannot exceed 100 characters';
        }
        const trimmedEmail = formData.email.trim();
        if (!trimmedEmail) {
            newErrors.email = 'Email is required';
        } else if (trimmedEmail.length > 150) {
            newErrors.email = 'Email cannot exceed 150 characters';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            newErrors.email = 'Please enter a valid email address';
        }

        const trimmedPhone = formData.phone?.trim();
        if (trimmedPhone) {
            if (trimmedPhone.length > 20) {
                newErrors.phone = 'Phone cannot exceed 20 characters';
            } else if (!/^[+]?[\d\s\-\(\)]+$/.test(trimmedPhone)) {
                newErrors.phone = 'Please enter a valid phone number';
            }
        }

        const trimmedAddress = formData.address?.trim();
        if (trimmedAddress && trimmedAddress.length > 500) {
            newErrors.address = 'Address cannot exceed 500 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    useEffect(() => {
        if (submitAttempted) {
            const timeoutId = setTimeout(() => {
                validateForm();
            }, 300); 

            return () => clearTimeout(timeoutId);
        }
    }, [formData, submitAttempted, validateForm]);

    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    }, [errors]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitAttempted(true);

        if (!validateForm()) {
            return;
        }

        try {
            setFormLoading(true);

            const cleanedData: FormData = {
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                phone: formData.phone?.trim() || undefined,
                address: formData.address?.trim() || undefined
            };

            const result = onSubmit(cleanedData);
            if (result && typeof result.then === 'function') {
                await result;
            }
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setFormLoading(false);
        }
    };

    const handleCancel = useCallback(() => {
        if (formLoading) return;
        onCancel();
    }, [formLoading, onCancel]);

    const isEditMode = customer !== null && customer !== undefined;
    const isSubmitDisabled = loading || formLoading;

    return (
        <div className="customer-form">
            <div className="form-header">
                <h2>{isEditMode ? 'Edit Customer' : 'Add New Customer'}</h2>
                {isEditMode && customer && (
                    <p className="form-subtitle">Customer ID: {customer.id}</p>
                )}
            </div>

            <form onSubmit={handleSubmit} className="form" noValidate>
                <div className="form-group">
                    <label htmlFor="name" className="form-label">
                        Name <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`form-input ${errors.name ? 'error' : ''}`}
                        placeholder="Enter customer name"
                        maxLength={100}
                        disabled={isSubmitDisabled}
                        autoComplete="name"
                        required
                    />
                    {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="email" className="form-label">
                        Email <span className="required">*</span>
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`form-input ${errors.email ? 'error' : ''}`}
                        placeholder="Enter customer email"
                        maxLength={150}
                        disabled={isSubmitDisabled}
                        autoComplete="email"
                        required
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="phone" className="form-label">
                        Phone
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleInputChange}
                        className={`form-input ${errors.phone ? 'error' : ''}`}
                        placeholder="Enter customer phone"
                        maxLength={20}
                        disabled={isSubmitDisabled}
                        autoComplete="tel"
                    />
                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="address" className="form-label">
                        Address
                    </label>
                    <textarea
                        id="address"
                        name="address"
                        value={formData.address || ''}
                        onChange={handleInputChange}
                        className={`form-textarea ${errors.address ? 'error' : ''}`}
                        placeholder="Enter customer address"
                        maxLength={500}
                        rows={4}
                        disabled={isSubmitDisabled}
                        autoComplete="street-address"
                    />
                    {errors.address && <span className="error-message">{errors.address}</span>}
                    <div className="character-count">
                        {(formData.address || '').length}/500 characters
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleCancel}
                        disabled={isSubmitDisabled}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitDisabled}
                    >
                        {formLoading ? 'Saving...' : loading ? 'Please wait...' : (isEditMode ? 'Update Customer' : 'Create Customer')}
                    </button>
                </div>

                {/* Loading indicator */}
                {(loading || formLoading) && (
                    <div className="form-loading">
                        <div className="loading-spinner"></div>
                        <span>Processing...</span>
                    </div>
                )}
            </form>
        </div>
    );
};

export default CustomerForm;