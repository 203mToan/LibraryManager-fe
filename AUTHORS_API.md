# Authors API Integration - Documentation

## Overview
The Authors Management module has been fully integrated with the backend API using Axios for CRUD operations.

## API Endpoint
- **Base URL**: `https://localhost:7105`
- **Endpoint**: `/api/author`

## API Operations

### 1. GET - Fetch All Authors
```
GET /api/author
```
**Response:**
```json
[
  {
    "id": "f62f01c0-da5c-458d-9bc8-40e5a6bea8e0",
    "fullName": "Robert C. Martin",
    "bio": "Software engineer and author known for Clean Code",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### 2. GET - Fetch Single Author
```
GET /api/author/{id}
```
**Response:** Single author object (same structure as above)

### 3. POST - Create New Author
```
POST /api/author
Content-Type: application/json
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "fullName": "string",
  "bio": "string"
}
```

**Response:** Created author object with ID

### 4. PUT - Update Author
```
PUT /api/author/{id}
Content-Type: application/json
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "fullName": "string",
  "bio": "string"
}
```

**Response:** Updated author object

### 5. DELETE - Delete Author
```
DELETE /api/author/{id}
Authorization: Bearer {accessToken}
```

**Response:** 200 OK (no content)

## Service Functions

Located in `src/service/authorService.ts`:

```typescript
// Fetch all authors
getAllAuthors(): Promise<AuthorResponse[]>

// Fetch single author
getAuthorById(id: string): Promise<AuthorResponse>

// Create author
createAuthor(payload: AuthorPayload): Promise<AuthorResponse>

// Update author
updateAuthor(id: string, payload: AuthorPayload): Promise<AuthorResponse>

// Delete author
deleteAuthor(id: string): Promise<void>
```

## Component Integration

The `AuthorsManagement` component (`src/pages/manager/AuthorsManagement.tsx`) includes:

- ✅ **Auto-loading**: Fetches authors on component mount
- ✅ **CRUD Operations**: Full Create, Read, Update, Delete functionality
- ✅ **Error Handling**: User-friendly error messages
- ✅ **Loading State**: Shows loading indicator while fetching data
- ✅ **Form Validation**: Required fields validation
- ✅ **Search/Filter**: Filter authors by name
- ✅ **Confirmation Dialogs**: Confirmation before deletion

## Data Mapping

**Backend Response** → **Frontend Model**
- `fullName` → `name`
- `bio` → `bio`
- `id` → `id`
- `createdAt` → `createdAt`

## Features

### Search & Filter
- Real-time search by author name (case-insensitive)
- Filtered list updates as you type

### Modal Forms
- **Add**: Creates new author with fullName and bio
- **Edit**: Updates existing author information
- **Delete**: Removes author after confirmation

### Error Handling
- Network errors are caught and displayed
- User receives feedback messages
- API errors are logged to console

### Loading States
- Page-level loading indicator while fetching initial data
- Button loading state during form submission
- Buttons disabled during submission to prevent duplicate requests

## Usage Example

```typescript
import { getAllAuthors, createAuthor, updateAuthor, deleteAuthor } from '../../service/authorService';

// Get all authors
const authors = await getAllAuthors();

// Create new author
const newAuthor = await createAuthor({
  fullName: "Jane Doe",
  bio: "Software architect and author"
});

// Update author
const updated = await updateAuthor(authorId, {
  fullName: "Jane Smith",
  bio: "Updated bio"
});

// Delete author
await deleteAuthor(authorId);
```

## Authentication
All API requests automatically include the JWT access token via the Axios interceptor in `src/service/api.ts`.

## Error Messages (Vietnamese)
- "Không thể tải danh sách tác giả" - Failed to load authors list
- "Không thể lưu tác giả" - Failed to save author
- "Không thể xóa tác giả" - Failed to delete author

## Notes
- All requests use HTTPS
- Access token is automatically refreshed if 401 error occurs
- Payload fields are mapped to API format (fullName instead of name)
- Deletion is permanent and requires confirmation
