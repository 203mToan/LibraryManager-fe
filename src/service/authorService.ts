import axiosInstance from './api';

export interface AuthorPayload {
  fullName: string;
  bio: string;
  id?: any;
}

export interface AuthorResponse {
  id: string;
  fullName: string;
  bio: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  pageSize: number | null;
  totalPages: number;
}

// Get all authors with pagination
export const getAllAuthors = async (
  page?: number,
  pageSize?: number
): Promise<PaginatedResponse<AuthorResponse>> => {
  try {
    let url = '/api/author';
    const params = new URLSearchParams();
    
    if (page !== undefined && page > 0) {
      params.append('page', page.toString());
    }
    if (pageSize !== undefined && pageSize > 0) {
      params.append('pageSize', pageSize.toString());
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await axiosInstance.get(url);
    
    // Handle both paginated and non-paginated responses
    if (response.data.items) {
      return response.data;
    }
    
    // If it's just an array, wrap it in pagination response
    return {
      items: response.data || [],
      totalItems: (response.data || []).length,
      pageSize: null,
      totalPages: 1,
    };
  } catch (error) {
    console.error('Error fetching authors:', error);
    throw error;
  }
};

// Get author by ID
export const getAuthorById = async (id: string): Promise<AuthorResponse> => {
  try {
    const response = await axiosInstance.get(`/api/author/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching author:', error);
    throw error;
  }
};

// Create new author
export const createAuthor = async (payload: AuthorPayload): Promise<AuthorResponse> => {
  try {
    const response = await axiosInstance.post('/api/author', payload);
    return response.data;
  } catch (error) {
    console.error('Error creating author:', error);
    throw error;
  }
};

// Update author
export const updateAuthor = async (
  payload: AuthorPayload
): Promise<AuthorResponse> => {
  try {
    const response = await axiosInstance.put(`/api/author`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating author:', error);
    throw error;
  }
};

// Delete author
export const deleteAuthor = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/author/${id}`);
  } catch (error) {
    console.error('Error deleting author:', error);
    throw error;
  }
};
