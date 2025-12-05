import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { registerUser } from '../service/authService';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export default function RegisterPage({ onSwitchToLogin }: RegisterPageProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    userName: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
    gender: 'Nam',
    nationalId: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.fullName || !formData.email || !formData.userName || !formData.phoneNumber || 
        !formData.address || !formData.dateOfBirth || !formData.gender || !formData.nationalId || !formData.password) {
      setError('Vui lòng điền tất cả các trường bắt buộc');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        userName: formData.userName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
        gender: formData.gender,
        nationalId: formData.nationalId,
        password: formData.password,
      };

      await registerUser(payload);

      // Clear form and show success
      setFormData({
        fullName: '',
        email: '',
        userName: '',
        phoneNumber: '',
        address: '',
        dateOfBirth: '',
        gender: 'Nam',
        nationalId: '',
        password: '',
        confirmPassword: '',
      });

      // Switch to login page
      onSwitchToLogin();
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl"
      >
        <div className="flex items-center justify-center mb-8">
          <div className="p-3 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
          Đăng ký LibraryHub
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Tạo tài khoản thư viện của bạn
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="text"
              name="fullName"
              label="Họ và tên *"
              placeholder="Nguyễn Văn A"
              value={formData.fullName}
              onChange={handleChange}
              required
            />

            <Input
              type="email"
              name="email"
              label="Email *"
              placeholder="ban@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="text"
              name="userName"
              label="Tên đăng nhập *"
              placeholder="nguyen.van.a"
              value={formData.userName}
              onChange={handleChange}
              required
            />

            <Input
              type="tel"
              name="phoneNumber"
              label="Số điện thoại *"
              placeholder="0123456789"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>

          <Input
            type="text"
            name="address"
            label="Địa chỉ *"
            placeholder="123 Đường ABC, Quận 1, TP.HCM"
            value={formData.address}
            onChange={handleChange}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              name="dateOfBirth"
              label="Ngày sinh *"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giới tính *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <Input
            type="text"
            name="nationalId"
            label="CMND/CCCD *"
            placeholder="VN"
            value={formData.nationalId}
            onChange={handleChange}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="password"
              name="password"
              label="Mật khẩu *"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <Input
              type="password"
              name="confirmPassword"
              label="Xác nhận mật khẩu *"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
            >
              {error}
            </motion.div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Đã có tài khoản?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-teal-600 hover:text-teal-700 font-medium"
            >
              Đăng nhập tại đây
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
