import { useState } from 'react';
import { Search, Book as BookIcon } from 'lucide-react';
import { mockBooks, mockAuthors, mockCategories, mockLoans, Book } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import BookAI from '../../components/ai/BookAI';
import { motion } from 'framer-motion';

export default function BrowseBooks() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [loans, setLoans] = useState(mockLoans);

  const handleRequestLoan = (bookId: string) => {
    const newLoan = {
      id: String(loans.length + 1),
      bookId,
      userId: user!.id,
      requestDate: new Date().toISOString(),
      renewCount: 0,
      status: 'pending' as const,
      fine: 0,
    };

    setLoans([...loans, newLoan]);
    alert('Yêu cầu mượn đã gửi thành công!');
    setSelectedBook(null);
  };

  const hasActiveLoan = (bookId: string) => {
    return loans.some(
      (loan) =>
        loan.bookId === bookId &&
        loan.userId === user!.id &&
        (loan.status === 'pending' || loan.status === 'approved')
    );
  };

  let filteredBooks = mockBooks.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mockAuthors.find((a) => a.id === book.authorId)?.name.toLowerCase().includes(searchQuery.toLowerCase());

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Duyệt sách</h1>
        <p className="text-gray-600 mt-1">Khám phá và mượn sách từ bộ sưu tập của chúng tôi</p>
      </div>

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
              ...mockCategories.map((c) => ({ value: c.id, label: c.name })),
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book, index) => {
            const author = mockAuthors.find((a) => a.id === book.authorId);
            const category = mockCategories.find((c) => c.id === book.categoryId);
            const isAvailable = book.available > 0;

            return (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedBook(book)}
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
                  <p className="text-sm text-gray-600 mb-2">{author?.name}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{category?.name}</span>
                    <span
                      className={`text-xs font-medium ${
                        isAvailable ? 'text-green-600' : 'text-red-600'
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
                    bởi {mockAuthors.find((a) => a.id === selectedBook.authorId)?.name}
                  </p>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">Thể loại: </span>
                    <span className="font-medium">
                      {mockCategories.find((c) => c.id === selectedBook.categoryId)?.name}
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
                    <span className="text-sm text-gray-600">Tình trạng: </span>
                    <span className="font-medium text-teal-600">
                      {selectedBook.available} / {selectedBook.quantity}
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
                    onClick={() => handleRequestLoan(selectedBook.id)}
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
    </div>
  );
}
