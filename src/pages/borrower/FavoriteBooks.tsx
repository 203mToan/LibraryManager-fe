import { useState, useEffect } from 'react';
import { Heart, Trash2, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Input from '../../components/ui/Input';
import { getFavoriteBooks, removeFavorite, FavoriteBookResponse } from '../../service/favoriteService';

interface FavoriteBook extends FavoriteBookResponse {
  createdAt?: string;
}

export default function FavoriteBooks() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteBook[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchFavorites();
  }, [currentPage, pageSize]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await getFavoriteBooks(currentPage, pageSize);
      const books = response.items || [];

      setFavorites(books);
      setTotalPages(response.totalPages || 1);
      setTotalItems(response.totalItems || 0);
    } catch (err: any) {
      console.error('Failed to fetch favorite books:', err);
      setError('Không thể tải danh sách sách yêu thích');
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (bookId: string, bookTitle: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa "${bookTitle}" khỏi danh sách yêu thích không?`)) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      await removeFavorite(bookId);
      setFavorites(favorites.filter((book) => book.id !== bookId));
      setNotification({ type: 'success', message: 'Đã xóa khỏi danh sách yêu thích!' });
      
      // Refetch to update total count
      await fetchFavorites();
    } catch (err) {
      console.error('Error removing favorite:', err);
      setError('Không thể xóa khỏi danh sách yêu thích');
      setNotification({ type: 'error', message: 'Lỗi: Không thể xóa sách yêu thích' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFavorites = favorites.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (book.description && book.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const columns = [
    {
      key: 'title',
      header: 'Tên sách',
      render: (book: FavoriteBook) => (
        <div className="flex items-center gap-3">
          {book.thumbnailUrl && (
            <img 
              src={book.thumbnailUrl} 
              alt={book.title}
              className="w-10 h-14 object-cover rounded"
            />
          )}
          <div className="max-w-xs">
            <div className="font-medium truncate">{book.title}</div>
            <div className="text-xs text-gray-500 truncate">{book.publisher}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'yearPublished',
      header: 'Năm xuất bản',
      align: 'center' as const,
      render: (book: FavoriteBook) => book.yearPublished || '-',
    },
    {
      key: 'stockQuantity',
      header: 'Số lượng',
      align: 'center' as const,
      render: (book: FavoriteBook) => (
        <span className={book.stockQuantity > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
          {book.stockQuantity}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Mô tả',
      render: (book: FavoriteBook) => (
        <div className="max-w-xs truncate" title={book.description || ''}>
          {book.description || '-'}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Hành động',
      align: 'center' as const,
      render: (book: FavoriteBook) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleRemoveFavorite(book.id, book.title)}
            disabled={isSubmitting}
            className="flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách yêu thích...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            Sách yêu thích
          </h1>
          <p className="text-gray-600 mt-1">Danh sách {totalItems} sách yêu thích của bạn</p>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`p-4 rounded-lg ${
            notification.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <Input
        type="text"
        placeholder="Tìm kiếm sách yêu thích..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setCurrentPage(1);
        }}
        icon={<BookOpen className="w-5 h-5" />}
      />

      {/* Empty State */}
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Heart className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Chưa có sách yêu thích</h3>
          <p className="text-gray-600">Thêm sách vào danh sách yêu thích của bạn để xem chúng ở đây</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Table
              columns={columns}
              data={filteredFavorites}
              onRowClick={() => {}}
              isSelectable={false}
            />
          </div>

          {/* Pagination Info */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Hiển thị {filteredFavorites.length} trên {totalItems} sách
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Trang trước
                </Button>
                <span className="text-sm text-gray-600">
                  Trang {currentPage} / {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Trang sau
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
