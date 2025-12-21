import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Star, CheckCircle, XCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { getAllReviews, createReview, updateReview, deleteReview, approveReview, rejectReview, ReviewResponse } from '../../service/reviewService';
import { getBookById } from '../../service/bookService';
import { getUserById } from '../../service/userService';

interface Review {
  id: string;
  bookId: string;
  userId: string;
  bookName: string;
  userName: string;
  rating: number;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function ReviewManagement() {
    const [review, setReview] = useState<Review[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Review | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [, setIsSubmitting] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        fetchReviews();
    }, [currentPage, pageSize]);

    const fetchReviews = async () => {
        try {
            setIsLoading(true);
            setError('');
            console.log('Fetching reviews page:', currentPage, 'pageSize:', pageSize);
            const response = await getAllReviews(currentPage, pageSize);
            console.log('Raw API response:', response);
            
            // Get reviews data
            const reviews = response.items || [];
            console.log('Reviews data:', reviews);
            
            if (!reviews.length) {
                console.log('No reviews found');
                setReview([]);
                setTotalPages(response.totalPages || 1);
                setTotalItems(response.totalItems || 0);
                setIsLoading(false);
                return;
            }
            
            // Transform API response to match Review interface
            // NOTE: Currently bookName and userName are fetched from API response if available
            // If backend returns bookTitle/userName, use those instead of fetching separately
            const transformedData = reviews.map((rev: ReviewResponse) => ({
                id: rev.id || '',
                bookId: rev.bookId || '',
                userId: rev.userId || '',
                bookName: (rev as any).bookTitle || (rev as any).bookName || `Sách #${rev.bookId}`,
                userName: (rev as any).userName || (rev as any).userFullName || `Người dùng #${rev.userId}`,
                rating: rev.rating || 0,
                content: rev.content || '',
                status: rev.status || 'pending',
                createdAt: rev.createdAt || new Date().toISOString(),
            }));
            
            console.log('Transformed data:', transformedData);
            setReview(transformedData);
            setTotalPages(response.totalPages || 1);
            setTotalItems(response.totalItems || 0);
            setSelectedIds(new Set());
        } catch (err: any) {
            console.error('Failed to fetch reviews:', err);
            
            // Extract error message from backend or axios
            let errorMsg = 'Không thể tải danh sách đánh giá';
            if (err.response?.status === 401 || err.response?.status === 403) {
                errorMsg = 'Bạn không có quyền truy cập. Vui lòng kiểm tra quyền Admin.';
            } else if (err.response?.data) {
                errorMsg = typeof err.response.data === 'string' 
                    ? err.response.data.substring(0, 100) 
                    : err.response.data?.message || errorMsg;
            } else if (err.message) {
                errorMsg = err.message;
            }
            
            setError(errorMsg);
            setReview([]);
        } finally {
            setIsLoading(false);
        }
    };

    const [formData, setFormData] = useState({
        comment: '',
        bookId: '',
        userId: '',
        rating: 0,
        status: 'pending' as 'pending' | 'approved' | 'rejected'
    });

    const handleOpenModal = (rev?: Review) => {
        if (rev) {
            setSelectedCategory(rev);
            setFormData({
                comment: rev.content,
                bookId: rev.bookId,
                userId: rev.userId,
                rating: rev.rating,
                status: rev.status
            });
        } else {
            setSelectedCategory(null);
            setFormData({
                comment: '',
                bookId: '',
                userId: '',
                rating: 0,
                status: 'pending'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const payload = {
                bookId: formData.bookId,
                userId: formData.userId,
                rating: formData.rating,
                comment: formData.comment,
                status: formData.status,
            };

            if (selectedCategory) {
                await updateReview(selectedCategory.id, payload);
                alert('Cập nhật đánh giá thành công!');
            } else {
                await createReview(payload);
                alert('Tạo đánh giá thành công!');
            }

            setIsModalOpen(false);
            await fetchReviews();
        } catch (err) {
            console.error('Error saving review:', err);
            setError('Không thể lưu đánh giá');
            alert('Lỗi: Không thể lưu đánh giá');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleApprove = async (reviewId: string) => {
        if (!confirm('Bạn có chắc chắn muốn phê duyệt đánh giá này không?')) {
            return;
        }

        try {
            setIsSubmitting(true);
            setError('');
            await approveReview(reviewId);
            await fetchReviews();
            alert('Phê duyệt đánh giá thành công!');
        } catch (err) {
            console.error('Error approving review:', err);
            setError('Không thể phê duyệt đánh giá');
            alert('Lỗi: Không thể phê duyệt đánh giá');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async (reviewId: string) => {
        if (!confirm('Bạn có chắc chắn muốn từ chối đánh giá này không?')) {
            return;
        }

        try {
            setIsSubmitting(true);
            setError('');
            await rejectReview(reviewId);
            await fetchReviews();
            alert('Từ chối đánh giá thành công!');
        } catch (err) {
            console.error('Error rejecting review:', err);
            setError('Không thể từ chối đánh giá');
            alert('Lỗi: Không thể từ chối đánh giá');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSelectItem = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedIds.size === filteredCategories.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredCategories.map(r => r.id)));
        }
    };

    const handleBatchDelete = async () => {
        if (selectedIds.size === 0) {
            alert('Vui lòng chọn ít nhất một đánh giá để xóa');
            return;
        }

        if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.size} đánh giá này không?`)) {
            return;
        }

        try {
            setIsSubmitting(true);
            setError('');
            
            for (const id of selectedIds) {
                await deleteReview(id);
            }
            
            setSelectedIds(new Set());
            await fetchReviews();
            alert(`Xóa ${selectedIds.size} đánh giá thành công!`);
        } catch (err) {
            console.error('Error batch deleting reviews:', err);
            setError('Không thể xóa đánh giá');
            alert('Lỗi: Không thể xóa đánh giá');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredCategories = review.filter((review) =>
        review.bookName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const columns = [
        { 
            key: 'select',
            header: '☑',
            render: (review: Review) => (
                <input
                    type="checkbox"
                    checked={selectedIds.has(review.id)}
                    onChange={() => handleSelectItem(review.id)}
                    className="w-4 h-4"
                />
            )
        },
        { key: 'bookName', header: 'Tên sách' },
        { key: 'userName', header: 'Tên người dùng' },
        { 
            key: 'rating', 
            header: 'Số sao',
            render: (review: Review) => (
                <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{review.rating}</span>
                </div>
            )
        },
        { 
            key: 'comment', 
            header: 'Bình luận',
            render: (review: Review) => (
                <div className="max-w-xs truncate" title={review.content}>
                    {review.content}
                </div>
            )
        },
    ];

    if (isLoading) {
        return <div className="text-center py-10">Đang tải...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý đánh giá</h1>
                    <p className="text-gray-600 mt-1">Quản lý đánh giá sách</p>
                </div>
                <div className="flex gap-2">
                    {selectedIds.size > 0 && (
                        <Button 
                            onClick={handleBatchDelete}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Xóa ({selectedIds.size})
                        </Button>
                    )}
                    <Button onClick={() => handleOpenModal()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm đánh giá
                    </Button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <Input
                    placeholder="Tìm đánh giá theo tên sách, tên người dùng hoặc bình luận..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mb-4"
                />
                <div className="mb-4 flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="selectAll"
                        checked={selectedIds.size === filteredCategories.length && filteredCategories.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4"
                    />
                    <label htmlFor="selectAll" className="text-sm text-gray-600">
                        Chọn tất cả ({filteredCategories.length})
                    </label>
                </div>
                <Table columns={columns} data={filteredCategories} />
                
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
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedCategory ? 'Chỉnh sửa đánh giá' : 'Thêm đánh giá mới'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="ID sách"
                        value={formData.bookId}
                        onChange={(e) => setFormData({ ...formData, bookId: e.target.value })}
                        required
                        placeholder="Nhập ID sách"
                    />
                    
                    <Input
                        label="ID người dùng"
                        value={formData.userId}
                        onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                        required
                        placeholder="Nhập ID người dùng"
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Đánh giá
                        </label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, rating: star })}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star 
                                        className={`w-8 h-8 ${
                                            star <= formData.rating 
                                                ? 'fill-yellow-400 text-yellow-400' 
                                                : 'text-gray-300'
                                        }`}
                                    />
                                </button>
                            ))}
                            <span className="ml-2 text-sm text-gray-600 self-center">
                                {formData.rating > 0 ? `${formData.rating} sao${formData.rating > 1 ? '' : ''}` : 'Chưa đánh giá'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bình luận
                        </label>
                        <textarea
                            value={formData.comment}
                            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                            required
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Nhập bình luận đánh giá..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Trạng thái
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'pending' | 'approved' | 'rejected' })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="pending">Đang chờ</option>
                            <option value="approved">Được chấp thuận</option>
                            <option value="rejected">Bị từ chối</option>
                        </select>
                    </div>

                    <div className="flex gap-3 justify-end pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Hủy
                        </Button>
                        <Button type="submit">{selectedCategory ? 'Cập nhật' : 'Tạo'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}