import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Star, CheckCircle, XCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { getAllReviews, createReview, updateReview, deleteReview, approveReview, rejectReview, ReviewResponse } from '../../service/reviewService';

interface Review {
  id: string;
  bookId: string;
  userId: string;
  rating: number;
  comment: string;
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

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setIsLoading(true);
            setError('');
            const response = await getAllReviews(1, 10);
            
            // Transform API response to match Review interface
            const transformedData = (response.items || []).map((rev: ReviewResponse) => ({
                id: rev.id || '',
                bookId: rev.bookId || '',
                userId: rev.userId || '',
                rating: rev.rating || 0,
                comment: rev.comment || '',
                status: rev.status || 'pending',
                createdAt: rev.createdAt || new Date().toISOString(),
            }));
            
            setReview(transformedData);
        } catch (err) {
            console.error('Failed to fetch reviews:', err);
            setError('Không thể tải danh sách đánh giá');
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
                comment: rev.comment,
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

    const handleDelete = async (reviewId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này không?')) {
            return;
        }

        try {
            setIsSubmitting(true);
            setError('');
            await deleteReview(reviewId);
            await fetchReviews();
            alert('Xóa đánh giá thành công!');
        } catch (err) {
            console.error('Error deleting review:', err);
            setError('Không thể xóa đánh giá');
            alert('Lỗi: Không thể xóa đánh giá');
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

    const filteredCategories = review.filter((review) =>
        review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.bookId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.userId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const columns = [
        { key: 'bookId', header: 'ID sách' },
        { key: 'userId', header: 'ID người dùng' },
        { 
            key: 'rating', 
            header: 'Đánh giá',
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
                <div className="max-w-xs truncate" title={review.comment}>
                    {review.comment}
                </div>
            )
        },
        {
            key: 'status',
            header: 'Trạng thái',
            render: (review: Review) => (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    review.status === 'approved' 
                        ? 'bg-green-100 text-green-700'
                        : review.status === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                }`}>
                    {review.status === 'approved' ? 'Được chấp thuận' : review.status === 'rejected' ? 'Bị từ chối' : 'Đang chờ'}
                </span>
            )
        },
        {
            key: 'actions',
            header: 'Hành động',
            render: (rev: Review) => (
                <div className="flex gap-2">
                    {rev.status === 'pending' && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(rev.id)}
                                className="text-green-600 hover:text-green-700"
                            >
                                <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReject(rev.id)}
                                className="text-red-600 hover:text-red-700"
                            >
                                <XCircle className="w-4 h-4" />
                            </Button>
                        </>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenModal(rev)}
                    >
                        <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(rev.id)}
                    >
                        <Trash2 className="w-4 h-4 text-red-500" />
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
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý đánh giá</h1>
                    <p className="text-gray-600 mt-1">Quản lý đánh giá sách</p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm đánh giá
                </Button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <Input
                    placeholder="Tìm đánh giá theo bình luận, ID sách hoặc ID người dùng..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mb-4"
                />
                <Table columns={columns} data={filteredCategories} />
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