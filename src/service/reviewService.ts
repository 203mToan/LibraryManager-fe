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
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
  // Optional fields if backend returns them
  bookTitle?: string;
  bookName?: string;
  userName?: string;
  userFullName?: string;
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
    let url = '/api/comment';
    const params = new URLSearchParams();
    
    // Use PascalCase for C# backend
    params.append('page', (page || 1).toString());
    params.append('pageSize', (pageSize || 10).toString());
    
    url += `?${params.toString()}`;

    console.log('Fetching from URL:', url);
    const response = await axiosInstance.get(url);
    console.log('Response data:', response.data);
    
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
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    console.error('Error response data:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// Get review by ID
export const getReviewById = async (id: string): Promise<ReviewResponse> => {
  try {
    const response = await axiosInstance.get(`/api/comment/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching review:', error);
    throw error;
  }
};

// Create new review
export const createReview = async (payload: ReviewPayload): Promise<ReviewResponse> => {
  try {
    const response = await axiosInstance.post('/api/comment', {
      bookId: parseInt(payload.bookId),
      rating: payload.rating,
      comment: payload.comment,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

// Update review
export const updateReview = async (id: string, payload: Partial<ReviewPayload>): Promise<ReviewResponse> => {
  try {
    const response = await axiosInstance.put(`/api/comment/${id}`, {
      rating: payload.rating,
      comment: payload.comment,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

// Delete review
export const deleteReview = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/comment/${id}`);
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

// Approve review
export const approveReview = async (id: string): Promise<ReviewResponse> => {
  try {
    const response = await axiosInstance.put(`/api/comment/${id}/approve`, null);
    return response.data;
  } catch (error) {
    console.error('Error approving review:', error);
    throw error;
  }
};

// Reject review
export const rejectReview = async (id: string): Promise<ReviewResponse> => {
  try {
    const response = await axiosInstance.put(`/api/comment/${id}/reject`, null);
    return response.data;
  } catch (error) {
    console.error('Error rejecting review:', error);
    throw error;
  }
};
