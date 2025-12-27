import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, User as UserIcon, Mail, Shield } from 'lucide-react';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { getAllUsers, createUser, updateUser, deleteUser, UserResponse } from '../../service/userService';

interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    role: 'manager' | 'borrower';
    avatar?: string;
    createdAt: string;
}

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'borrower' as 'manager' | 'borrower',
        avatar: ''
    });

    // Fetch users on component mount
    useEffect(() => {
        fetchUsers(1, 10);
    }, []);

    const fetchUsers = async (page: number, size: number) => {
        try {
            setIsLoading(true);
            setError('');
            const response = await getAllUsers(page, size);

            // Transform API response to match User interface
            const transformedData = (response.items || []).map((user: UserResponse) => ({
                id: user.id || '',
                name: user.fullName || '',
                email: user.email || '',
                password: '',
                role: ((user.role || 'User').toLowerCase() === 'admin' ? 'manager' : 'borrower') as 'manager' | 'borrower',
                avatar: user.avatar || '',
                createdAt: user.createdAt || new Date().toISOString(),
            }));

            setUsers(transformedData);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setError('Không thể tải danh sách người dùng');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (user?: User) => {
        if (user) {
            setSelectedUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                password: '',
                role: user.role,
                avatar: user.avatar || ''
            });
        } else {
            setSelectedUser(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'borrower',
                avatar: ''
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
                email: formData.email,
                userName: formData.email, // Use email as username
                avatar: formData.avatar,
                role: formData.role === 'manager' ? 'Admin' : 'User',
            };

            if (selectedUser) {
                await updateUser(selectedUser.id, payload);
                alert('Cập nhật người dùng thành công!');
            } else {
                await createUser({
                    ...payload,
                    phoneNumber: '',
                    address: '',
                });
                alert('Tạo người dùng thành công!');
            }

            setIsModalOpen(false);
            await fetchUsers(1, 10);
        } catch (err) {
            console.error('Error saving user:', err);
            setError('Không thể lưu người dùng');
            alert('Lỗi: Không thể lưu người dùng');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa người dùng này không?')) {
            return;
        }

        try {
            setIsSubmitting(true);
            setError('');
            await deleteUser(userId);
            await fetchUsers(1, 10);
            alert('Xóa người dùng thành công!');
        } catch (err) {
            console.error('Error deleting user:', err);
            setError('Không thể xóa người dùng');
            alert('Lỗi: Không thể xóa người dùng');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const columns = [
        {
            key: 'avatar',
            header: 'Ảnh đại diện',
            render: (user: User) => (
                <div className="flex items-center justify-center">
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-blue-600" />
                        </div>
                    )}
                </div>
            )
        },
        { key: 'name', header: 'Tên' },
        {
            key: 'email',
            header: 'Email',
            render: (user: User) => (
                <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{user.email}</span>
                </div>
            )
        },
        {
            key: 'role',
            header: 'Vai trò',
            render: (user: User) => (
                <div className="flex items-center gap-2">
                    <Shield className={`w-4 h-4 ${user.role === 'manager' ? 'text-purple-600' : 'text-gray-400'}`} />
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${user.role === 'manager'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-700'
                        }`}>
                        {user.role === 'manager' ? 'Quản lý' : 'Thành viên'}
                    </span>
                </div>
            )
        },
        {
            key: 'createdAt',
            header: 'Ngày tạo',
            render: (user: User) => (
                <span className="text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })}
                </span>
            )
        },
        {
            key: 'actions',
            header: 'Hành động',
            render: (user: User) => (
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenModal(user)}
                    >
                        <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
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
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
                    <p className="text-gray-600 mt-1">Quản lý người dùng hệ thống và vai trò của họ</p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm người dùng
                </Button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <Input
                    placeholder="Tìm người dùng theo tên, email hoặc vai trò..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mb-4"
                />
                <Table columns={columns} data={filteredUsers} />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Họ và tên"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Nhập họ và tên"
                    />

                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder="Nhập địa chỉ email"
                    />

                    <Input
                        label="Mật khẩu"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required={!selectedUser}
                        placeholder={selectedUser ? "Để trống để giữ mật khẩu hiện tại" : "Nhập mật khẩu"}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Vai trò
                        </label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as 'manager' | 'borrower' })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="borrower">Thành viên</option>
                            <option value="manager">Quản lý</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                            {formData.role === 'manager'
                                ? 'Quản lý có thể truy cập bảng điều khiển quản trị và quản lý tất cả dữ liệu'
                                : 'Thành viên có thể duyệt và mượn sách'
                            }
                        </p>
                    </div>

                    <Input
                        label="URL Ảnh đại diện (Tùy chọn)"
                        value={formData.avatar}
                        onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                        placeholder="https://example.com/avatar.jpg"
                    />

                    {formData.avatar && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Xem trước:</span>
                            <img
                                src={formData.avatar}
                                alt="Avatar preview"
                                className="w-12 h-12 rounded-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        </div>
                    )}

                    <div className="flex gap-3 justify-end pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Đang lưu...' : (selectedUser ? 'Cập nhật người dùng' : 'Tạo người dùng')}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}