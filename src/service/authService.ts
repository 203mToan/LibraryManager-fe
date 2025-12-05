import axiosInstance from './api';

export interface RegisterPayload {
  fullName: string;
  email: string;
  userName: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  nationalId: string;
  password: string;
}

export interface RegisterResponse {
  id: string;
  fullName: string;
  email: string;
  userName: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  nationalId: string;
  createdAt: string;
}

// Register new user
export const registerUser = async (payload: RegisterPayload): Promise<RegisterResponse> => {
  try {
    const response = await axiosInstance.post('/register', payload);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};
