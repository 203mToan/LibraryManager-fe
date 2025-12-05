import axiosInstance from './api';

export interface BookPayload {
  title: string;
  description?: string;
  summary?: string;
  thumbnailUrl?: string;
  authorId: string;
  categoryId: string;
  publisher: string;
  yearPublished: number;
  stockQuantity: number;
}

export interface BookResponse {
  id: string;
  title: string;
  description?: string;
  summary?: string;
  thumbnailUrl?: string;
  authorId: string;
  categoryId: string;
  publisher: string;
  yearPublished: number;
  stockQuantity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  pageSize: number | null;
  totalPages: number;
}

// Get all books with pagination
export const getAllBooks = async (
  page?: number,
  pageSize?: number
): Promise<PaginatedResponse<BookResponse>> => {
  try {
    let url = '/api/book';
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
    console.error('Error fetching books:', error);
    throw error;
  }
};

// Get book by ID
export const getBookById = async (id: string): Promise<BookResponse> => {
  try {
    const response = await axiosInstance.get(`/api/book/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching book:', error);
    throw error;
  }
};

// Create new book
export const createBook = async (payload: BookPayload): Promise<BookResponse> => {
  try {
    const params = new URLSearchParams();
    params.append('Title', payload.title);
    params.append('Description', payload.description || '');
    params.append('Summary', payload.summary || '');
    params.append('ThumbnailUrl', payload.thumbnailUrl || '');
    params.append('AuthorId', payload.authorId);
    params.append('CategoryId', payload.categoryId);
    params.append('Publisher', payload.publisher);
    params.append('YearPublished', payload.yearPublished.toString());
    params.append('StockQuantity', payload.stockQuantity.toString());
    
    const response = await axiosInstance.post(`/api/book?${params.toString()}`, null);
    return response.data;
  } catch (error) {
    console.error('Error creating book:', error);
    throw error;
  }
};

// Update book
export const updateBook = async (
  id: string,
  payload: BookPayload
): Promise<BookResponse> => {
  try {
    const params = new URLSearchParams();
    params.append('Title', payload.title);
    params.append('Description', payload.description || '');
    params.append('Summary', payload.summary || '');
    params.append('ThumbnailUrl', payload.thumbnailUrl || '');
    params.append('AuthorId', payload.authorId);
    params.append('CategoryId', payload.categoryId);
    params.append('Publisher', payload.publisher);
    params.append('YearPublished', payload.yearPublished.toString());
    params.append('StockQuantity', payload.stockQuantity.toString());
    
    const response = await axiosInstance.put(`/api/book?id=${id}&${params.toString()}`, null);
    return response.data;
  } catch (error) {
    console.error('Error updating book:', error);
    throw error;
  }
};

// Delete book
export const deleteBook = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/book?id=${id}`);
  } catch (error) {
    console.error('Error deleting book:', error);
    throw error;
  }
};
