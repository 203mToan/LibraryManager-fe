import axiosInstance from './api';

/* =======================
   Interfaces
======================= */

export interface AuthorPayload {
  fullName: string;
  bio: string;
  birthYear?: number;
  nationality?: string;
  id?: string | null;
}

export interface AuthorResponse {
  id: string;
  fullName: string;
  bio: string;
  birthYear?: number;
  nationality?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  pageSize: number;
  totalPages: number;
}

/* =======================
   Services
======================= */

/**
 * FE pagination (backend chưa hỗ trợ)
 */
export const getAllAuthors = async (
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedResponse<AuthorResponse>> => {
  try {
    // Backend hiện tại trả về TOÀN BỘ authors
    const response = await axiosInstance.get('/api/author');

    const allItems: AuthorResponse[] = Array.isArray(response.data?.items)
      ? response.data.items 
      : [];

    const totalItems = allItems.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const items = allItems.slice(startIndex, endIndex);

    return {
      items,
      totalItems,
      pageSize,
      totalPages,
    };
  } catch (error) {
    console.error('Error fetching authors:', error);
    throw error;
  }
};

/**
 * Get author by ID
 */
export const getAuthorById = async (id: string): Promise<AuthorResponse> => {
  try {
    const response = await axiosInstance.get(`/api/author/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching author:', error);
    throw error;
  }
};

/**
 * Create author
 */
export const createAuthor = async (
  payload: AuthorPayload
): Promise<AuthorResponse> => {
  try {
    const response = await axiosInstance.post('/api/author', payload);
    return response.data;
  } catch (error) {
    console.error('Error creating author:', error);
    throw error;
  }
};

/**
 * Update author
 */
export const updateAuthor = async (
  payload: AuthorPayload
): Promise<AuthorResponse> => {
  try {
    const response = await axiosInstance.put('/api/author', payload);
    return response.data;
  } catch (error) {
    console.error('Error updating author:', error);
    throw error;
  }
};

/**
 * Delete author
 */
export const deleteAuthor = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/author/${id}`);
  } catch (error) {
    console.error('Error deleting author:', error);
    throw error;
  }
};
