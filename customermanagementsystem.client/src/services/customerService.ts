const API_BASE_URL = 'https://localhost:7267';

interface ApiError {
    message: string;
    details?: any;
    status?: number;
}

class CustomerService {
    private requestTimeout = 10000;
    private abortController: AbortController | null = null;

    cancelRequests() {
        if (this.abortController) {
            this.abortController.abort();
        }
    }

    async makeRequest(url: string, options: RequestInit = {}): Promise<any> {
        this.cancelRequests();
        this.abortController = new AbortController();

        try {
            const timeoutId = setTimeout(() => {
                this.abortController?.abort();
            }, this.requestTimeout);

            const response = await fetch(`${API_BASE_URL}${url}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...options.headers,
                },
                signal: this.abortController.signal,
                ...options,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`;

                try {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorData.title || errorData.error || errorMessage;
                    }
                } catch (parseError) {
                    console.warn('Could not parse error response:', parseError);
                }

                switch (response.status) {
                    case 400:
                        throw new Error(`Bad Request: ${errorMessage}`);
                    case 401:
                        throw new Error('Unauthorized: Please check your credentials');
                    case 403:
                        throw new Error('Forbidden: You do not have permission');
                    case 404:
                        throw new Error('Not Found: The requested resource was not found');
                    case 500:
                        throw new Error('Server Error: Please try again later');
                    case 502:
                    case 503:
                    case 504:
                        throw new Error('Server is temporarily unavailable. Please try again later');
                    default:
                        throw new Error(errorMessage);
                }
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }

            return null;
        } catch (error) {
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new Error('Request was cancelled or timed out');
                }
                console.error('API request failed:', error);
                throw error;
            }
            throw new Error('An unexpected error occurred');
        } finally {
            this.abortController = null;
        }
    }

    async getCustomers(pageNumber: number = 1, pageSize: number = 10, searchTerm: string = '') {
        try {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 10;

            const queryParams = new URLSearchParams({
                pageNumber: pageNumber.toString(),
                pageSize: pageSize.toString(),
                ...(searchTerm.trim() && { searchTerm: searchTerm.trim() })
            });

            const data = await this.makeRequest(`/api/customers?${queryParams}`);

            return {
                data: data?.data || data || [],
                totalCount: data?.totalCount || 0,
                totalPages: data?.totalPages || 1,
                currentPage: data?.currentPage || pageNumber
            };
        } catch (error) {
            console.error('Failed to fetch customers:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to load customers');
        }
    }

    async getCustomerById(id: number) {
        try {
            if (!id || id <= 0) {
                throw new Error('Invalid customer ID');
            }

            const data = await this.makeRequest(`/api/customers/${id}`);
            return data;
        } catch (error) {
            console.error(`Failed to fetch customer ${id}:`, error);
            throw new Error(error instanceof Error ? error.message : 'Failed to load customer');
        }
    }

    async createCustomer(customerData: any) {
        try {
            if (!customerData.name?.trim()) {
                throw new Error('Customer name is required');
            }
            if (!customerData.email?.trim()) {
                throw new Error('Customer email is required');
            }

            const cleanData = {
                name: customerData.name.trim(),
                email: customerData.email.trim(),
                ...(customerData.phone?.trim() && { phone: customerData.phone.trim() }),
                ...(customerData.address?.trim() && { address: customerData.address.trim() })
            };

            const data = await this.makeRequest('/api/customers', {
                method: 'POST',
                body: JSON.stringify(cleanData),
            });

            return data;
        } catch (error) {
            console.error('Failed to create customer:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to create customer');
        }
    }

    async updateCustomer(id: number, customerData: any) {
        try {
            if (!id || id <= 0) {
                throw new Error('Invalid customer ID');
            }

            if (!customerData.name?.trim()) {
                throw new Error('Customer name is required');
            }
            if (!customerData.email?.trim()) {
                throw new Error('Customer email is required');
            }

            const cleanData = {
                id: id,
                name: customerData.name.trim(),
                email: customerData.email.trim(),
                ...(customerData.phone?.trim() && { phone: customerData.phone.trim() }),
                ...(customerData.address?.trim() && { address: customerData.address.trim() })
            };

            await this.makeRequest(`/api/customers/${id}`, {
                method: 'PUT',
                body: JSON.stringify(cleanData),
            });

            return true;
        } catch (error) {
            console.error(`Failed to update customer ${id}:`, error);
            throw new Error(error instanceof Error ? error.message : 'Failed to update customer');
        }
    }

    async deleteCustomer(id: number) {
        try {
            if (!id || id <= 0) {
                throw new Error('Invalid customer ID');
            }

            await this.makeRequest(`/api/customers/${id}`, {
                method: 'DELETE',
            });

            return true;
        } catch (error) {
            console.error(`Failed to delete customer ${id}:`, error);
            throw new Error(error instanceof Error ? error.message : 'Failed to delete customer');
        }
    }
}

const customerService = new CustomerService();
export default customerService;