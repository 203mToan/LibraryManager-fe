import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Star } from 'lucide-react';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import {
  getMyLoans,
  returnLoan,
  payFine,
  cancelLoan,
  LoanResponse,
} from '../../service/loanService';
import { getAllBooks } from '../../service/bookService';
import { createReview } from '../../service/reviewService';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface Book {
  id: string;
  title: string;
  coverUrl?: string;
}

export default function MyLoans() {
  const { user } = useAuth();
  const [loans, setLoans] = useState<LoanResponse[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanResponse | null>(null);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    content: '',
  });

  useEffect(() => {
    fetchMyLoans();
  }, []);

  const fetchMyLoans = async () => {
    try {
      setIsLoading(true);
      setError('');

      const [myLoans, booksRes] = await Promise.all([
        getMyLoans(),
        getAllBooks(1, 100),
      ]);

      setLoans(myLoans);

      const booksData = (booksRes.items || []).map((book: any) => ({
        id: book.id,
        title: book.title,
        coverUrl: book.thumbnailUrl,
      }));

      setBooks(booksData);
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách mượn');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnLoan = async (loanId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xác nhận trả sách?')) return;

    try {
      setIsSubmitting(true);
      await returnLoan(loanId, new Date().toISOString());
      await fetchMyLoans();
      alert('Xác nhận trả sách thành công!');
    } catch (err) {
      console.error(err);
      setError('Không thể xác nhận trả sách');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayFine = async (loanId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn thanh toán tiền phạt?')) return;

    try {
      setIsSubmitting(true);
      await payFine(loanId);
      await fetchMyLoans();
      alert('Thanh toán tiền phạt thành công!');
    } catch (err) {
      console.error(err);
      setError('Không thể thanh toán tiền phạt');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelLoan = async (loanId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy mượn sách này?')) return;

    try {
      setIsSubmitting(true);
      await cancelLoan(loanId);
      await fetchMyLoans();
      alert('Hủy mượn thành công!');
    } catch (err) {
      console.error(err);
      setError('Không thể hủy mượn');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReborrow = (bookId: string | number) => {
    window.location.href = `/books/${bookId}`;
  };

  const handleReviewBook = (loan: LoanResponse) => {
    setSelectedLoan(loan);
    setReviewData({ rating: 5, content: '' });
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedLoan || !user) return;

    if (!reviewData.content.trim()) {
      alert('Vui lòng nhập bình luận');
      return;
    }

    try {
      setIsSubmitting(true);
      await createReview({
        bookId: String(selectedLoan.bookId),
        userId: user.id,
        rating: reviewData.rating,
        comment: reviewData.content,
      });
      setIsReviewModalOpen(false);
      setReviewData({ rating: 5, content: '' });
      setSelectedLoan(null);
      alert('Cảm ơn bạn đã đánh giá sách!');
      await fetchMyLoans();
    } catch (err: any) {
      console.error('Error submitting review:', err);
      const errorMessage = err.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeLoans = loans.filter(
    (loan) => loan.status === 'Approved' || loan.status === 'overdue'
  );
  const pendingLoans = loans.filter((loan) => loan.status === 'Pending');
  const completedLoans = loans.filter((loan) => loan.status === 'Returned');

  const totalFines = loans.reduce(
    (sum, loan) => sum + (loan.fineAmount || 0),
    0
  );

  const columns: Column<LoanResponse>[] = [
    {
      key: 'bookId',
      header: 'Sách',
      render: (loan) => {
        const book = books.find((b) => b.id === loan.bookId);
        return (
          <div className="flex items-center gap-3">
            <img
              src={book?.coverUrl || 'https://via.placeholder.com/50'}
              alt={book?.title}
              className="w-12 h-16 object-cover rounded"
            />
            <span>{loan.bookName || 'Unknown'}</span>
          </div>
        );
      },
    },
    {
      key: 'loanDate',
      header: 'Ngày mượn',
      render: (loan) =>
        format(new Date(loan.loanDate), 'MMM dd, yyyy'),
    },
    {
      key: 'dueDate',
      header: 'Ngày trả',
      render: (loan) =>
        loan.dueDate
          ? format(new Date(loan.dueDate), 'MMM dd, yyyy')
          : 'Đang chờ',
    },
    {
      key: 'status',
      header: 'Trạng thái',
      align: 'center',
      render: (loan) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            loan.status === 'Pending'
              ? 'bg-yellow-100 text-yellow-800'
              : loan.status === 'Approved'
              ? 'bg-green-100 text-green-800'
              : loan.status === 'overdue'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {loan.status === 'Pending' && 'Đang chờ duyệt'}
          {loan.status === 'Approved' && 'Đã duyệt'}
          {loan.status === 'overdue' && 'Quá hạn'}
          {loan.status === 'Returned' && 'Đã trả'}
        </span>
      ),
    },
    {
      key: 'fineAmount',
      header: 'Tiền phạt',
      align: 'center',
      render: (loan) =>
        loan.fineAmount && loan.fineAmount > 0 ? (
          <span className="text-red-600 font-medium">
            {loan.fineAmount.toLocaleString('vi-VN')} đ
          </span>
        ) : (
          '-'
        ),
    },
    {
      key: 'actions',
      header: 'Hành động',
      align: 'center',
      render: (loan) => {
        const hasFine =
          loan.fineAmount !== undefined && loan.fineAmount > 0;
        const isReturned = loan.status === 'Returned';
        const isPending = loan.status === 'Pending';
        const isApproved =
          loan.status === 'Approved' || loan.status === 'overdue';

        return (
          <div className="flex gap-2 justify-center">
            {isApproved ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReturnLoan(loan.id)}
                disabled={isSubmitting}
              >
                Trả sách
              </Button>
            ) : null}

            {isPending ? (
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:bg-red-50"
                onClick={() => handleCancelLoan(loan.id)}
                disabled={isSubmitting}
              >
                Hủy mượn
              </Button>
            ) : null}

            {hasFine && !isReturned ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePayFine(loan.id)}
                disabled={isSubmitting}
              >
                Thanh toán
              </Button>
            ) : null}

            {isReturned ? (
              <Button
                size="sm"
                variant="outline"
                className="text-amber-600 hover:bg-amber-50"
                onClick={() => handleReviewBook(loan)}
                disabled={isSubmitting}
              >
                <Star className="w-4 h-4 mr-1" />
                Đánh giá
              </Button>
            ) : null}
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-500">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Khoản mượn của tôi</h1>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Stat title="Đang mượn" value={activeLoans.length} color="teal" />
        <Stat title="Đang chờ" value={pendingLoans.length} color="yellow" />
        <Stat title="Hoàn thành" value={completedLoans.length} color="gray" />
        <Stat
          title="Tổng tiền phạt"
          value={`${totalFines.toLocaleString('vi-VN')} đ`}
          color="red"
        />
      </div>

      <Table columns={columns} data={loans} />

      {/* Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={`Đánh giá: ${selectedLoan?.bookName || ''}`}
        size="md"
      >
        <div className="space-y-4">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Xếp hạng
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewData({ ...reviewData, rating: star })}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= reviewData.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bình luận
            </label>
            <textarea
              value={reviewData.content}
              onChange={(e) =>
                setReviewData({ ...reviewData, content: e.target.value })
              }
              placeholder="Chia sẻ cảm nhận của bạn về cuốn sách..."
              className="w-full h-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setIsReviewModalOpen(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Stat({
  title,
  value,
  color,
}: {
  title: string;
  value: any;
  color: string;
}) {
  return (
    <div className="bg-white border rounded-xl p-6">
      <p className="text-sm text-gray-600">{title}</p>
      <p className={`text-3xl font-bold text-${color}-600 mt-2`}>
        {value}
      </p>
    </div>
  );
}
