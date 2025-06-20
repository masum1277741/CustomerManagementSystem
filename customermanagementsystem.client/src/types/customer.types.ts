export interface Customer {
    id?: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    createdDate?: string;
}

export interface CustomerWithRequiredFields extends Customer {
    id: number;
    createdDate: string;
}

export interface FormData {
    name: string;
    email: string;
    phone?: string; 
    address?: string; 
}

export interface FormErrors {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
}

export interface CustomerFormProps {
    customer?: Customer | null;
    onSubmit: (formData: FormData) => Promise<void>;
    onCancel: () => void;
    loading: boolean;
}

export interface CustomerListProps {
    customers: CustomerWithRequiredFields[];
    onEdit: (customer: CustomerWithRequiredFields) => void;
    onDelete: (customerId: number) => void;
    onCreate: () => void;
    onSearch: (searchTerm: string) => void;
    loading: boolean;
    searchTerm: string;
    currentPage: number;
    totalPages: number;
    totalCount: number;
    onPageChange: (page: number) => void;
}