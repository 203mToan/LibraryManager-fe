# LibraryHub - Feature Guide

## Quick Start

### Demo Accounts

**Manager:**
- Email: `manager@library.com`
- Password: `manager123`

**Borrower:**
- Email: `john@example.com`
- Password: `john123`

## Manager Features

### 1. Dashboard
**Path:** Manager Portal → Dashboard

View key statistics:
- Total books in library
- Active loans
- Number of borrowers
- Total fines collected

See recent activities:
- Latest loan requests
- Popular books with borrow counts

### 2. Books Management
**Path:** Manager Portal → Books

**Features:**
- View all books with cover images
- Search by title or ISBN
- Add new books with:
  - Title, Author, Category
  - ISBN, Publisher, Year
  - Page count, Quantity
  - Cover image URL
  - Description
- Edit existing books
- Delete books
- View detailed book information

### 3. Authors Management
**Path:** Manager Portal → Authors

**Features:**
- List all authors
- Search authors by name
- Add new authors with:
  - Name
  - Biography
  - Birth year
  - Nationality
- Edit author information
- Delete authors

### 4. Categories Management
**Path:** Manager Portal → Categories

**Features:**
- Hierarchical category structure
- Parent-child relationships
- CRUD operations for categories
- Category descriptions

### 5. Loans Management
**Path:** Manager Portal → Loans

**Features:**
- View all loan requests
- Filter by status:
  - Pending: New requests waiting approval
  - Approved: Active loans
  - Overdue: Past due date
  - All: Complete history
- Approve pending requests
- Mark books as returned
- Renew loans (up to 2 times)
- Track fines for overdue books

**Loan Rules:**
- Initial loan period: 14 days
- Maximum renewals: 2 (14 days each)
- Fine: $1 per day overdue

### 6. Reviews Management
**Path:** Manager Portal → Reviews

**Features:**
- View all user reviews
- Filter by status (pending/approved/rejected)
- Approve or reject reviews
- Moderate inappropriate content

### 7. Users Management
**Path:** Manager Portal → Users

**Features:**
- List all users
- View user statistics
- Change user roles
- Deactivate accounts

### 8. Reports & Analytics
**Path:** Manager Portal → Reports

**Features:**
- Most borrowed books
- Fine collection statistics
- User borrowing patterns
- Category popularity
- Time-based analytics

## Borrower Features

### 1. Browse Books
**Path:** Member Portal → Browse Books

**Features:**
- Beautiful card-based book display
- Search by title or author
- Filter by category
- Sort by:
  - Title (A-Z)
  - Year (Newest first)
  - Availability
- View detailed book information
- Request to borrow available books
- AI-powered features in book details

### 2. Book Details Modal

**Information Displayed:**
- Cover image
- Title and author
- Category
- ISBN
- Publisher and year
- Page count
- Availability status

**Actions:**
- Request to borrow
- View AI summary
- Ask AI questions

### 3. AI Features

#### AI Summary
**Styles Available:**
- **Brief Overview**: Quick summary of key points
- **Detailed Summary**: Comprehensive analysis
- **Academic Analysis**: Scholarly perspective

**How to Use:**
1. Open any book details
2. Click "AI Assistant" section
3. Select summary style
4. Click "Generate"

#### AI Chatbot
**Features:**
- Ask questions about book content
- Get instant AI-powered answers
- Natural conversation flow
- Context-aware responses

**How to Use:**
1. Open any book details
2. Click "Ask Questions" tab
3. Type your question
4. Press Enter or click Send

**Example Questions:**
- "What are the main topics covered in this book?"
- "Can you explain the key concepts?"
- "What makes this book unique?"
- "Who should read this book?"

### 4. My Loans
**Path:** Member Portal → My Loans

**Features:**
- View all your loans
- Statistics:
  - Active loans count
  - Pending requests
  - Completed loans
  - Total fines
- Loan details:
  - Book information with cover
  - Request date
  - Due date
  - Status
  - Renewal count (0/2)
  - Fine amount
- Outstanding fines notification

**Loan Statuses:**
- **Pending**: Waiting for manager approval
- **Approved**: Currently borrowed
- **Overdue**: Past due date (fines apply)
- **Returned**: Loan completed

### 5. My Reviews
**Path:** Member Portal → My Reviews

**Features:**
- Write reviews for borrowed books
- Rate books (1-5 stars)
- Add detailed comments
- View review status:
  - Pending: Awaiting moderation
  - Approved: Published
  - Rejected: Not approved
- Edit pending reviews
- Delete your reviews

### 6. Profile
**Path:** Member Portal → Profile

**Features:**
- View account information
- Update personal details
- Change password
- View borrowing history
- Account statistics

## UI/UX Features

### Design
- Modern teal-to-cyan gradient theme
- Clean, professional interface
- Responsive design (mobile/tablet/desktop)
- Dark sidebar navigation
- Smooth animations and transitions

### Interactions
- Hover effects on buttons and cards
- Loading states for async operations
- Success/error notifications
- Confirmation dialogs for destructive actions
- Smooth page transitions

### Accessibility
- Keyboard navigation support
- Screen reader friendly
- High contrast text
- Clear focus indicators
- Semantic HTML

## Search & Filter

### Global Search
- Search across book titles
- Search by author names
- Search by ISBN
- Real-time results

### Advanced Filters
- Filter by category
- Filter by availability
- Filter by year
- Combined filter support

### Sorting Options
- Alphabetical (A-Z)
- By publication year
- By availability
- By popularity

## Notifications

### Visual Feedback
- Success messages for completed actions
- Error messages for failed operations
- Warning indicators for overdue loans
- Badge notifications for pending items

### Status Indicators
- Color-coded loan status
- Availability badges on books
- Fine amount highlights
- Due date warnings

## Tips & Best Practices

### For Managers
1. Approve loan requests promptly
2. Monitor overdue loans regularly
3. Keep book information updated
4. Review and moderate user reviews
5. Check reports for insights

### For Borrowers
1. Return books on time to avoid fines
2. Use renewals wisely (max 2 per loan)
3. Leave reviews to help others
4. Use AI features to explore books
5. Keep track of due dates

## Keyboard Shortcuts

- `Enter` in search: Execute search
- `Esc`: Close modal/dialog
- `Tab`: Navigate between form fields
- `Space`: Toggle checkboxes/buttons

## Data Persistence

**Current Implementation:**
- Mock data in memory
- Authentication stored in localStorage
- Session persists across page refreshes
- Data resets on app restart

**Production Considerations:**
- Connect to real database
- Implement server-side API
- Add real authentication
- Enable cloud storage for images

## Future Enhancements

- Email notifications
- Mobile app
- Barcode scanning
- Digital books (ebooks/PDF)
- Reading lists and favorites
- Book recommendations
- Social features
- Advanced analytics
- Payment integration
- Multi-library support

---

For technical details, see [README.md](README.md)
