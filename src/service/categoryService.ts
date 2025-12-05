import axiosInstance from './api';

export interface CategoryPayload {
  name: string;
  description?: string;
}

export interface CategoryResponse {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  pageSize: number | null;
  totalPages: number;
}

// Get all categories with pagination
export const getAllCategories = async (
  page?: number,
  pageSize?: number
): Promise<PaginatedResponse<CategoryResponse>> => {
  try {
    let url = '/api/category';
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
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Get category by ID
export const getCategoryById = async (id: string): Promise<CategoryResponse> => {
  try {
    const response = await axiosInstance.get(`/api/category/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
};

// Create new category
export const createCategory = async (payload: CategoryPayload): Promise<CategoryResponse> => {
  try {
    // Build URL with query parameters for Name and Description
    const params = new URLSearchParams();
    params.append('Name', payload.name);
    if (payload.description) {
      params.append('Description', payload.description);
    }
    
    const response = await axiosInstance.post(`/api/category?${params.toString()}`, null);
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

// Update category
export const updateCategory = async (
  id: string,
  payload: CategoryPayload
): Promise<CategoryResponse> => {
  try {
    // Build URL with query parameters for Name and Description
    const params = new URLSearchParams();
    params.append('Name', payload.name);
    if (payload.description) {
      params.append('Description', payload.description);
    }
    
    const response = await axiosInstance.put(`/api/category?id=${id}&${params.toString()}`, null);
    return response.data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

// Delete category
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/category?id=${id}`);
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};
