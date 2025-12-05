import axiosInstance from './api';

export interface LoanPayload {
  userId: string;
  bookId: number | string;
  loanDate: string;
  dueDate: string;
}

export interface LoanResponse {
  id: number;
  userId: string;
  bookName: string;
  bookId: number | string;
  loanDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'Pending' | 'Approved' | 'Returned' | 'overdue';
  fineAmount: number;
  renewCount: number;
  userName?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  pageSize: number | null;
  totalPages: number;
}

// Create loan request
export const createLoan = async (payload: LoanPayload): Promise<LoanResponse> => {
  try {
    const response = await axiosInstance.post('/api/Loan', payload);
    return response.data;
  } catch (error) {
    console.error('Error creating loan:', error);
    throw error;
  }
};

// Get all loans
export const getAllLoans = async (): Promise<LoanResponse[]> => {
  try {
    const response = await axiosInstance.get('/api/Loan');
    return Array.isArray(response.data) ? response.data : response.data.items || [];
  } catch (error) {
    console.error('Error fetching loans:', error);
    throw error;
  }
};

// Get loan by ID
export const getLoanById = async (id: number): Promise<LoanResponse> => {
  try {
    const response = await axiosInstance.get(`/api/Loan/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching loan:', error);
    throw error;
  }
};

// Get my loans (current user)
export const getMyLoans = async (): Promise<LoanResponse[]> => {
  try {
    const response = await axiosInstance.get('/api/Loan/my');
    return Array.isArray(response.data) ? response.data : response.data.items || [];
  } catch (error) {
    console.error('Error fetching my loans:', error);
    throw error;
  }
};

// Return loan (mark as returned)
export const returnLoan = async (id: number, returnDate: string): Promise<LoanResponse> => {
  try {
    const response = await axiosInstance.put(`/api/Loan/return/${id}`, returnDate);
    return response.data;
  } catch (error) {
    console.error('Error returning loan:', error);
    throw error;
  }
};

// Approve loan (for managers)
export const approveLoan = async (id: number): Promise<LoanResponse> => {
  try {
    const response = await axiosInstance.put(`/api/Loan/approve/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error approving loan:', error);
    throw error;
  }
};

// Pay fineAmount
export const payFine = async (id: number): Promise<LoanResponse> => {
  try {
    const response = await axiosInstance.put(`/api/Loan/pay-fineAmount/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error paying fineAmount:', error);
    throw error;
  }
};
