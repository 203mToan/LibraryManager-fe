import { useState, useEffect } from 'react';
import { Edit2, Trash2, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { getAllReviews, updateReview, deleteReview, ReviewResponse } from '../../service/reviewService';

interface Review {
  id: string;
  bookId: string;
  userId: string;
  bookName: string;
  rating: number;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function MyReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [formData, setFormData] = useState({
    rating: 5,
    content: '',
  });
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchMyReviews();
  }, [currentPage, pageSize]);

  const fetchMyReviews = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Fetch all reviews then filter by current user
      const response = await getAllReviews(1, 1000);
      const allReviews = response.items || [];
      
      // Filter reviews by current user
      const myReviews = allReviews.filter((rev: ReviewResponse) => rev.userId === user?.id);
      
      // Calculate pagination
      const filteredCount = myReviews.length;
      const pages = Math.ceil(filteredCount / pageSize);
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedReviews = myReviews.slice(startIndex, endIndex);
      
      // Transform data
      const transformedData = paginatedReviews.map((rev: ReviewResponse) => ({
        id: rev.id || '',
        bookId: rev.bookId || '',
        userId: rev.userId || '',
        bookName: (rev as any).bookTitle || (rev as any).bookName || `Sách #${rev.bookId}`,
        rating: rev.rating || 0,
        content: rev.content || '',
        status: rev.status || 'pending',
        createdAt: rev.createdAt || new Date().toISOString(),
      }));
      
      setReviews(transformedData);
      setTotalPages(pages || 1);
      setTotalItems(filteredCount);
    } catch (err: any) {
      console.error('Failed to fetch reviews:', err);
      setError('Không thể tải danh sách đánh giá');
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (review?: Review) => {
    if (review) {
      setSelectedReview(review);
      setFormData({
        rating: review.rating,
        content: review.content,
      });
    } else {
      setSelectedReview(null);
      setFormData({
        rating: 5,
        content: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedReview) {
      setError('Không có đánh giá nào được chọn');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      await updateReview(selectedReview.id, {
        rating: formData.rating,
        content: formData.content,
      } as any);

      setIsModalOpen(false);
      setSelectedReview(null);
      await fetchMyReviews();
      setNotification({ type: 'success', message: 'Cập nhật đánh giá thành công!' });
    } catch (err) {
      console.error('Error updating review:', err);
      setError('Không thể cập nhật đánh giá');
      setNotification({ type: 'error', message: 'Lỗi: Không thể cập nhật đánh giá' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này không?')) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      await deleteReview(id);
      await fetchMyReviews();
      setNotification({ type: 'success', message: 'Xóa đánh giá thành công!' });
    } catch (err) {
      console.error('Error deleting review:', err);
      setError('Không thể xóa đánh giá');
      setNotification({ type: 'error', message: 'Lỗi: Không thể xóa đánh giá' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReviews = reviews.filter((review) =>
    review.bookName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      key: 'bookName',
      header: 'Tên sách',
      render: (review: Review) => (
        <div className="max-w-xs truncate" title={review.bookName}>
          {review.bookName}
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Đánh giá',
      render: (review: Review) => (
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{review.rating}</span>
        </div>
      ),
    },
    {
      key: 'content',
      header: 'Bình luận',
      render: (review: Review) => (
        <div className="max-w-xs truncate" title={review.content}>
          {review.content}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Ngày đánh giá',
      render: (review: Review) => new Date(review.createdAt).toLocaleDateString('vi-VN'),
    },
    {
      key: 'actions',
      header: 'Hành động',
      align: 'center' as const,
      render: (review: Review) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenModal(review)}
            disabled={review.status !== 'pending'}
            title={review.status !== 'pending' ? 'Chỉ có thể sửa đánh giá chưa được duyệt' : ''}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(review.id)}
            disabled={review.status !== 'pending'}
            title={review.status !== 'pending' ? 'Chỉ có thể xóa đánh giá chưa được duyệt' : ''}
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <div className="text-center py-10">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Đánh giá của tôi</h1>
          <p className="text-gray-600 mt-1">Quản lý đánh giá sách của bạn</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <Input
          placeholder="Tìm đánh giá theo tên sách hoặc bình luận..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
        />

        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Bạn chưa có đánh giá nào</p>
          </div>
        ) : (
          <>
            <Table columns={columns} data={filteredReviews} />

            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Tổng cộng: <span className="font-medium">{totalItems}</span> đánh giá
              </div>

              <div className="flex items-center gap-4">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="5">5 / trang</option>
                  <option value="10">10 / trang</option>
                  <option value="20">20 / trang</option>
                  <option value="50">50 / trang</option>
                </select>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || isLoading}
                  >
                    Trước
                  </Button>

                  <div className="flex items-center gap-1 px-3 py-2">
                    <span className="text-sm font-medium">Trang {currentPage} / {totalPages}</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || isLoading}
                  >
                    Tiếp
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Chỉnh sửa đánh giá"
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sách: <span className="font-semibold">{selectedReview?.bookName}</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá (sao)</label>
            <select
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">1 sao</option>
              <option value="2">2 sao</option>
              <option value="3">3 sao</option>
              <option value="4">4 sao</option>
              <option value="5">5 sao</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bình luận</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Nhập bình luận của bạn..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
              type="button"
            >
              Hủy
            </Button>
            <Button 
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Notification Modal */}
      <Modal
        isOpen={!!notification}
        onClose={() => setNotification(null)}
        title={notification?.type === 'success' ? 'Thành công' : 'Lỗi'}
        size="sm"
      >
        <div className="text-center">
          <div className={`p-3 rounded-full mx-auto w-12 h-12 flex items-center justify-center mb-3 ${
            notification?.type === 'success' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <span className={`text-lg font-bold ${
              notification?.type === 'success' ? 'text-green-600' : 'text-red-600'
            }`}>
              {notification?.type === 'success' ? '✓' : '✕'}
            </span>
          </div>
          <p className="text-gray-700 mb-4">{notification?.message}</p>
          <Button onClick={() => setNotification(null)} className="w-full">
            Đóng
          </Button>
        </div>
      </Modal>
    </div>
  );
}
