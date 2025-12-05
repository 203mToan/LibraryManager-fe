# LibraryHub - Modern Library Management System

A beautiful, modern, and fully-featured library management system built with React, TypeScript, and Tailwind CSS. Features role-based access control for Managers and Borrowers, with AI-powered book summaries and Q&A chatbot.

![LibraryHub](https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200)

## Features

### For Managers
- **Dashboard**: Overview of library statistics, active loans, popular books, and recent activities
- **Books Management**: Full CRUD operations for books with cover image support
- **Authors Management**: Manage author profiles and information
- **Categories Management**: Hierarchical category system (parent-child relationships)
- **Loans Management**: Approve, track, and manage book loans, returns, and renewals
- **Reviews Moderation**: Review and approve/reject user book reviews
- **Users Management**: Manage library members and their roles
- **Reports & Analytics**: View statistics on popular books, fines, and borrowing trends
- **AI Summary Generation**: Manually generate AI summaries for books

### For Borrowers
- **Browse Books**: Search, filter by category, and sort books with beautiful card layout
- **Book Details**: View comprehensive information about books
- **Loan Management**: Request books, view loan history, check due dates
- **Fine Tracking**: Monitor outstanding fines and payment status
- **Reviews**: Write and manage book reviews
- **AI Features**:
  - Generate book summaries in different styles (Brief, Detailed, Academic)
  - Interactive chatbot for asking questions about book content

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Build Tool**: Vite
- **State Management**: React Context API
- **Data**: Mock data (in-memory, no backend required)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd project
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:5173`

### Demo Accounts

#### Manager Account
- Email: `manager@library.com`
- Password: `manager123`

#### Borrower Account
- Email: `john@example.com`
- Password: `john123`

You can also create new borrower accounts through the registration page.

## Project Structure

```
src/
├── components/
│   ├── ai/
│   │   └── BookAI.tsx              # AI summary and chatbot component
│   ├── layout/
│   │   ├── Header.tsx              # Top navigation bar
│   │   └── Sidebar.tsx             # Side navigation menu
│   └── ui/
│       ├── Button.tsx              # Reusable button component
│       ├── Input.tsx               # Input field component
│       ├── Modal.tsx               # Modal dialog component
│       ├── Select.tsx              # Select dropdown component
│       └── Table.tsx               # Data table with pagination
├── contexts/
│   └── AuthContext.tsx             # Authentication context provider
├── data/
│   └── mockData.ts                 # Mock data for all entities
├── pages/
│   ├── borrower/
│   │   ├── BrowseBooks.tsx         # Book browsing and search
│   │   └── MyLoans.tsx             # Borrower's loan history
│   ├── manager/
│   │   ├── AuthorsManagement.tsx   # Author CRUD operations
│   │   ├── BooksManagement.tsx     # Book CRUD operations
│   │   ├── LoansManagement.tsx     # Loan approval and tracking
│   │   └── ManagerDashboard.tsx    # Manager dashboard overview
│   ├── LoginPage.tsx               # Login form
│   └── RegisterPage.tsx            # Registration form
├── App.tsx                         # Main application component
├── main.tsx                        # Application entry point
└── index.css                       # Global styles and Tailwind imports
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Design Philosophy

LibraryHub follows modern web design principles:

- **Clean & Professional**: Teal-to-cyan gradient color scheme for a fresh, modern look
- **Responsive Design**: Fully responsive layout that works on all devices
- **Smooth Animations**: Subtle micro-interactions using Framer Motion
- **Intuitive UX**: Clear navigation, consistent layouts, and helpful feedback
- **Accessibility**: Semantic HTML, keyboard navigation support, and ARIA labels

## Key Features Explained

### Authentication System
- Role-based access control (Manager/Borrower)
- Session persistence using localStorage
- Protected routes based on user roles

### Book Management
- Comprehensive book catalog with metadata
- Cover image support (URL-based)
- Availability tracking (quantity vs. available)
- Search and filter capabilities

### Loan System
- 14-day loan period
- Up to 2 renewals per book (14 days each)
- Automatic overdue detection
- Fine calculation ($1 per day overdue)
- Status tracking (pending, approved, overdue, returned)

### AI Features
- **Book Summaries**: Three styles available
  - Brief: Quick overview
  - Detailed: Comprehensive analysis
  - Academic: Scholarly perspective
- **Q&A Chatbot**: Ask questions about book content
  - Context-aware responses
  - Natural conversation flow
  - Instant answers

### Mock Data
The application uses in-memory mock data located in `src/data/mockData.ts`:
- 3 Users (1 Manager, 2 Borrowers)
- 4 Authors
- 5 Categories
- 5 Books
- 4 Loans
- 3 Reviews
- 3 AI Summaries

All data persists only in browser memory and resets on page refresh.

## Customization

### Adding New Books
1. Login as Manager
2. Navigate to Books Management
3. Click "Add Book"
4. Fill in book details and submit

### Changing Color Scheme
Edit `src/components/ui/Button.tsx` and update the gradient colors in the `variantStyles` object.

### Adding More Mock Data
Edit `src/data/mockData.ts` and add entries to the respective arrays (mockBooks, mockAuthors, etc.).

## Future Enhancements

This is a demonstration project. To make it production-ready, consider:

- **Backend Integration**: Replace mock data with real API calls
- **Database**: Implement with PostgreSQL/MySQL/MongoDB
- **Real AI**: Integrate OpenAI API for actual AI features
- **File Upload**: Implement actual image upload for book covers
- **Email Notifications**: Send emails for loan approvals, due dates, and overdue books
- **Payment Gateway**: Integrate Stripe/PayPal for fineAmount payments
- **Advanced Search**: Full-text search with filters
- **Barcode Scanning**: For physical book management
- **Reports**: Advanced analytics and data visualization

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - feel free to use this project for learning or as a starting point for your own library management system.

## Contributing

This is a demo project, but suggestions and improvements are welcome!

## Support

For questions or issues, please open an issue in the repository.

---

Built with ❤️ using React, TypeScript, and Tailwind CSS
