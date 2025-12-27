import { BookOpen, Users, BookMarked, FolderTree, UserCircle, BarChart3, FileText, Home, LogOut, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { user, logout } = useAuth();

  const managerMenuItems = [
    { id: 'dashboard', label: 'Trang chủ', icon: Home },
    { id: 'books', label: 'Sách', icon: BookOpen },
    { id: 'authors', label: 'Tác giả', icon: Users },
    { id: 'categories', label: 'Thể loại', icon: FolderTree },
    { id: 'loans', label: 'Mượn sách', icon: BookMarked },
    { id: 'reviews', label: 'Đánh giá', icon: FileText },
    { id: 'users', label: 'Người dùng', icon: UserCircle },
    { id: 'reports', label: 'Báo cáo', icon: BarChart3 },
  ];

  const borrowerMenuItems = [
    { id: 'browse', label: 'Trang chủ', icon: BookOpen },
    { id: 'my-loans', label: 'Phiếu mượn của tôi', icon: BookMarked },
    { id: 'my-reviews', label: 'Đánh giá của tôi', icon: FileText },
    { id: 'favorites', label: 'Sách yêu thích', icon: Heart },
    { id: 'profile', label: 'Hồ sơ', icon: UserCircle },
  ];

  const menuItems = user?.role === 'manager' ? managerMenuItems : borrowerMenuItems;

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col h-screen">
      <div className="p-4 border-b border-slate-700 flex-shrink-0">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
          LibraryHub
        </h1>
        <p className="text-xs text-slate-400 mt-1">{user?.role === 'manager' ? 'Cổng quản lý' : 'Cổng thành viên'}</p>
      </div>

      <nav className="flex-1 px-3 py-3 overflow-hidden flex flex-col">
        <div className="space-y-1 overflow-y-auto scrollbar-hide flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <motion.button
                key={item.id}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium truncate">{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </nav>

      <div className="p-3 border-t border-slate-700 flex-shrink-0 space-y-3">
        <div className="px-2">
          <p className="text-xs text-slate-400">Đăng nhập với tư cách</p>
          <p className="text-white font-medium text-sm truncate">{user?.name}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium truncate">Đăng xuất</span>
        </motion.button>
      </div>
    </aside>
  );
}
