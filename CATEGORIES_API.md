# Categories API Integration - Documentation

## Overview
The Categories Management module has been fully integrated with the backend API using Axios with support for pagination and both query parameter and request body approaches.

## API Endpoints

### Base URL
`https://localhost:7105/api/category`

### 1. GET - Fetch All Categories with Pagination
```
GET /api/category?page={page}&pageSize={pageSize}
```

**Query Parameters:**
- `page` (optional): Page number (1-based index)
- `pageSize` (optional): Number of items per page

**Response:**
```json
{
  "items": [
    {
      "id": "d643d609-8e99-4859-b7d5-ac09635c95fb",
      "name": "Lập trình",
      "description": "Sách về lập trình và phát triển phần mềm",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "totalItems": 15,
  "pageSize": 10,
  "totalPages": 2
}
```

### 2. GET - Fetch Single Category
```
GET /api/category/{id}
```

**Response:** Single category object

### 3. POST - Create New Category
```
POST /api/category?Name={name}&Description={description}
```

**Query Parameters:**
- `Name` (required): Category name (URL encoded)
- `Description` (optional): Category description (URL encoded)

**Example:**
```
POST /api/category?Name=Lập%20trình&Description=Sách%20về%20lập%20trình
```

**Response:** Created category object with ID

### 4. PUT - Update Category
```
PUT /api/category/{id}?Name={name}&Description={description}
```

**Query Parameters:**
- `Name` (required): Updated category name (URL encoded)
- `Description` (optional): Updated description (URL encoded)

**Response:** Updated category object

### 5. DELETE - Delete Category
```
DELETE /api/category/{id}
Authorization: Bearer {accessToken}
```

**Response:** 200 OK (no content)

## Service Layer

Located in `src/service/categoryService.ts`:

### Interface Definitions

```typescript
interface CategoryPayload {
  name: string;
  description?: string;
}

interface CategoryResponse {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  pageSize: number | null;
  totalPages: number;
}
```

### Service Functions

```typescript
// Fetch categories with pagination
getAllCategories(page?: number, pageSize?: number): Promise<PaginatedResponse<CategoryResponse>>

// Fetch single category
getCategoryById(id: string): Promise<CategoryResponse>

// Create category (uses query parameters)
createCategory(payload: CategoryPayload): Promise<CategoryResponse>

// Update category (uses query parameters)
updateCategory(id: string, payload: CategoryPayload): Promise<CategoryResponse>

// Delete category
deleteCategory(id: string): Promise<void>
```

## Component Integration

### State Management
```typescript
const [categories, setCategories] = useState<Category[]>([]);
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState('');
const [isSubmitting, setIsSubmitting] = useState(false);
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(10);
const [totalPages, setTotalPages] = useState(1);
const [totalItems, setTotalItems] = useState(0);
```

### Auto-Fetch on Mount & Page Change
```typescript
useEffect(() => {
    fetchCategories(currentPage, pageSize);
}, [currentPage, pageSize]);
```

### CRUD Operations

**Create:**
```typescript
await createCategory({
    name: "Khoa học viễn tưởng",
    description: "Sách khoa học viễn tưởng"
});
```

**Read:**
```typescript
const response = await getAllCategories(page, pageSize);
```

**Update:**
```typescript
await updateCategory(categoryId, {
    name: "Updated Name",
    description: "Updated description"
});
```

**Delete:**
```typescript
await deleteCategory(categoryId);
```

## Pagination Features

### Page Size Options
- 5 items per page
- 10 items per page (default)
- 20 items per page
- 50 items per page

### Navigation Controls
- **Previous Button**: Disabled on first page
- **Next Button**: Disabled on last page
- **Page Counter**: Shows current page / total pages
- **Item Counter**: Shows range of displayed items

### UI Components

Located below the data table:

```
Hiển thị 1 đến 10 của 15 thể loại | [Dropdown: 10/page] | [Trước] [Trang 1 / 2] [Tiếp]
```

## Form Features

### Add Category Form
- **Name Input** (required): Category name
- **Description Textarea** (optional): Category description
- **Submit Button**: Creates or updates based on selection

### Edit Category Form
- Pre-fills form with existing category data
- Updates API endpoint changes

### Error Handling
- Shows error messages in red box
- Disables submit button during loading
- Auto-closes modal on success
- Refetches list to show changes

## Data Transformation

API response is transformed to match the Category interface:

```typescript
const transformedData = (response.items || []).map((category: any) => ({
    id: category.id || '',
    name: category.name || '',
    description: category.description || '',
    createdAt: category.createdAt || new Date().toISOString(),
}));
```

## UI Updates After Operations

1. **Create**: Modal closes → List refetches → New category appears
2. **Update**: Modal closes → List refetches → Updated category appears
3. **Delete**: Confirmation dialog → Category removed → List refetches
4. **Page Change**: Fetches new page data
5. **Page Size Change**: Resets to page 1 → Fetches data

## Query Parameter Encoding

The service automatically URL-encodes query parameters:

```typescript
const params = new URLSearchParams();
params.append('Name', payload.name);
params.append('Description', payload.description);

// Results in: ?Name=Lập%20trình&Description=Sách...
```

## Error Messages (Vietnamese)

- "Không thể tải danh sách thể loại" - Failed to load categories list
- "Không thể lưu thể loại" - Failed to save category
- "Không thể xóa thể loại" - Failed to delete category

## Table Columns

1. **Tên thể loại** (Name) - Category name
2. **Hành động** (Actions) - Edit/Delete buttons

## Authentication

All API requests automatically include the JWT access token via the Axios interceptor in `src/service/api.ts`.

## Performance Considerations

✅ Server-side pagination - reduces client memory usage
✅ Only requested page data fetched
✅ Optimizable page size based on user preference
✅ Buttons disabled during loading to prevent duplicate requests
✅ No unnecessary re-fetches

## Example Workflow

1. Component mounts → `fetchCategories(1, 10)` called
2. User clicks "Thêm thể loại" → Modal opens with empty form
3. User fills form → Clicks "Tạo"
4. `createCategory()` called with query parameters
5. Modal closes → `fetchCategories(1, 10)` called
6. Table updates with new category
7. User clicks next page → `setCurrentPage(2)` triggers `fetchCategories(2, 10)`
8. Table updates with page 2 data

## Notes

- Query parameters are URL-encoded automatically
- Pagination is 1-based (first page is page 1)
- Page size defaults to 10 items
- Empty descriptions are allowed
- All operations show loading states
- Deletion requires confirmation
