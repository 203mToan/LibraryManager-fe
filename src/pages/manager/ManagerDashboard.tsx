import { BookOpen, Users, BookMarked } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getAllBooks } from '../../service/bookService';
// import { getAllUsers } from '../../service/userService';
import { getAllLoans, LoanResponse } from '../../service/loanService';

interface Book {
  id: string;
  title: string;
  quantity: number;
  available?: number;
  stockQuantity?: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ManagerDashboard() {
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loans, setLoans] = useState<LoanResponse[]>([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [booksRes,
          // usersRes, 
          loansRes] = await Promise.all([
            getAllBooks(1, 100),
            // getAllUsers(1, 100),
            getAllLoans()
          ]);

        const booksData = (booksRes.items || []).map((book: any) => ({
          id: book.id,
          title: book.title,
          quantity: book.stockQuantity || 0,
          available: book.availableQuantity || book.stockQuantity || 0
        }));

        // const usersData = (usersRes.items || []).map((user: any) => ({
        //   id: user.id,
        //   name: user.fullName || user.name || '',
        //   email: user.email || '',
        //   role: user.role || ''
        // }));

        setBooks(booksData);
        setTotalBooks(booksRes.totalItems || 0);
        // setUsers(usersData);
        setLoans(loansRes || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  const totalBorrowers = users.filter((u) => u.role === 'borrower').length;
  const activeLoans = loans.filter(
    (l) => l.status === 'Pending'
  ).length;
  const approvedLoans = loans.filter(
    (l) => l.status === 'Approved'
  ).length;

  const stats = [
    {
      label: 'Tổng số sách',
      value: totalBooks,
      icon: BookOpen,
      color: 'from-teal-500 to-cyan-600',
      bgColor: 'bg-teal-50',
    },
    {
      label: 'Yêu cầu đang hoạt động',
      value: activeLoans,
      icon: BookMarked,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Người mượn',
      value: approvedLoans,
      icon: Users,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'Đang chờ duyệt';
      case 'Approved':
        return 'Đã phê duyệt';
      case 'Returned':
        return 'Đã trả';
      case 'overdue':
        return 'Quá hạn';
      default:
        return status;
    }
  };

  const recentLoans = [...loans]
    .sort((a, b) => new Date(b.loanDate || '').getTime() - new Date(a.loanDate || '').getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Trang Chủ</h1>
        <p className="text-gray-600 mt-1">Chào mừng trở lại! Tổng quan thư viện của bạn.</p>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Đang tải...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    </div>
                    <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                      <Icon className={`w-6 h-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent', backgroundClip: 'text' }} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Yêu cầu mượn gần đây</h2>
              <div className="space-y-3">
                {recentLoans.map((loan) => {
                  return (
                    <div
                      key={loan.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{loan.bookName || 'N/A'}</p>
                        <p className="text-sm text-gray-600">{loan.userName || 'N/A'}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${loan.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : loan.status === 'Approved'
                              ? 'bg-green-100 text-green-800'
                              : loan.status === 'Returned'
                                ? 'bg-blue-100 text-blue-800'
                              : loan.status === 'overdue'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {getStatusText(loan.status)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Sách phổ biến</h2>
              <div className="space-y-3">
                {books
                  .map((book) => {
                    const approvedCount = loans.filter(
                      (l) => l.bookId === book.id && l.status === 'Approved'
                    ).length;
                    const returnedCount = loans.filter(
                      (l) => l.bookId === book.id && l.status === 'Returned'
                    ).length;
                    const pendingCount = loans.filter(
                      (l) => l.bookId === book.id && l.status === 'Pending'
                    ).length;

                    return {
                      ...book,
                      approvedCount,
                      returnedCount,
                      pendingCount,
                      borrowedTotal: approvedCount + returnedCount,
                    };
                  })
                  .sort((a, b) => {
                    // Sắp xếp theo số lượng đã được mượn giảm dần
                    if (b.borrowedTotal !== a.borrowedTotal) {
                      return b.borrowedTotal - a.borrowedTotal;
                    }
                    // Nếu bằng nhau, sắp xếp theo số lượng đang chờ duyệt giảm dần
                    return b.pendingCount - a.pendingCount;
                  })
                  .slice(0, 5)
                  .map((book, index) => (
                    <div
                      key={book.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                        <div>
                          <p className="font-medium text-gray-900">{book.title}</p>
                          <p className="text-sm text-gray-600">
                            {book.borrowedTotal} đã được mượn
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-teal-600">
                          {book.quantity || 0}
                        </p>
                        <p className="text-xs text-gray-500">có sẵn</p>
                      </div>
                    </div>
                  ))}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
