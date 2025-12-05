# Authors Pagination - Documentation

## Overview
The Authors Management module now includes full pagination support with server-side data loading.

## Pagination Features

### 1. **Server-Side Pagination**
- Fetches only the requested page from the backend
- Reduces client-side memory usage
- Improves performance with large datasets

### 2. **Page Size Selection**
Users can choose how many items per page:
- 5 items per page
- 10 items per page (default)
- 20 items per page
- 50 items per page

### 3. **Navigation Controls**
- **Previous Button**: Navigate to previous page (disabled on first page)
- **Next Button**: Navigate to next page (disabled on last page)
- **Page Counter**: Shows current page / total pages
- **Item Counter**: Shows which items are currently displayed (e.g., "Showing 1 to 10 of 45 authors")

## API Response Format

The backend returns a paginated response:

```json
{
  "items": [
    {
      "id": "d643d609-8e99-4859-b7d5-ac09635c95fb",
      "fullName": "Toan",
      "bio": "string",
      "bookCount": 3,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "totalItems": 1,
  "pageSize": 10,
  "totalPages": 1
}
```

## API Endpoint

```
GET /api/author?page={pageNumber}&pageSize={pageSize}
```

**Query Parameters:**
- `page` (optional): Page number (1-based index)
- `pageSize` (optional): Number of items per page

**Example:**
```
GET /api/author?page=2&pageSize=10
```

## Service Functions

Updated in `src/service/authorService.ts`:

```typescript
// Fetch authors with pagination
getAllAuthors(page?: number, pageSize?: number): Promise<PaginatedResponse<AuthorResponse>>
```

**Parameters:**
- `page`: Current page number (1-based)
- `pageSize`: Items per page

**Returns:** 
- `items`: Array of author objects
- `totalItems`: Total number of authors
- `pageSize`: Items per page
- `totalPages`: Total number of pages

## Component State Management

**Pagination State Variables:**
```typescript
const [currentPage, setCurrentPage] = useState(1);      // Current page number
const [pageSize, setPageSize] = useState(10);           // Items per page
const [totalPages, setTotalPages] = useState(1);        // Total pages
const [totalItems, setTotalItems] = useState(0);        // Total items
```

**Data Fetching:**
```typescript
useEffect(() => {
  fetchAuthors(currentPage, pageSize);
}, [currentPage, pageSize]);
```

Automatically refetches data when page or page size changes.

## User Interface

### Pagination Controls Location
Below the data table, showing:

```
Showing 1 to 10 of 45 authors | [Dropdown: 10/page] | [Previous] [Page 1 / 5] [Next]
```

### Disabled States
- **Previous button**: Disabled on first page or while loading
- **Next button**: Disabled on last page or while loading
- **Page size dropdown**: Enabled anytime

### Auto-Reset
Changing page size automatically resets to page 1

## Data Transformation

API response is transformed to match the Author interface:

```typescript
const transformedData = (response.items || []).map((author: any) => ({
  id: author.id || '',
  name: author.fullName || '',           // fullName → name
  bio: author.bio || '',
  bookCount: author.bookCount || 0,
  createdAt: author.createdAt || new Date().toISOString(),
}));
```

## UI Updates After Operations

- **Create/Update/Delete**: Automatically refetches current page
- **Page Change**: Fetches new page data
- **Page Size Change**: Resets to page 1 and fetches new data

## Columns Displayed

1. **Tên** (Name) - Author's full name
2. **Số sách** (Book Count) - Number of books by this author
3. **Hành động** (Actions) - Edit/Delete buttons

## Error Handling

Pagination errors show user-friendly message:
- "Không thể tải danh sách tác giả" - Failed to load authors list

## Example Usage

### Loading page 2 with 20 items per page
```typescript
// Component automatically handles:
setCurrentPage(2);
setPageSize(20);

// This triggers the useEffect which calls:
// fetchAuthors(2, 20)
// → getAllAuthors(2, 20)
// → GET /api/author?page=2&pageSize=20
```

### Creating a new author
```typescript
// After creation:
// 1. Modal closes
// 2. Current page and page size are preserved
// 3. Data is refetched
// 4. New author appears in the list
```

## Performance Considerations

✅ Only requested page data is fetched
✅ Page size can be optimized for user preference
✅ No client-side filtering (server handles it)
✅ Supports large datasets efficiently
✅ Buttons disabled during loading to prevent multiple requests

## Notes

- Pagination is 1-based (first page is page 1)
- Page size defaults to 10 items
- Total items count helps calculate actual pagination range
- All API requests automatically include authentication token
