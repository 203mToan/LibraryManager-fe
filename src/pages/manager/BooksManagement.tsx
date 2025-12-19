import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import Button from '../../components/ui/Button';

interface Book {
    id: string;
    title: string;
    authorId: string;
    categoryId: string;
    isbn?: string;
    publisher: string;
    publishYear: number;
    yearPublished?: number;
    pages?: number;
    quantity: number;
    stockQuantity?: number;
    available?: number;
    description: string;
    coverUrl?: string;
    thumbnailUrl?: string;
    sumarry?: string;
    summary?: string;
    createdAt?: string;
}
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { getSumaryBook } from '../../service/sumary';
import { getAllBooks, createBook, updateBook, deleteBook } from '../../service/bookService';
import { getAllAuthors } from '../../service/authorService';
import { getAllCategories } from '../../service/categoryService';

interface Author {
  id: string;
  fullName: string;
}

interface Category {
  id: string;
  name: string;
}

export default function BooksManagement() {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [viewBook, setViewBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    authorId: '',
    categoryId: '',
    publisher: '',
    yearPublished: new Date().getFullYear(),
    stockQuantity: 1,
    description: '',
    thumbnailUrl: '',
    summary: '',
  });

  // Fetch data on component mount and page change
  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchBooks(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const fetchInitialData = async () => {
    try {
      // Fetch authors
      const authorsResponse = await getAllAuthors();
      const transformedAuthors = (authorsResponse.items || []).map((author: any) => ({
        id: author.id || '',
        fullName: author.fullName || '',
      }));
      setAuthors(transformedAuthors);

      // Fetch categories
      const categoriesResponse = await getAllCategories();
      const transformedCategories = (categoriesResponse.items || []).map((category: any) => ({
        id: category.id || '',
        name: category.name || '',
      }));
      setCategories(transformedCategories);

      // Set default values for new book
      if (transformedAuthors.length > 0) {
        setFormData(prev => ({ ...prev, authorId: transformedAuthors[0].id }));
      }
      if (transformedCategories.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: transformedCategories[0].id }));
      }
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
    }
  };

  const fetchBooks = async (page: number, size: number) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await getAllBooks(page, size);
      
      // Transform API response to match Book interface
      const transformedData = (response.items || []).map((book: any) => ({
        id: book.id || '',
        title: book.title || '',
        authorId: book.authorId || '',
        categoryId: book.categoryId || '',
        isbn: book.isbn || '',
        publisher: book.publisher || '',
        publishYear: book.yearPublished || new Date().getFullYear(),
        pages: book.pages || 0,
        quantity: book.stockQuantity || 1,
        available: book.availableQuantity || book.stockQuantity || 1,
        description: book.description || '',
        coverUrl: book.thumbnailUrl || '',
        sumarry: book.summary || '',
        createdAt: book.createdAt || new Date().toISOString(),
      }));
      
      setBooks(transformedData);
      setTotalPages(response.totalPages || 1);
      setTotalItems(response.totalItems || 0);
    } catch (err) {
      console.error('Failed to fetch books:', err);
      setError('Không thể tải danh sách sách');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBook = () => {
    setSelectedBook(null);
    setFormData({
      title: '',
      authorId: authors.length > 0 ? authors[0].id : '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      publisher: '',
      yearPublished: new Date().getFullYear(),
      stockQuantity: 1,
      description: '',
      thumbnailUrl: '',
      summary: '',
    });
    setIsModalOpen(true);
  };

  const handleEditBook = (book: Book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      authorId: book.authorId,
      categoryId: book.categoryId,
      publisher: book.publisher,
      yearPublished: book.publishYear,
      stockQuantity: book.quantity,
      description: book.description || '',
      thumbnailUrl: book.coverUrl || '',
      summary: book.sumarry || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.authorId || !formData.categoryId) {
      setError('Vui lòng điền các trường bắt buộc');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const payload = {
        title: formData.title,
        description: formData.description,
        summary: formData.summary,
        thumbnailUrl: formData.thumbnailUrl,
        authorId: formData.authorId,
        categoryId: formData.categoryId,
        publisher: formData.publisher,
        yearPublished: formData.yearPublished,
        stockQuantity: formData.stockQuantity,
      };

      if (selectedBook) {
        await updateBook(selectedBook.id, payload);
      } else {
        await createBook(payload);
      }

      setIsModalOpen(false);
      // Refresh books list
      fetchBooks(currentPage, pageSize);
    } catch (err) {
      console.error('Failed to save book:', err);
      setError('Không thể lưu sách');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sách này?')) {
      try {
        await deleteBook(id);
        // Refresh books list
        fetchBooks(currentPage, pageSize);
      } catch (err) {
        console.error('Failed to delete book:', err);
        setError('Không thể xóa sách');
      }
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const filteredBooks = books.filter((book) => {
    const searchLower = searchQuery.toLowerCase();
    const author = authors.find((a) => a.id === book.authorId);
    const category = categories.find((c) => c.id === book.categoryId);
    
    return (
      book.title.toLowerCase().includes(searchLower) ||
      (author?.fullName || '').toLowerCase().includes(searchLower) ||
      (category?.name || '').toLowerCase().includes(searchLower)
    );
  });

  const columns = [
    {
      key: 'coverUrl',
      header: 'Bìa sách',
      render: (book: Book) => (
        <img
          src={book.coverUrl || 'https://via.placeholder.com/50'}
          alt={book.title}
          className="w-12 h-16 object-cover rounded"
        />
      ),
    },
    { key: 'title', header: 'Tiêu đề' },
    {
      key: 'authorId',
      header: 'Tác giả',
      render: (book: Book) => {
        const author = authors.find((a) => a.id === book.authorId);
        return author?.fullName || 'Không xác định';
      },
    },
    {
      key: 'categoryId',
      header: 'Thể loại',
      render: (book: Book) => {
        const category = categories.find((c) => c.id === book.categoryId);
        return category?.name || 'Không xác định';
      },
    },
    {
      key: 'quantity',
      header: 'Số lượng',
      render: (book: Book) => `${book.quantity}`,
    },
    {
      key: 'actions',
      header: 'Hành động',
      render: (book: Book) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewBook(book)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditBook(book)}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteBook(book.id)}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  const onGetSumary = async () => {
    if (!formData.title || formData.title.length < 10) {
      setError('Tiêu đề phải có ít nhất 10 ký tự');
      return;
    }
    try {
      const data = await getSumaryBook(formData.title);
      setFormData({ ...formData, summary: data });
      setError('');
    } catch (err) {
      console.error('Failed to get summary:', err);
      setError('Không thể lấy tóm tắt');
    }
  };

  return (
    <div className="">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý sách</h1>
          <p className="text-gray-600 mt-1">Quản lý bộ sưu tập thư viện</p>
        </div>
        <Button onClick={handleAddBook}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm sách
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <Input
          placeholder="Tìm theo tiêu đề, tác giả hoặc thể loại..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
        />
        
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Đang tải...</div>
        ) : (
          <>
            <Table columns={columns} data={filteredBooks} />
            
            {/* Pagination Controls */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">
                  Số mục mỗi trang:
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>

              <div className="text-sm text-gray-600">
                Trang {currentPage} / {totalPages} • Tổng cộng {totalItems} mục
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                >
                  Tiếp
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedBook ? 'Chỉnh sửa sách' : 'Thêm sách mới'}
        size="xl"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <Input
            label="Tiêu đề *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tác giả *"
              value={formData.authorId}
              onChange={(e) => setFormData({ ...formData, authorId: e.target.value })}
              options={authors.map((a) => ({ value: a.id, label: a.fullName }))}
              required
            />

            <Select
              label="Thể loại *"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nhà xuất bản"
              value={formData.publisher}
              onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
            />

            <Input
              label="Năm xuất bản"
              type="number"
              value={formData.yearPublished}
              onChange={(e) => setFormData({ ...formData, yearPublished: parseInt(e.target.value) })}
            />
          </div>

          <Input
            label="Số lượng tồn kho *"
            type="number"
            value={formData.stockQuantity}
            onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })}
            required
            min="1"
          />

          <Input
            label="URL bìa sách"
            value={formData.thumbnailUrl}
            onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
            placeholder="https://example.com/cover.jpg"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onGetSumary}>
              Lấy tóm tắt AI
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tóm tắt
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              rows={2}
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : selectedBook ? 'Cập nhật' : 'Tạo'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={!!viewBook}
        onClose={() => setViewBook(null)}
        title="Chi tiết sách"
        size="lg"
      >
        {viewBook && (
          <div className="space-y-4">
            <img
              src={viewBook.coverUrl || 'https://via.placeholder.com/300x400'}
              alt={viewBook.title}
              className="w-full h-64 object-cover rounded-lg"
            />
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{viewBook.title}</h3>
              <p className="text-gray-600">
                bởi {authors.find((a) => a.id === viewBook.authorId)?.fullName || 'Không xác định'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Thể loại</p>
                <p className="font-medium">
                  {categories.find((c) => c.id === viewBook.categoryId)?.name || 'Không xác định'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nhà xuất bản</p>
                <p className="font-medium">{viewBook.publisher}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Năm xuất bản</p>
                <p className="font-medium">{viewBook.publishYear}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Có sẵn</p>
                <p className="font-medium">
                  {viewBook.available} / {viewBook.quantity}
                </p>
              </div>
            </div>
            {viewBook.description && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Mô tả</p>
                <p className="text-gray-900">{viewBook.description}</p>
              </div>
            )}
            {viewBook.sumarry && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Tóm tắt</p>
                <p className="text-gray-900">{viewBook.sumarry}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
