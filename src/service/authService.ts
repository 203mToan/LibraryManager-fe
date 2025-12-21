import axiosInstance from './api';

export interface RegisterPayload {
  FullName: string;
  Email: string;
  UserName: string;
  PhoneNumber: string;
  Address: string;
  DateOfBirth: string | null;
  Gender: string | null;
  NationalId: string;
  Password: string;
}

export interface RegisterResponse {
  Id: string;
  FullName: string;
  Email: string;
  UserName: string;
  PhoneNumber: string;
  Address: string;
  DateOfBirth: string | null;
  Gender: string | null;
  NationalId: string;
  CreatedAt: string;
}

// Register new user
export const registerUser = async (payload: RegisterPayload): Promise<RegisterResponse> => {
  try {
    const response = await axiosInstance.post('/register', null, {
      params: {
        FullName: payload.FullName,
        Email: payload.Email,
        UserName: payload.UserName,
        PhoneNumber: payload.PhoneNumber,
        Address: payload.Address,
        DateOfBirth: payload.DateOfBirth,
        Gender: payload.Gender,
        NationalId: payload.NationalId,
        Password: payload.Password,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};
