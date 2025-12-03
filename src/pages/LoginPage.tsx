import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export default function LoginPage({ onSwitchToRegister }: LoginPageProps) {
  const [email, setEmail] = useState('manager@library.com');
  const [password, setPassword] = useState('manager123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await login(email, password);

    if (!success) {
      setError('Email hoặc mật khẩu không hợp lệ');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <div className="flex items-center justify-center mb-8">
          <div className="p-3 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
          Chào mừng trở lại
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Đăng nhập vào tài khoản thư viện của bạn
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
            >
              {error}
            </motion.div>
          )}

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Đăng nhập
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Chưa có tài khoản?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-teal-600 hover:text-teal-700 font-medium"
            >
              Đăng ký tại đây
            </button>
          </p>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 font-medium mb-2">Tài khoản demo:</p>
          <p className="text-xs text-gray-600">Quản lý: manager@library.com / manager123</p>
          <p className="text-xs text-gray-600">Thành viên: john@example.com / john123</p>
        </div>
      </motion.div>
    </div>
  );
}
