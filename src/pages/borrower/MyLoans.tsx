import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import { getMyLoans, returnLoan, payFine, LoanResponse } from '../../service/loanService';
import { getAllBooks } from '../../service/bookService';

interface Book {
  id: string;
  title: string;
  coverUrl?: string;
}

export default function MyLoans() {
  const [loans, setLoans] = useState<LoanResponse[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMyLoans();
  }, []);

  const fetchMyLoans = async () => {
    try {
      setIsLoading(true);
      setError('');
      const [myLoans, booksRes] = await Promise.all([
        getMyLoans(),
        getAllBooks(1, 100)
      ]);
      setLoans(myLoans);
      
      // Transform books response
      const booksData = (booksRes.items || []).map((book: any) => ({
        id: book.id,
        title: book.title,
        coverUrl: book.thumbnailUrl
      }));
      setBooks(booksData);
    } catch (err) {
      console.error('Failed to fetch loans:', err);
      setError('Không thể tải danh sách mượn');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnLoan = async (loanId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xác nhận trả sách?')) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await returnLoan(loanId, new Date().toISOString());
      // Refresh loans
      await fetchMyLoans();
      alert('Xác nhận trả sách thành công!');
    } catch (err) {
      console.error('Failed to return loan:', err);
      setError('Không thể xác nhận trả sách');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayFine = async (loanId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn thanh toán tiền phạt?')) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await payFine(loanId);
      // Refresh loans
      await fetchMyLoans();
      alert('Thanh toán tiền phạt thành công!');
    } catch (err) {
      console.error('Failed to pay fineAmount:', err);
      setError('Không thể thanh toán tiền phạt');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeLoans = loans.filter(
    (loan) => loan.status === 'Approved' || loan.status === 'overdue'
  );
  const PendingLoans = loans.filter((loan) => loan.status === 'Pending');
  const completedLoans = loans.filter((loan) => loan.status === 'Returned');

  const totalFines = loans.reduce((sum, loan) => sum + (loan.fineAmount || 0), 0);

  const columns = [
    {
      key: 'bookId',
      header: 'Sách',
      render: (loan: LoanResponse) => {
        const book = books.find((b) => b.id === loan.bookId);
        return (
          <div className="flex items-center gap-3">
            <img
              src={book?.coverUrl || 'https://via.placeholder.com/50'}
              alt={book?.title}
              className="w-12 h-16 object-cover rounded"
            />
            <span>{loan?.bookName || 'Unknown'}</span>
          </div>
        );
      },
    },
    {
      key: 'loanDate',
      header: 'Ngày mượn',
      render: (loan: LoanResponse) => format(new Date(loan.loanDate), 'MMM dd, yyyy'),
    },
    {
      key: 'dueDate',
      header: 'Ngày trả',
      render: (loan: LoanResponse) =>
        loan.dueDate ? format(new Date(loan.dueDate), 'MMM dd, yyyy') : 'Đang chờ',
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (loan: LoanResponse) => (
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
    // {
    //   key: 'renewCount',
    //   header: 'Gia hạn',
    //   render: (loan: LoanResponse) => `${loan.renewCount || 0}/2`,
    // },
    {
      key: 'fineAmount',
      header: 'Tiền phạt',
      render: (loan: LoanResponse) =>
        loan.fineAmount && loan.fineAmount > 0 ? (
          <span className="text-red-600 font-medium">{loan.fineAmount.toLocaleString('vi-VN')} đ</span>
        ) : (
          '-'
        ),
    },
    {
      key: 'actions',
      header: 'Hành động',
      render: (loan: LoanResponse) => (
        <div className="flex gap-2">
          {loan.status === 'Approved' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleReturnLoan(loan.id)}
              disabled={isSubmitting}
            >
              Trả sách
            </Button>
          )}
          {loan.fineAmount && loan.fineAmount > 0 && loan.status !== 'Returned' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePayFine(loan.id)}
              disabled={isSubmitting}
            >
              Thanh toán
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Khoản mượn của tôi</h1>
          <p className="text-gray-600 mt-1">Theo dõi sách đã mượn</p>
        </div>
        <div className="text-center py-12 text-gray-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Khoản mượn của tôi</h1>
        <p className="text-gray-600 mt-1">Theo dõi sách đã mượn</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 font-medium">Đang mượn</p>
          <p className="text-3xl font-bold text-teal-600 mt-2">{activeLoans.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 font-medium">Yêu cầu đang chờ</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{PendingLoans.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 font-medium">Hoàn thành</p>
          <p className="text-3xl font-bold text-gray-600 mt-2">{completedLoans.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 font-medium">Tổng tiền phạt</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {totalFines.toLocaleString('vi-VN')} đ
          </p>
        </div>
      </div>

      {totalFines > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Tiền phạt chưa thanh toán</h3>
          <p className="text-red-700">
            Bạn có {totalFines.toLocaleString('vi-VN')} đ tiền phạt chưa thanh toán. Vui lòng thanh toán.
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Lịch sử mượn</h2>
        {loans.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Chưa có khoản mượn nào</p>
        ) : (
          <Table columns={columns} data={loans} />
        )}
      </div>
    </div>
  );
}
