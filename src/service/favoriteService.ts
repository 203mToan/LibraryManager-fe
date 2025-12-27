import axiosInstance from './api';
import { BookResponse } from './bookService';

export interface FavoriteBookResponse extends BookResponse {
  isFavorited?: boolean;
}

// Get all favorite books for current user
export const getFavoriteBooks = async (
  page?: number,
  pageSize?: number
): Promise<{
  items: FavoriteBookResponse[];
  totalItems: number;
  pageSize: number | null;
  totalPages: number;
}> => {
  try {
    let url = '/api/favorite';
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

    const response = await axiosInstance.get<{
      items: FavoriteBookResponse[];
      totalItems: number;
      pageSize: number | null;
      totalPages: number;
    }>(url);

    return response.data;
  } catch (error) {
    console.error('Failed to fetch favorite books:', error);
    throw error;
  }
};

// Add book to favorites
export const addFavorite = async (bookId: string): Promise<void> => {
  try {
    await axiosInstance.post(`/api/favorite/${bookId}`);
  } catch (error) {
    console.error('Failed to add favorite:', error);
    throw error;
  }
};

// Remove book from favorites
export const removeFavorite = async (bookId: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/favorite/${bookId}`);
  } catch (error) {
    console.error('Failed to remove favorite:', error);
    throw error;
  }
};

// Check if a book is favorited
export const isFavorited = async (bookId: string): Promise<boolean> => {
  try {
    const response = await axiosInstance.get<boolean>(
      `/api/favorite/${bookId}/is-favorited`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to check favorite status:', error);
    return false;
  }
};
