import { useState } from 'react';
import { Plus, Edit2, Trash2, Star } from 'lucide-react';
import { mockReviews, Review } from '../../data/mockData';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

export default function ReviewManagement() {
    const [review, setReview] = useState(mockReviews);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Review | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState({
        comment: '',
        bookId: '',
        userId: '',
        rating: 0,
        status: 'pending' as 'pending' | 'approved' | 'rejected'
    });

    const handleOpenModal = (review?: Review) => {
        if (review) {
            setSelectedCategory(review);
            setFormData({
                comment: review.comment,
                bookId: review.bookId,
                userId: review.userId,
                rating: review.rating,
                status: review.status
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedCategory) {
            setReview(
                review.map((review) =>
                    review.id === selectedCategory.id ? { ...review, ...formData } : review
                )
            );
        } else {
            const newReview: Review = {
                id: String(review.length + 1),
                ...formData,
                createdAt: new Date().toISOString(),
            };
            setReview([...review, newReview]);
        }

        setIsModalOpen(false);
    };

    const handleDelete = (categoryId: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa đánh giá này không?')) {
            setReview(review.filter((review) => review.id !== categoryId));
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
            render: (author: Review) => (
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenModal(author)}
                    >
                        <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(author.id)}
                    >
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                </div>
            ),
        },
    ];

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