import { useState } from 'react';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { mockBooks, mockAuthors, mockCategories, Book } from '../../data/mockData';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { getSumaryBook } from '../../service/sumary';

export default function BooksManagement() {
  const [books, setBooks] = useState(mockBooks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [viewBook, setViewBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    authorId: '',
    categoryId: '',
    isbn: '',
    publisher: '',
    publishYear: new Date().getFullYear(),
    pages: 0,
    quantity: 1,
    description: '',
    coverUrl: '',
    sumarry: '',
  });

  const handleOpenModal = (book?: Book) => {
    if (book) {
      setSelectedBook(book);
      setFormData({
        title: book.title,
        authorId: book.authorId,
        categoryId: book.categoryId,
        isbn: book.isbn,
        publisher: book.publisher,
        publishYear: book.publishYear,
        pages: book.pages,
        quantity: book.quantity,
        description: book.description || '',
        coverUrl: book.coverUrl || '',
        sumarry: book.sumarry || '',
      });
    } else {
      setSelectedBook(null);
      setFormData({
        title: '',
        authorId: mockAuthors[0].id,
        categoryId: mockCategories[0].id,
        isbn: '',
        publisher: '',
        publishYear: new Date().getFullYear(),
        pages: 0,
        quantity: 1,
        description: '',
        coverUrl: '',
        sumarry: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedBook) {
      setBooks(
        books.map((book) =>
          book.id === selectedBook.id
            ? {
              ...book,
              ...formData,
              available: book.available + (formData.quantity - book.quantity),
            }
            : book
        )
      );
    } else {
      const newBook: Book = {
        id: String(books.length + 1),
        ...formData,
        available: formData.quantity,
        createdAt: new Date().toISOString(),
      };
      setBooks([...books, newBook]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (bookId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa cuốn sách này không?')) {
      setBooks(books.filter((book) => book.id !== bookId));
    }
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        const author = mockAuthors.find((a) => a.id === book.authorId);
        return author?.name || 'Không xác định';
      },
    },
    { key: 'isbn', header: 'ISBN' },
    {
      key: 'quantity',
      header: 'Số lượng',
      render: (book: Book) => `${book.available}/${book.quantity}`,
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
            onClick={() => handleOpenModal(book)}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(book.id)}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  const onGetSumary = async () => {
    console.log(formData);
    if (formData.title?.length < 10) return
    try {
      const data = await getSumaryBook(formData.title)
      console.log(data);
      setFormData({ ...formData, sumarry: data })
    } catch (error) {
      console.log(error);

    }
  }
  return (
    <div className="">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý sách</h1>
          <p className="text-gray-600 mt-1">Quản lý bộ sưu tập thư viện</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm sách
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <Input
          placeholder="Tìm theo tiêu đề hoặc ISBN..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
        />
        <Table columns={columns} data={filteredBooks} />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedBook ? 'Chỉnh sửa sách' : 'Thêm sách mới'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Tiêu đề"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tác giả"
              value={formData.authorId}
              onChange={(e) => setFormData({ ...formData, authorId: e.target.value })}
              options={mockAuthors.map((a) => ({ value: a.id, label: a.name }))}
            />

            <Select
              label="Thể loại"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              options={mockCategories.map((c) => ({ value: c.id, label: c.name }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="ISBN"
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              required
            />

            <Input
              label="Nhà xuất bản"
              value={formData.publisher}
              onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Năm xuất bản"
              type="number"
              value={formData.publishYear}
              onChange={(e) => setFormData({ ...formData, publishYear: parseInt(e.target.value) })}
              required
            />

            <Input
              label="Số trang"
              type="number"
              value={formData.pages}
              onChange={(e) => setFormData({ ...formData, pages: parseInt(e.target.value) })}
              required
            />

            <Input
              label="Số lượng"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              required
              min="1"
            />
          </div>

          <Input
            label="URL bìa"
            value={formData.coverUrl}
            onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
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
          <Button type="button" onClick={onGetSumary}>
            Lấy tóm tắt
          </Button>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tóm tắt
            </label>
            <textarea
              value={formData.sumarry}
              onChange={(e) => setFormData({ ...formData, sumarry: e.target.value })}
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
            <Button type="submit">
              {selectedBook ? 'Cập nhật' : 'Tạo'}
            </Button>
          </div>
        </form>
      </Modal>

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
                bởi {mockAuthors.find((a) => a.id === viewBook.authorId)?.name}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">ISBN</p>
                <p className="font-medium">{viewBook.isbn}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nhà xuất bản</p>
                <p className="font-medium">{viewBook.publisher}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Năm</p>
                <p className="font-medium">{viewBook.publishYear}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Số trang</p>
                <p className="font-medium">{viewBook.pages}</p>
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
          </div>
        )}
      </Modal>
    </div>
  );
}
