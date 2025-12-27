import { useState, useEffect } from 'react';
import { ArrowLeft, Book as BookIcon, Star, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getBookById } from '../service/bookService';
import { getAllAuthors, AuthorResponse } from '../service/authorService';
import { getAllCategories, CategoryResponse } from '../service/categoryService';
import { createLoan, getMyLoans, LoanResponse } from '../service/loanService';
import { getAllReviews, createReview, ReviewResponse } from '../service/reviewService';
import { addFavorite, removeFavorite, isFavorited } from '../service/favoriteService';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import BookAI from '../components/ai/BookAI';
import { motion } from 'framer-motion';

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

export default function BookDetailPage({ bookId }: { bookId: string | number }) {
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [authors, setAuthors] = useState<AuthorResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loans, setLoans] = useState<LoanResponse[]>([]);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [loanDuration, setLoanDuration] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, content: '' });
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchBookDetails();
  }, [bookId]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchBookDetails = async () => {
    try {
      setIsLoading(true);
      setError('');

      const [bookRes, authorsRes, categoriesRes, myLoans, reviewsRes] = await Promise.all([
        getBookById(String(bookId)),
        getAllAuthors(1, 100),
        getAllCategories(1, 100),
        getMyLoans(),
        getAllReviews(1, 100),
      ]);

      // Transform book data
      const bookData: Book = {
        id: bookRes.id || '',
        title: bookRes.title || '',
        authorId: bookRes.authorId || '',
        categoryId: bookRes.categoryId || '',
        isbn: (bookRes as any).isbn || '',
        publisher: bookRes.publisher || '',
        publishYear: bookRes.yearPublished || new Date().getFullYear(),
        pages: (bookRes as any).pages || 0,
        quantity: bookRes.stockQuantity || 1,
        available: (bookRes as any).availableQuantity || bookRes.stockQuantity || 1,
        description: bookRes.description || '',
        coverUrl: bookRes.thumbnailUrl || '',
        sumarry: bookRes.summary || '',
        createdAt: bookRes.createdAt || new Date().toISOString(),
      };

      setBook(bookData);
      setAuthors(authorsRes.items || []);
      setCategories(categoriesRes.items || []);
      setLoans(myLoans);
      
      // Filter reviews for this book
      const bookReviews = (reviewsRes.items || []).filter(
        (review: ReviewResponse) => review.bookId === String(bookId)
      );
      setReviews(bookReviews);

      // Check if book is favorited
      if (user) {
        const favoriteStatus = await isFavorited(String(bookId));
        setIsFavorite(favoriteStatus);
      }
    } catch (err) {
      console.error('Failed to fetch book details:', err);
      setError('Không thể tải chi tiết sách');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestLoan = async () => {
    if (!user || !book) {
      setError('Vui lòng chọn sách và đăng nhập');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const loanDate = new Date();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + loanDuration);

      const payload = {
        userId: user.id,
        bookId: book.id,
        loanDate: loanDate.toISOString(),
        dueDate: dueDate.toISOString(),
      };

      await createLoan(payload);
      await fetchBookDetails();
      setShowLoanModal(false);
      setNotification({ type: 'success', message: 'Yêu cầu mượn đã gửi thành công!' });
    } catch (err: any) {
      console.error('Failed to create loan:', err);
      const errorMessage = err.response?.data?.message || 'Không thể gửi yêu cầu mượn';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user || !book) {
      setError('Vui lòng đăng nhập');
      return;
    }

    try {
      setIsSubmitting(true);
      if (isFavorite) {
        await removeFavorite(book.id);
        setIsFavorite(false);
        setNotification({ type: 'success', message: 'Đã xóa khỏi danh sách yêu thích!' });
      } else {
        await addFavorite(book.id);
        setIsFavorite(true);
        setNotification({ type: 'success', message: 'Đã thêm vào danh sách yêu thích!' });
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      setNotification({ type: 'error', message: 'Không thể cập nhật danh sách yêu thích' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !book) {
      setError('Vui lòng đăng nhập');
      return;
    }

    if (!reviewData.content.trim()) {
      setError('Vui lòng nhập bình luận');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      await createReview({
        bookId: book.id,
        userId: user.id,
        rating: reviewData.rating,
        comment: reviewData.content,
      });

      setShowReviewModal(false);
      setReviewData({ rating: 5, content: '' });
      await fetchBookDetails();
      setNotification({ type: 'success', message: 'Đánh giá đã được gửi!' });
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Không thể gửi đánh giá');
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải chi tiết sách...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Không tìm thấy sách</p>
          <Button onClick={() => (window.location.href = '/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại trang chủ
          </Button>
        </div>
      </div>
    );
  }

  const author = authors.find((a) => a.id === book.authorId);
  const category = categories.find((c) => c.id === book.categoryId);
  const isAvailable = book.available > 0;
  const approvedReviews = reviews.filter((r) => r.status === 'approved');
  const averageRating = approvedReviews.length > 0
    ? (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length).toFixed(1)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                window.location.href = '/';
              }
            }}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Notification */}
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg mb-6 ${
              notification.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {notification.message}
          </motion.div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
            {error}
          </div>
        )}

        {/* Main Content - 2 column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Book Cover & Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              {/* Book Cover */}
              <img
                src={book.coverUrl || 'https://via.placeholder.com/300x400'}
                alt={book.title}
                className="w-full h-auto rounded-lg shadow-lg"
              />

              {/* Action Buttons */}
              <div className="space-y-2">
                {hasActiveLoan(book.id) ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 font-medium">
                      ⏳ Đang có yêu cầu mượn
                    </p>
                  </div>
                ) : isAvailable ? (
                  <Button
                    className="w-full"
                    onClick={() => setShowLoanModal(true)}
                    disabled={isSubmitting}
                  >
                    <BookIcon className="w-4 h-4 mr-2" />
                    Yêu cầu mượn
                  </Button>
                ) : (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 font-medium">
                      ✕ Không có sẵn
                    </p>
                  </div>
                )}

                {user?.role === 'borrower' && (
                  <Button
                    variant={isFavorite ? 'default' : 'outline'}
                    className="w-full"
                    onClick={handleToggleFavorite}
                    disabled={isSubmitting}
                  >
                    <Star className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                    {isFavorite ? 'Đã thích' : 'Thêm yêu thích'}
                  </Button>
                )}
              </div>

              {/* Stock Info */}
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-4 border border-teal-200">
                <p className="text-xs text-gray-600 mb-2">THÔNG TIN CÓ SẴN</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-teal-600">{book.available}</span>
                  <span className="text-sm text-gray-600">trên {book.quantity} cuốn</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Book Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Title & Author */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
              <p className="text-lg text-gray-600">
                bởi <span className="font-semibold text-gray-900">{author?.fullName || 'Không rõ tác giả'}</span>
              </p>
            </div>

            {/* Rating */}
            {approvedReviews.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(Number(averageRating))
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{averageRating}</p>
                  <p className="text-sm text-gray-600">({approvedReviews.length} đánh giá)</p>
                </div>
              </div>
            )}

            {/* Book Details */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Chi tiết sách</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Thể loại:</span>
                  <span className="font-medium text-gray-900">{category?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Nhà xuất bản:</span>
                  <span className="font-medium text-gray-900">{book.publisher || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Năm xuất bản:</span>
                  <span className="font-medium text-gray-900">{book.publishYear}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Số trang:</span>
                  <span className="font-medium text-gray-900">{book.pages || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ISBN:</span>
                  <span className="font-medium text-gray-900">{book.isbn || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {book.description && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Mô tả</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {book.description}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - AI Assistant */}
          {user?.role === 'borrower' && (
            <div className="lg:col-span-1">
              <div className="sticky top-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <BookIcon className="w-4 h-4 text-blue-600" />
                  Trợ lý AI
                </h3>
                <BookAI book={book} />
              </div>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="mt-12 bg-white rounded-lg border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-teal-600" />
              <h2 className="text-2xl font-bold text-gray-900">Đánh giá từ độc giả</h2>
            </div>
            {user?.role === 'borrower' && (
              <Button
                size="sm"
                onClick={() => setShowReviewModal(true)}
              >
                <Star className="w-4 h-4 mr-2" />
                Viết đánh giá
              </Button>
            )}
          </div>

          {approvedReviews.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">Chưa có đánh giá nào cho sách này</p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvedReviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{review.userFullName || review.userName || 'Ẩn danh'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {review.createdAt && new Date(review.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{review.content}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loan Modal */}
      <Modal
        isOpen={showLoanModal}
        onClose={() => setShowLoanModal(false)}
        title={`Chọn thời gian mượn: ${book?.title}`}
        size="sm"
      >
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
            <Button onClick={handleRequestLoan} disabled={isSubmitting}>
              {isSubmitting ? 'Đang gửi...' : 'Xác nhận mượn'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Viết đánh giá"
        size="md"
      >
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đánh giá (sao)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewData({ ...reviewData, rating: star })}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= reviewData.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-1">{reviewData.rating} / 5 sao</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bình luận
            </label>
            <textarea
              value={reviewData.content}
              onChange={(e) => setReviewData({ ...reviewData, content: e.target.value })}
              placeholder="Chia sẻ trải nghiệm của bạn về cuốn sách này..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowReviewModal(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
