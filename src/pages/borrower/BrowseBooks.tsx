import { useState, useEffect } from 'react';
import { Search, Book as BookIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Book {
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
  description: string;
  coverUrl: string;
  sumarry: string;
  createdAt: string;
}
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import BookAI from '../../components/ai/BookAI';
import { motion } from 'framer-motion';
import { getAllBooks } from '../../service/bookService';
import { createLoan, getMyLoans, LoanResponse } from '../../service/loanService';
import { getAllAuthors, AuthorResponse } from '../../service/authorService';
import { getAllCategories, CategoryResponse } from '../../service/categoryService';

export default function BrowseBooks() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loans, setLoans] = useState<LoanResponse[]>([]);
  const [authors, setAuthors] = useState<AuthorResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanDuration, setLoanDuration] = useState(30);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch books and loans on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);

      // Fetch books
      const booksResponse = await getAllBooks(1, 100);
      const transformedBooks = (booksResponse.items || []).map((book: any) => ({
        id: book.id || '',
        title: book.title || '',
        authorId: book.authorId || '',
        categoryId: book.categoryId || '',
        isbn: book.isbn || '',
        publisher: book.publisher || '',
        publishYear: book.yearPublished || new Date().getFullYear(),
        pages: book.pages || 0,
        quantity: book.stockQuantity || 1,
        available: book.availableQuantity || book.stockQuantity || 1,
        description: book.description || '',
        coverUrl: book.thumbnailUrl || '',
        sumarry: book.summary || '',
        createdAt: book.createdAt || new Date().toISOString(),
      }));
      setBooks(transformedBooks);

      // Fetch authors
      const authorsResponse = await getAllAuthors(1, 100);
      setAuthors(authorsResponse.items || []);

      // Fetch categories
      const categoriesResponse = await getAllCategories(1, 100);
      setCategories(categoriesResponse.items || []);

      // Fetch user's loans
      const myLoans = await getMyLoans();
      setLoans(myLoans);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Không thể tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
  };

  const handleRequestLoan = async () => {
    if (!user || !selectedBook) {
      setError('Vui lòng chọn sách và đăng nhập');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      // Use current date as loan date
      const loanDate = new Date();
      // Calculate due date based on selected duration
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + loanDuration);

      const payload = {
        userId: user.id,
        bookId: selectedBook.id,
        loanDate: loanDate.toISOString(),
        dueDate: dueDate.toISOString(),
      };

      await createLoan(payload);

      // Refresh loans list
      const myLoans = await getMyLoans();
      setLoans(myLoans);

      setSelectedBook(null);
      setShowLoanModal(false);
      // Show success message
      alert('Yêu cầu mượn đã gửi thành công!');
    } catch (err: any) {
      console.error('Failed to create loan:', err);
      const errorMessage = err.response?.data?.message || 'Không thể gửi yêu cầu mượn';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasActiveLoan = (bookId: string) => {
    return loans.some(
      (loan) =>
        loan.bookId === bookId &&
        (loan.status === 'Pending' || loan.status === 'Approved')
    );
  };

  let filteredBooks = books.filter((book) => {
    const author = authors.find((a) => a.id === book.authorId);
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      author?.fullName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || book.categoryId === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  filteredBooks = filteredBooks.sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'year') return b.publishYear - a.publishYear;
    if (sortBy === 'available') return b.available - a.available;
    return 0;
  });

  // Get unique categories from books
  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Duyệt sách</h1>
        <p className="text-gray-600 mt-1">Khám phá và mượn sách từ bộ sưu tập của chúng tôi</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm sách..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <Select
            options={[
              { value: 'all', label: 'Tất cả thể loại' },
              ...categoryOptions,
            ]}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          />

          <Select
            options={[
              { value: 'title', label: 'Sắp xếp theo tiêu đề' },
              { value: 'year', label: 'Sắp xếp theo năm' },
              { value: 'available', label: 'Sắp xếp theo tình trạng' },
            ]}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Đang tải sách...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book, index) => {
              const author = authors.find((a) => a.id === book.authorId);
              const category = categories.find((c) => c.id === book.categoryId);
              const isAvailable = book.available > 0;

              return (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleSelectBook(book)}
                >
                  <img
                    src={book.coverUrl || 'https://via.placeholder.com/300x400'}
                    alt={book.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{author?.fullName}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{category?.name}</span>
                      <span
                        className={`text-xs font-medium ${isAvailable ? 'text-green-600' : 'text-red-600'
                          }`}
                      >
                        {isAvailable ? `${book.available} bản có sẵn` : 'Không có sẵn'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={!!selectedBook}
        onClose={() => setSelectedBook(null)}
        title="Chi tiết sách"
        size="xl"
      >
        {selectedBook && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <img
                src={selectedBook.coverUrl || 'https://via.placeholder.com/300x400'}
                alt={selectedBook.title}
                className="w-full h-96 object-cover rounded-lg"
              />
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedBook.title}
                  </h3>
                  <p className="text-lg text-gray-600">
                    bởi {authors.find((a) => a.id === selectedBook.authorId)?.fullName}
                  </p>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">Thể loại: </span>
                    <span className="font-medium">
                      {categories.find((c) => c.id === selectedBook.categoryId)?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">ISBN: </span>
                    <span className="font-medium">{selectedBook.isbn}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Nhà xuất bản: </span>
                    <span className="font-medium">{selectedBook.publisher}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Năm: </span>
                    <span className="font-medium">{selectedBook.publishYear}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Số trang: </span>
                    <span className="font-medium">{selectedBook.pages}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Số lượng hiện có: </span>
                    <span className="font-medium text-teal-600">
                      {selectedBook.quantity}
                    </span>
                  </div>
                </div>

                {hasActiveLoan(selectedBook.id) ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Bạn đã có yêu cầu mượn đang hoạt động cho cuốn sách này.
                    </p>
                  </div>
                ) : selectedBook.available > 0 ? (
                  <Button
                    className="w-full"
                    onClick={() => {
                      setLoanDuration(30);
                      setShowLoanModal(true);
                    }}
                    disabled={isSubmitting}
                  >
                    <BookIcon className="w-4 h-4 mr-2" />
                    Yêu cầu mượn
                  </Button>
                ) : (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      Cuốn sách hiện không có sẵn.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {selectedBook.description && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Mô tả</h4>
                <p className="text-gray-700">{selectedBook.description}</p>
              </div>
            )}

            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-semibold text-gray-900 mb-4">Trợ lý AI</h4>
              <BookAI book={selectedBook} />
            </div>
          </div>
        )}
      </Modal>

      {/* Loan Duration Selection Modal */}
      {showLoanModal && <Modal
        isOpen={showLoanModal}
        onClose={() => setShowLoanModal(false)}
        title={`Chọn thời gian mượn: ${selectedBook?.title}`}
        size="sm"
      >
        {showLoanModal && selectedBook && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian mượn (ngày)
              </label>
              <select
                value={loanDuration}
                onChange={(e) => setLoanDuration(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value={7}>7 ngày</option>
                <option value={14}>14 ngày</option>
                <option value={30}>30 ngày (Mặc định)</option>
                <option value={60}>60 ngày</option>
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Ngày mượn:</strong> {new Date().toLocaleDateString('vi-VN')}
              </p>
              <p className="text-sm text-blue-800 mt-1">
                <strong>Ngày trả dự kiến:</strong>{' '}
                {new Date(Date.now() + loanDuration * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN')}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowLoanModal(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                onClick={handleRequestLoan}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang gửi...' : 'Xác nhận mượn'}
              </Button>
            </div>
          </div>
        )}
      </Modal>}
    </div>
  );
}
