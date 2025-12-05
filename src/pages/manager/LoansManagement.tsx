import { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import { getAllLoans, approveLoan, returnLoan, LoanResponse } from '../../service/loanService';
import { getAllBooks } from '../../service/bookService';

interface Book {
  id: string;
  title: string;
  coverUrl?: string;
}

export default function LoansManagement() {
  const [loans, setLoans] = useState<LoanResponse[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [filter, setFilter] = useState<'all' | 'Pending' | 'Approved' | 'overdue' | 'Returned'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      setIsLoading(true);
      setError('');
      const [allLoans, booksRes] = await Promise.all([
        getAllLoans(),
        getAllBooks(1, 100)
      ]);
      setLoans(allLoans);
      
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

  const handleApproveLoan = async (loanId: number) => {
    try {
      setIsSubmitting(true);
      setError('');
      await approveLoan(loanId);
      // Refresh loans
      await fetchLoans();
      alert('Phê duyệt mượn thành công!');
    } catch (err) {
      console.error('Failed to approve loan:', err);
      setError('Không thể phê duyệt mượn');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnBook = async (loanId: number) => {
    if (!window.confirm('Xác nhận cuốn sách đã được trả?')) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await returnLoan(loanId, new Date().toISOString());
      // Refresh loans
      await fetchLoans();
      alert('Xác nhận trả sách thành công!');
    } catch (err) {
      console.error('Failed to return loan:', err);
      setError('Không thể xác nhận trả sách');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLoans = loans.filter((loan) => {
    if (filter === 'all') return true;
    return loan.status === filter;
  });

  const columns = [
    {
      key: 'bookId',
      header: 'Sách',
      render: (loan: LoanResponse) => {
        return loan?.bookName || 'Không xác định';
      },
    },
    {
      key: 'userId',
      header: 'Người mượn',
      render: (loan: LoanResponse) => {
        return loan?.userName || 'Không xác định';
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
        loan.dueDate ? format(new Date(loan.dueDate), 'MMM dd, yyyy') : '-',
    },
    {
      key: 'returnDate',
      header: 'Ngày trả thực tế',
      render: (loan: LoanResponse) =>
        loan.returnDate ? format(new Date(loan.returnDate), 'MMM dd, yyyy') : '-',
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
          {loan.status === 'Pending' && 'Đang chờ'}
          {loan.status === 'Approved' && 'Được phê duyệt'}
          {loan.status === 'overdue' && 'Quá hạn'}
          {loan.status === 'Returned' && 'Đã trả'}
        </span>
      ),
    },
    {
      key: 'fineAmount',
      header: 'Tiền phạt',
      render: (loan: LoanResponse) => (loan.fineAmount && loan.fineAmount > 0 ? `${loan.fineAmount.toLocaleString('vi-VN')} đ` : '-'),
    },
    {
      key: 'actions',
      header: 'Hành động',
      render: (loan: LoanResponse) => (
        <div className="flex gap-2">
          {loan.status === 'Pending' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleApproveLoan(loan.id)}
              disabled={isSubmitting}
              title="Phê duyệt"
            >
              <CheckCircle className="w-4 h-4 text-green-500" />
            </Button>
          )}
          {(loan.status === 'Approved' || loan.status === 'overdue') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReturnBook(loan.id)}
              disabled={isSubmitting}
              title="Xác nhận trả"
            >
              <XCircle className="w-4 h-4 text-blue-500" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý mượn trả</h1>
        <p className="text-gray-600 mt-1">Quản lý yêu cầu mượn và trả sách</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {(['all', 'Pending', 'Approved', 'overdue', 'Returned'] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status === 'all' && 'Tất cả'}
            {status === 'Pending' && 'Đang chờ'}
            {status === 'Approved' && 'Được phê duyệt'}
            {status === 'overdue' && 'Quá hạn'}
            {status === 'Returned' && 'Đã trả'}
          </Button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Đang tải...</div>
        ) : filteredLoans.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Không có mượn nào</div>
        ) : (
          <Table columns={columns} data={filteredLoans} />
        )}
      </div>
    </div>
  );
}
