import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import RouteSearchPage from './pages/RouteSearchPage';
import MainMapPage from './pages/MainMapPage';
import MyPage from './pages/MyPage';
import CommunityPage from './pages/CommunityPage';
import PostCreatePage from './pages/PostCreatePage';
import Navigation from './components/Navigation';

// 인증 필요한 라우트 보호 컴포넌트
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// 기본 레이아웃 (네비게이션 바 포함)
function Layout() {
  return (
    <>
      <Navigation />
      <Outlet />
    </>
  );
}

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        {/* 로그인/회원가입 (단독 페이지) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* 메인 레이아웃 적용 */}
        <Route element={<Layout />}>
          {/* 공개 라우트 (로그인 없이 접근 가능) */}
          <Route path="/" element={<MainMapPage />} />
          <Route path="/route-search" element={<RouteSearchPage />} />
          <Route path="/community" element={<CommunityPage />} />

          {/* 보호된 라우트 (로그인 필수) */}
          <Route
            path="/my-page"
            element={
              <ProtectedRoute>
                <MyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/community/create"
            element={
              <ProtectedRoute>
                <PostCreatePage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;