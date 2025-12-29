import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import RouteSearchPage from './pages/RouteSearchPage';
import MainMapPage from './pages/MainMapPage';
import MyPage from './pages/MyPage';
import Navigation from './components/Navigation';

// 인증 필요한 라우트 보호
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    // 앱 시작 시 로컬스토리지에서 인증 정보 복원
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        {/* 공개 라우트 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* 보호된 라우트 */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigation />
            </ProtectedRoute>
          }
        >
          <Route index element={<MainMapPage />} />
          <Route path="route-search" element={<RouteSearchPage />} />
          <Route path="my-page" element={<MyPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
