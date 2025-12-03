import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { mockAuthors, Author } from '../../data/mockData';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

export default function AuthorsManagement() {
  const [authors, setAuthors] = useState(mockAuthors);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    birthYear: new Date().getFullYear() - 30,
    nationality: '',
  });

  const handleOpenModal = (author?: Author) => {
    if (author) {
      setSelectedAuthor(author);
      setFormData({
        name: author.name,
        bio: author.bio || '',
        birthYear: author.birthYear || new Date().getFullYear() - 30,
        nationality: author.nationality || '',
      });
    } else {
      setSelectedAuthor(null);
      setFormData({
        name: '',
        bio: '',
        birthYear: new Date().getFullYear() - 30,
        nationality: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedAuthor) {
      setAuthors(
        authors.map((author) =>
          author.id === selectedAuthor.id ? { ...author, ...formData } : author
        )
      );
    } else {
      const newAuthor: Author = {
        id: String(authors.length + 1),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      setAuthors([...authors, newAuthor]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (authorId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa tác giả này không?')) {
      setAuthors(authors.filter((author) => author.id !== authorId));
    }
  };

  const filteredAuthors = authors.filter((author) =>
    author.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { key: 'name', header: 'Tên' },
    { key: 'nationality', header: 'Quốc tịch' },
    { key: 'birthYear', header: 'Năm sinh' },
    {
      key: 'actions',
      header: 'Hành động',
      render: (author: Author) => (
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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý tác giả</h1>
          <p className="text-gray-600 mt-1">Quản lý tác giả sách</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm tác giả
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <Input
          placeholder="Tìm tác giả..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
        />
        <Table columns={columns} data={filteredAuthors} />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedAuthor ? 'Chỉnh sửa tác giả' : 'Thêm tác giả mới'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Tên"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Năm sinh"
              type="number"
              value={formData.birthYear}
              onChange={(e) =>
                setFormData({ ...formData, birthYear: parseInt(e.target.value) })
              }
            />

            <Input
              label="Quốc tịch"
              value={formData.nationality}
              onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiểu sử</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Hủy
            </Button>
            <Button type="submit">{selectedAuthor ? 'Cập nhật' : 'Tạo'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
