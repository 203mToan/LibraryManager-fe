import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';

interface Category {
    id: string;
    name: string;
    description?: string;
    createdAt?: string;
}
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../service/categoryService';

export default function CategorieManagement() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    // Fetch categories on component mount and when page/pageSize changes
    useEffect(() => {
        fetchCategories(currentPage, pageSize);
    }, [currentPage, pageSize]);

    const fetchCategories = async (page: number, size: number) => {
        try {
            setIsLoading(true);
            setError('');
            const response = await getAllCategories(page, size);
            
            // Transform API response to match Category interface
            const transformedData = (response.items || []).map((category: any) => ({
                id: category.id || '',
                name: category.name || '',
                description: category.description || '',
                createdAt: category.createdAt || new Date().toISOString(),
            }));
            
            setCategories(transformedData);
            setTotalPages(response.totalPages || 1);
            setTotalItems(response.totalItems || 0);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
            setError('Không thể tải danh sách thể loại');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (category?: Category) => {
        if (category) {
            setSelectedCategory(category);
            setFormData({
                name: category.name,
                description: category.description || '',
            });
        } else {
            setSelectedCategory(null);
            setFormData({
                name: '',
                description: '',
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
                name: formData.name,
                description: formData.description,
            };

            if (selectedCategory) {
                await updateCategory(selectedCategory.id, payload);
            } else {
                await createCategory(payload);
            }

            setIsModalOpen(false);
            await fetchCategories(currentPage, pageSize);
        } catch (err) {
            console.error('Error saving category:', err);
            setError('Không thể lưu thể loại');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (categoryId: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa thể loại này không?')) {
            try {
                setError('');
                await deleteCategory(categoryId);
                await fetchCategories(currentPage, pageSize);
            } catch (err) {
                console.error('Error deleting category:', err);
                setError('Không thể xóa thể loại');
            }
        }
    };

    const columns = [
        { key: 'name', header: 'Tên thể loại' },
        {
            key: 'actions',
            header: 'Hành động',
            render: (author: Category) => (
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
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý thể loại</h1>
                    <p className="text-gray-600 mt-1">Quản lý thể loại sách</p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm thể loại
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {error}
                    </div>
                )}
                {isLoading ? (
                    <div className="text-center py-8 text-gray-500">Đang tải...</div>
                ) : (
                    <>
                        <Table columns={columns} data={categories} />
                        
                        {/* Pagination Controls */}
                        <div className="mt-6 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Hiển thị {categories.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} đến{' '}
                                {Math.min(currentPage * pageSize, totalItems)} của {totalItems} thể loại
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <select
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(parseInt(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                title={selectedCategory ? 'Chỉnh sửa thể loại' : 'Thêm thể loại mới'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}
                    <Input
                        label="Tên"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="Nhập mô tả thể loại..."
                        />
                    </div>
                    <div className="flex gap-3 justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                            disabled={isSubmitting}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" isLoading={isSubmitting}>
                            {selectedCategory ? 'Cập nhật' : 'Tạo'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
