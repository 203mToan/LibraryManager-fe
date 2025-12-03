import { useState } from 'react';
import { mockLoans, mockBooks, Loan } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import Table from '../../components/ui/Table';
// Button not used in this file

export default function MyLoans() {
  const { user } = useAuth();
  const [loans] = useState(mockLoans);

  const myLoans = loans.filter((loan) => loan.userId === user!.id);
  const activeLoans = myLoans.filter(
    (loan) => loan.status === 'approved' || loan.status === 'overdue'
  );
  const pendingLoans = myLoans.filter((loan) => loan.status === 'pending');
  const completedLoans = myLoans.filter((loan) => loan.status === 'returned');

  const totalFines = myLoans.reduce((sum, loan) => sum + loan.fine, 0);

  const columns = [
    {
      key: 'bookId',
      header: 'Sách',
      render: (loan: Loan) => {
        const book = mockBooks.find((b) => b.id === loan.bookId);
        return (
          <div className="flex items-center gap-3">
            <img
              src={book?.coverUrl || 'https://via.placeholder.com/50'}
              alt={book?.title}
              className="w-12 h-16 object-cover rounded"
            />
            <span>{book?.title || 'Unknown'}</span>
          </div>
        );
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
        loan.dueDate ? format(new Date(loan.dueDate), 'MMM dd, yyyy') : 'Đang chờ',
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
          {loan.status}
        </span>
      ),
    },
    {
      key: 'renewCount',
      header: 'Số lần gia hạn',
      render: (loan: Loan) => `${loan.renewCount}/2`,
    },
    {
      key: 'fine',
      header: 'Tiền phạt',
      render: (loan: Loan) =>
        loan.fine > 0 ? (
          <span className="text-red-600 font-medium">${loan.fine}</span>
        ) : (
          '-'
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Khoản mượn của tôi</h1>
        <p className="text-gray-600 mt-1">Theo dõi sách đã mượn</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 font-medium">Đang mượn</p>
          <p className="text-3xl font-bold text-teal-600 mt-2">{activeLoans.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 font-medium">Yêu cầu đang chờ</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingLoans.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 font-medium">Hoàn thành</p>
          <p className="text-3xl font-bold text-gray-600 mt-2">{completedLoans.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 font-medium">Tổng tiền phạt</p>
          <p className="text-3xl font-bold text-red-600 mt-2">${totalFines}</p>
        </div>
      </div>

      {totalFines > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Tiền phạt chưa thanh toán</h3>
          <p className="text-red-700">
            Bạn có ${totalFines} tiền phạt chưa thanh toán. Vui lòng thanh toán tại quầy thư viện.
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Lịch sử mượn</h2>
        <Table columns={columns} data={myLoans} />
      </div>
    </div>
  );
}
