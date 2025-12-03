export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'manager' | 'borrower';
  avatar?: string;
  createdAt: string;
}

export interface Author {
  id: string;
  name: string;
  bio?: string;
  birthYear?: number;
  nationality?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string;
  description?: string;
  createdAt: string;
}

export interface Book {
  id: string;
  title: string;
  authorId: string;
  categoryId: string;
  isbn: string;
  publisher: string;
  publishYear: number;
  pages: number;
  quantity: number;
  available: number;
  coverUrl?: string;
  description?: string;
  createdAt: string;
  sumarry?: string;
}

export interface Loan {
  id: string;
  bookId: string;
  userId: string;
  requestDate: string;
  approvedDate?: string;
  dueDate?: string;
  returnDate?: string;
  renewCount: number;
  status: 'pending' | 'approved' | 'returned' | 'overdue';
  fine: number;
}

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface AISummary {
  id: string;
  bookId: string;
  style: 'brief' | 'detailed' | 'academic';
  content: string;
  createdAt: string;
}

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'manager@library.com',
    password: 'manager123',
    name: 'Quản lý thư viện',
    role: 'manager',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'john@example.com',
    password: 'john123',
    name: 'Nguyễn Văn A',
    role: 'borrower',
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '3',
    email: 'sarah@example.com',
    password: 'sarah123',
    name: 'Trần Thị B',
    role: 'borrower',
    createdAt: '2024-02-01T00:00:00Z',
  },
];

export const mockAuthors: Author[] = [
  {
    id: '1',
    name: 'Robert C. Martin',
    bio: 'Kỹ sư phần mềm và tác giả nổi tiếng với Clean Code',
    birthYear: 1952,
    nationality: 'Mỹ',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Eric Evans',
    bio: 'Chuyên gia tư vấn thiết kế phần mềm và tác giả Domain-Driven Design',
    birthYear: 1960,
    nationality: 'Mỹ',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Martin Kleppmann',
    bio: 'Nhà nghiên cứu hệ thống phân tán và tác giả',
    birthYear: 1984,
    nationality: 'Đức',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Andrew Hunt',
    bio: 'Đồng tác giả của The Pragmatic Programmer',
    birthYear: 1964,
    nationality: 'Mỹ',
    createdAt: '2024-01-01T00:00:00Z',
  },
];

export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Lập trình',
    description: 'Sách về lập trình và phát triển phần mềm',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Kỹ thuật phần mềm',
    parentId: '1',
    description: 'Các hoạt động và nguyên lý kỹ thuật phần mềm',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Cơ sở dữ liệu',
    parentId: '1',
    description: 'Thiết kế và quản lý cơ sở dữ liệu',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Hệ thống phân tán',
    parentId: '1',
    description: 'Tính toán phân tán và hệ thống',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '5',
    name: 'Khoa học máy tính',
    description: 'Các chủ đề khoa học máy tính chung',
    createdAt: '2024-01-01T00:00:00Z',
  },
];

export const mockBooks: Book[] = [
  {
    id: '1',
    title: 'Mã sạch',
    authorId: '1',
    categoryId: '2',
    isbn: '978-0132350884',
    publisher: 'Prentice Hall',
    publishYear: 2008,
    pages: 464,
    quantity: 5,
    available: 3,
    coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
    description: 'Sách hướng dẫn về kỹ thuật phần mềm linh hoạt tập trung vào viết mã sạch, dễ bảo trì.',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Thiết kế hướng miền',
    authorId: '2',
    categoryId: '2',
    isbn: '978-0321125217',
    publisher: 'Addison-Wesley',
    publishYear: 2003,
    pages: 560,
    quantity: 3,
    available: 2,
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    description: 'Giải quyết độ phức tạp trong trung tâm phần mềm thông qua các mô hình thiết kế chiến lược.',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    title: 'Thiết kế các ứng dụng tập trung dữ liệu',
    authorId: '3',
    categoryId: '4',
    isbn: '978-1449373320',
    publisher: "O'Reilly Media",
    publishYear: 2017,
    pages: 616,
    quantity: 4,
    available: 4,
    coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
    description: 'Những ý tưởng lớn đằng sau các hệ thống đáng tin cậy, có thể mở rộng và dễ bảo trì.',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    title: 'Lập trình viên thực dụng',
    authorId: '4',
    categoryId: '2',
    isbn: '978-0135957059',
    publisher: 'Addison-Wesley',
    publishYear: 2019,
    pages: 352,
    quantity: 6,
    available: 5,
    coverUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
    description: 'Hành trình của bạn tới sự xuất sắc thông qua lời khuyên thực tế và mẹo về sự nghiệp.',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '5',
    title: 'Kiến trúc sạch',
    authorId: '1',
    categoryId: '2',
    isbn: '978-0134494166',
    publisher: 'Prentice Hall',
    publishYear: 2017,
    pages: 432,
    quantity: 4,
    available: 2,
    coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400',
    description: 'Hướng dẫn của thợ thủ công về cấu trúc phần mềm và thiết kế.',
    createdAt: '2024-01-01T00:00:00Z',
  },
];

export const mockLoans: Loan[] = [
  {
    id: '1',
    bookId: '1',
    userId: '2',
    requestDate: '2024-11-01T10:00:00Z',
    approvedDate: '2024-11-01T14:00:00Z',
    dueDate: '2024-11-15T23:59:59Z',
    returnDate: '2024-11-14T10:00:00Z',
    renewCount: 0,
    status: 'returned',
    fine: 0,
  },
  {
    id: '2',
    bookId: '5',
    userId: '2',
    requestDate: '2024-11-10T09:00:00Z',
    approvedDate: '2024-11-10T11:00:00Z',
    dueDate: '2024-11-24T23:59:59Z',
    renewCount: 0,
    status: 'approved',
    fine: 0,
  },
  {
    id: '3',
    bookId: '2',
    userId: '3',
    requestDate: '2024-11-15T15:00:00Z',
    status: 'pending',
    renewCount: 0,
    fine: 0,
  },
  {
    id: '4',
    bookId: '1',
    userId: '3',
    requestDate: '2024-10-20T10:00:00Z',
    approvedDate: '2024-10-20T12:00:00Z',
    dueDate: '2024-11-03T23:59:59Z',
    renewCount: 1,
    status: 'overdue',
    fine: 14,
  },
];

export const mockReviews: Review[] = [
  {
    id: '1',
    bookId: '1',
    userId: '2',
    rating: 5,
    comment: 'Cuốn sách tuyệt vời! Mỗi lập trình viên nên đọc cái này. Các nguyên lý là vô thời gian.',
    status: 'approved',
    createdAt: '2024-11-14T12:00:00Z',
  },
  {
    id: '2',
    bookId: '3',
    userId: '3',
    rating: 5,
    comment: 'Rất chi tiết và toàn diện. Phải đọc cho bất kỳ ai làm việc với hệ thống dữ liệu.',
    status: 'approved',
    createdAt: '2024-11-10T16:00:00Z',
  },
  {
    id: '3',
    bookId: '5',
    userId: '3',
    rating: 4,
    comment: 'Các hiểu biết tuyệt vời về kiến trúc phần mềm. Một số phần hơi lý thuyết.',
    status: 'pending',
    createdAt: '2024-11-16T10:00:00Z',
  },
];

export const mockAISummaries: AISummary[] = [
  {
    id: '1',
    bookId: '1',
    style: 'brief',
    content: 'Mã sạch dạy các lập trình viên cách viết mã dễ đọc và bảo trì. Nó bao gồm các quy ước đặt tên, hàm, bình luận, định dạng và xử lý lỗi.',
    createdAt: '2024-11-01T00:00:00Z',
  },
  {
    id: '2',
    bookId: '1',
    style: 'detailed',
    content: 'Mã sạch của Robert C. Martin là hướng dẫn toàn diện về viết phần mềm bảo trì được. Cuốn sách nhấn mạnh rằng mã phải có thể đọc được bởi con người, không chỉ là thực thi được bởi máy. Các nguyên lý chính bao gồm đặt tên có ý nghĩa, các hàm nhỏ tập trung, các hoạt động bình luận thích hợp, định dạng nhất quán và xử lý lỗi toàn diện. Martin giới thiệu Quy tắc Hướng đạo sinh: để mã sạch hơn bạn tìm thấy nó. Cuốn sách bao gồm nhiều ví dụ về tái cấu trúc mã, chứng minh cách biến đổi mã lộn xộn thành mã sạch, chuyên nghiệp.',
    createdAt: '2024-11-01T00:00:00Z',
  },
  {
    id: '3',
    bookId: '3',
    style: 'brief',
    content: 'Cuốn sách này khám phá kiến trúc của các hệ thống dữ liệu hiện đại, bao gồm các công cụ lưu trữ, sao chép, phân vùng, giao dịch và những thách thức của hệ thống phân tán.',
    createdAt: '2024-11-05T00:00:00Z',
  },
];
