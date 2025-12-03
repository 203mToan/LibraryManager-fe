import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { mockCategories, Category } from '../../data/mockData';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

export default function CategorieManagement() {
    const [categories, setCategories] = useState(mockCategories);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState({
        name: '',
    });

    const handleOpenModal = (category?: Category) => {
        if (category) {
            setSelectedCategory(category);
            setFormData({
                name: category.name,
            });
        } else {
            setSelectedCategory(null);
            setFormData({
                name: '',
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedCategory) {
            setCategories(
                categories.map((category) =>
                    category.id === selectedCategory.id ? { ...category, ...formData } : category
                )
            );
        } else {
            const newCategory: Category = {
                id: String(categories.length + 1),
                ...formData,
                createdAt: new Date().toISOString(),
            };
            setCategories([...categories, newCategory]);
        }

        setIsModalOpen(false);
    };

    const handleDelete = (categoryId: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa thể loại này không?')) {
            setCategories(categories.filter((category) => category.id !== categoryId));
        }
    };

    const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                <Input
                    placeholder="Tìm thể loại..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mb-4"
                />
                <Table columns={columns} data={filteredCategories} />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedCategory ? 'Chỉnh sửa thể loại' : 'Thêm thể loại mới'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Tên"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <div className="flex gap-3 justify-end">
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
