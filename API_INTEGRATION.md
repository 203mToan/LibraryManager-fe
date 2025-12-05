# API Integration Documentation

## Login API Integration

The application has been integrated with the backend login API endpoint: `https://localhost:7105/login`

### Login Flow

1. **Endpoint**: `POST /login?UserName={username}&Password={password}`
2. **Request Headers**: `Accept: */*`
3. **Response**:
   ```json
   {
     "accessToken": "JWT_TOKEN",
     "refreshToken": "REFRESH_TOKEN"
   }
   ```

### How It Works

1. **User enters credentials** (username and password) on the login form
2. **Frontend sends request** to the backend login endpoint with the credentials
3. **Backend returns JWT token** with user claims (name, role, etc.)
4. **Token is decoded** to extract user information (name, role, ID)
5. **Tokens are stored** in localStorage:
   - `accessToken`: Used for authenticated API requests
   - `refreshToken`: Used to refresh the access token when expired
   - `library_user`: Serialized user object
6. **User is logged in** and redirected to the appropriate dashboard

### JWT Token Claims

The access token contains the following claims:
- `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier`: User ID (UUID)
- `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name`: Username
- `http://schemas.microsoft.com/ws/2008/06/identity/claims/role`: User role (Admin/Member)
- `exp`: Token expiration time
- `iss`: Issuer (myapi)
- `aud`: Audience (myapi-users)

### Role Mapping

- Backend role "Admin" → Frontend role "manager"
- Backend role "Member" → Frontend role "borrower"

### Demo Credentials

```
Username: admin
Password: admin
```

## API Client Configuration

The API client is configured in `src/service/api.ts`:

- **Base URL**: `https://localhost:7105`
- **Auto-authentication**: Access token is automatically included in all requests
- **Error handling**: 401 errors trigger logout and redirect to login page

## Making API Requests

Use the configured axios instance to make API requests:

```tsx
import axiosInstance from '../service/api';

// Example: GET request with authentication
const response = await axiosInstance.get('/api/books');

// Example: POST request with authentication
const response = await axiosInstance.post('/api/loans', {
  bookId: '123',
  userId: '456'
});
```

The access token is automatically included in all requests via the request interceptor.

## Notes

- HTTPS is required (certificate validation may need to be handled during development)
- Refresh token logic is currently a placeholder (will redirect to login on 401)
- Password field is never stored in localStorage for security
