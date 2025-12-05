import axiosInstance from './api';

export interface ReviewPayload {
  bookId: string;
  userId: string;
  rating: number;
  comment: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface ReviewResponse {
  id: string;
  bookId: string;
  userId: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  pageSize: number | null;
  totalPages: number;
}

// Get all reviews with pagination
export const getAllReviews = async (
  page?: number,
  pageSize?: number
): Promise<PaginatedResponse<ReviewResponse>> => {
  try {
    let url = '/api/review';
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
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

// Get review by ID
export const getReviewById = async (id: string): Promise<ReviewResponse> => {
  try {
    const response = await axiosInstance.get(`/api/review/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching review:', error);
    throw error;
  }
};

// Create new review
export const createReview = async (payload: ReviewPayload): Promise<ReviewResponse> => {
  try {
    const params = new URLSearchParams();
    params.append('BookId', payload.bookId);
    params.append('UserId', payload.userId);
    params.append('Rating', payload.rating.toString());
    params.append('Comment', payload.comment);
    if (payload.status) {
      params.append('Status', payload.status);
    }

    const response = await axiosInstance.post(`/api/review?${params.toString()}`, null);
    return response.data;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

// Update review
export const updateReview = async (id: string, payload: Partial<ReviewPayload>): Promise<ReviewResponse> => {
  try {
    const params = new URLSearchParams();
    params.append('Id', id);
    
    if (payload.bookId) {
      params.append('BookId', payload.bookId);
    }
    if (payload.userId) {
      params.append('UserId', payload.userId);
    }
    if (payload.rating !== undefined) {
      params.append('Rating', payload.rating.toString());
    }
    if (payload.comment) {
      params.append('Comment', payload.comment);
    }
    if (payload.status) {
      params.append('Status', payload.status);
    }

    const response = await axiosInstance.put(`/api/review?${params.toString()}`, null);
    return response.data;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

// Delete review
export const deleteReview = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/review/${id}`);
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

// Approve review
export const approveReview = async (id: string): Promise<ReviewResponse> => {
  try {
    const response = await axiosInstance.put(`/api/review/${id}/approve`, null);
    return response.data;
  } catch (error) {
    console.error('Error approving review:', error);
    throw error;
  }
};

// Reject review
export const rejectReview = async (id: string): Promise<ReviewResponse> => {
  try {
    const response = await axiosInstance.put(`/api/review/${id}/reject`, null);
    return response.data;
  } catch (error) {
    console.error('Error rejecting review:', error);
    throw error;
  }
};
