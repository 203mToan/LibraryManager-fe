import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

import ManagerDashboard from './pages/manager/ManagerDashboard';
import BooksManagement from './pages/manager/BooksManagement';
import AuthorsManagement from './pages/manager/AuthorsManagement';
import LoansManagement from './pages/manager/LoansManagement';

import BrowseBooks from './pages/borrower/BrowseBooks';
import MyLoans from './pages/borrower/MyLoans';
import CategorieManagement from './pages/manager/CategorieManagement';
import ReviewManagement from './pages/manager/ReviewManagement';
import UserManagement from './pages/manager/UserManagement';

function MainApp() {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState(
    user?.role === 'manager' ? 'dashboard' : 'browse'
  );
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return authMode === 'login' ? (
      <LoginPage onSwitchToRegister={() => setAuthMode('register')} />
    ) : (
      <RegisterPage onSwitchToLogin={() => setAuthMode('login')} />
    );
  }

  const renderView = () => {
    if (user.role === 'manager') {
      switch (currentView) {
        case 'dashboard':
          return <ManagerDashboard />;
        case 'books':
          return <BooksManagement />;
        case 'authors':
          return <AuthorsManagement />;
        case 'loans':
          return <LoansManagement />;
        case 'categories':
          return <CategorieManagement />;
        case 'reviews':
          return <ReviewManagement />;
        case 'users':
          return <UserManagement />;
        case 'reports':
          return (
            <div className="p-6">
              <h1 className="text-3xl font-bold">Báo cáo và thống kê</h1>
              <p className="text-gray-600 mt-2">Xem thống kê thư viện (Sắp ra mắt)</p>
            </div>
          );
        default:
          return <ManagerDashboard />;
      }
    } else {
      switch (currentView) {
        case 'browse':
          return <BrowseBooks />;
        case 'my-loans':
          return <MyLoans />;
        case 'my-reviews':
          return (
            <div className="p-6">
              <h1 className="text-3xl font-bold">Đánh giá của tôi</h1>
              <p className="text-gray-600 mt-2">Quản lý đánh giá sách của bạn (Sắp ra mắt)</p>
            </div>
          );
        case 'profile':
          return (
            <div className="p-6">
              <h1 className="text-3xl font-bold">Hồ sơ của tôi</h1>
              <p className="text-gray-600 mt-2">Cập nhật cài đặt hồ sơ của bạn (Sắp ra mắt)</p>
            </div>
          );
        default:
          return <BrowseBooks />;
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
