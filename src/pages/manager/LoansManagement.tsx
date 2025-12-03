import { useState } from 'react';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { mockLoans, mockBooks, mockUsers, Loan } from '../../data/mockData';
import { format } from 'date-fns';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';

export default function LoansManagement() {
  const [loans, setLoans] = useState(mockLoans);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'overdue'>('all');

  const handleApproveLoan = (loanId: string) => {
    const approvedDate = new Date().toISOString();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    setLoans(
      loans.map((loan) =>
        loan.id === loanId
          ? {
              ...loan,
              status: 'approved',
              approvedDate,
              dueDate: dueDate.toISOString(),
            }
          : loan
      )
    );
  };

  const handleReturnBook = (loanId: string) => {
    const returnDate = new Date().toISOString();

    setLoans(
      loans.map((loan) =>
        loan.id === loanId
          ? {
              ...loan,
              status: 'returned',
              returnDate,
            }
          : loan
      )
    );
  };

  const handleRenewLoan = (loanId: string) => {
    const loan = loans.find((l) => l.id === loanId);
    if (loan && loan.renewCount < 2) {
      const newDueDate = new Date(loan.dueDate!);
      newDueDate.setDate(newDueDate.getDate() + 14);

      setLoans(
        loans.map((l) =>
          l.id === loanId
            ? {
                ...l,
                dueDate: newDueDate.toISOString(),
                renewCount: l.renewCount + 1,
              }
            : l
        )
      );
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
      render: (loan: Loan) => {
        const book = mockBooks.find((b) => b.id === loan.bookId);
        return book?.title || 'Không xác định';
      },
    },
    {
      key: 'userId',
      header: 'Người mượn',
      render: (loan: Loan) => {
        const user = mockUsers.find((u) => u.id === loan.userId);
        return user?.name || 'Không xác định';
      },
    },
    {
      key: 'requestDate',
      header: 'Ngày yêu cầu',
      render: (loan: Loan) => format(new Date(loan.requestDate), 'MMM dd, yyyy'),
    },
    {
      key: 'dueDate',
      header: 'Ngày trả',
      render: (loan: Loan) =>
        loan.dueDate ? format(new Date(loan.dueDate), 'MMM dd, yyyy') : '-',
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (loan: Loan) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            loan.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : loan.status === 'approved'
              ? 'bg-green-100 text-green-800'
              : loan.status === 'overdue'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {loan.status === 'pending' ? 'Đang chờ' : loan.status === 'approved' ? 'Được phê duyệt' : loan.status === 'overdue' ? 'Quá hạn' : 'Trả rồi'}
        </span>
      ),
    },
    {
      key: 'fine',
      header: 'Tiền phạt',
      render: (loan: Loan) => (loan.fine > 0 ? `$${loan.fine}` : '-'),
    },
    {
      key: 'actions',
      header: 'Hành động',
      render: (loan: Loan) => (
        <div className="flex gap-2">
          {loan.status === 'pending' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleApproveLoan(loan.id)}
            >
              <CheckCircle className="w-4 h-4 text-green-500" />
            </Button>
          )}
          {loan.status === 'approved' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReturnBook(loan.id)}
              >
                <XCircle className="w-4 h-4 text-blue-500" />
              </Button>
              {loan.renewCount < 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRenewLoan(loan.id)}
                >
                  <RefreshCw className="w-4 h-4 text-purple-500" />
                </Button>
              )}
            </>
          )}
          {loan.status === 'overdue' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReturnBook(loan.id)}
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

      <div className="flex gap-2">
        {(['all', 'pending', 'approved', 'overdue'] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status === 'all' ? 'Tất cả' : status === 'pending' ? 'Đang chờ' : status === 'approved' ? 'Được phê duyệt' : 'Quá hạn'}
          </Button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <Table columns={columns} data={filteredLoans} />
      </div>
    </div>
  );
}
