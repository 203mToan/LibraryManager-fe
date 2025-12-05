import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';

interface Author {
    id: string;
    name?: string;
    fullName: string;
    bio?: string;
    birthYear?: number;
    nationality?: string;
    bookCount?: number;
    createdAt?: string;
}
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { getAllAuthors, createAuthor, updateAuthor, deleteAuthor } from '../../service/authorService';

export default function AuthorsManagement() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    birthYear: new Date().getFullYear() - 30,
    nationality: '',
  });

  // Fetch authors on component mount
  useEffect(() => {
    fetchAuthors(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const fetchAuthors = async (page: number, size: number) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await getAllAuthors(page, size);
      
      // Transform API response to match Author interface
      const transformedData = (response.items || []).map((author: any) => ({
        id: author.id || '',
        name: author.fullName || author.name || '',
        fullName: author.fullName || author.name || '',
        bio: author.bio || '',
        birthYear: author.birthYear,
        nationality: author.nationality || '',
        bookCount: author.bookCount || 0,
        createdAt: author.createdAt || new Date().toISOString(),
      }));
      
      setAuthors(transformedData);
      setTotalPages(response.totalPages || 1);
      setTotalItems(response.totalItems || 0);
    } catch (err) {
      console.error('Failed to fetch authors:', err);
      setError('Không thể tải danh sách tác giả');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (author?: Author) => {
    if (author) {
      setSelectedAuthor(author);
      setFormData({
        name: author.name || author.fullName || '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const payload = {
        fullName: formData.name,
        bio: formData.bio,
        id: selectedAuthor?.id ?? null
      };

      if (selectedAuthor) {
        await updateAuthor(payload);
      } else {
        await createAuthor(payload);
      }

      setIsModalOpen(false);
      await fetchAuthors(currentPage, pageSize);
    } catch (err) {
      console.error('Error saving author:', err);
      setError('Không thể lưu tác giả');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (authorId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa tác giả này không?')) {
      try {
        setError('');
        await deleteAuthor(authorId);
        await fetchAuthors(currentPage, pageSize);
      } catch (err) {
        console.error('Error deleting author:', err);
        setError('Không thể xóa tác giả');
      }
    }
  };

  const columns = [
    { key: 'name', header: 'Tên' },
    { key: 'bookCount', header: 'Số sách' },
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
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Đang tải...</div>
        ) : (
          <>
            <Table columns={columns} data={authors} />
            
            {/* Pagination Controls */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Hiển thị {authors.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} đến{' '}
                {Math.min(currentPage * pageSize, totalItems)} của {totalItems} tác giả
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
        title={selectedAuthor ? 'Chỉnh sửa tác giả' : 'Thêm tác giả mới'}
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
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {selectedAuthor ? 'Cập nhật' : 'Tạo'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
