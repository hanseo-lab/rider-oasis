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

// 🔐 인증이 필요한 페이지를 보호하는 컴포넌트
// 로그인이 안 되어 있으면 로그인 페이지로 리다이렉트
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    // replace를 사용하여 뒤로가기 시 다시 튕겨나오지 않도록 함
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// 🔓 이미 로그인한 사용자가 접근하면 안 되는 페이지 (로그인, 회원가입)
// 로그인 상태라면 메인 페이지로 리다이렉트
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// 🧭 기본 레이아웃 (상단 네비게이션 바 포함)
function Layout() {
  return (
    <>
      <Navigation />
      <Outlet />
    </>
  );
}

function App() {
  // 앱 실행 시 로컬 스토리지의 토큰을 확인하여 로그인 상태 복구
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        {/* 1. 로그인/회원가입 (이미 로그인한 사람은 접근 불가) */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          }
        />

        {/* 2. 네비게이션 바가 포함된 레이아웃 */}
        <Route element={<Layout />}>
          {/* ✅ 누구나 접근 가능한 공개 페이지 */}
          <Route path="/" element={<MainMapPage />} />
          <Route path="/route-search" element={<RouteSearchPage />} />
          <Route path="/community" element={<CommunityPage />} />

          {/* 🔒 로그인이 필요한 보호된 페이지 */}
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

        {/* 3. 잘못된 경로 처리 (메인으로 이동) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;