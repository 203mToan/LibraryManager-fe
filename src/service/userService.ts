import axiosInstance from './api';

export interface UserResponse {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  avatar?: string;
  role: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserPayload {
  fullName: string;
  email: string;
  userName: string;
  password?: string;
  phoneNumber?: string;
  address?: string;
  avatar?: string;
  role: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

const API_BASE_URL = '/users';

export const getAllUsers = async (
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedResponse<UserResponse>> => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());

    const response = await axiosInstance.get<PaginatedResponse<UserResponse>>(
      `${API_BASE_URL}?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserById = async (userId: string): Promise<UserResponse> => {
  try {
    const response = await axiosInstance.get<UserResponse>(
      `${API_BASE_URL}/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    throw error;
  }
};

export const createUser = async (
  payload: UserPayload
): Promise<UserResponse> => {
  try {
    const response = await axiosInstance.post<UserResponse>(
      API_BASE_URL,
      payload
    );
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (
  userId: string,
  payload: Partial<UserPayload>
): Promise<UserResponse> => {
  try {
    const response = await axiosInstance.put<UserResponse>(
      `${API_BASE_URL}/${userId}`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await axiosInstance.delete(`${API_BASE_URL}/${userId}`);
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    throw error;
  }
};
