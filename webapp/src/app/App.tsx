import { AnimatePresence, motion } from 'motion/react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { pages } from '../config/site';
import { Sidebar } from '../shared/layout/Sidebar';
import { DashboardPage } from '../pages/Dashboard';
import { CameraPage } from '../pages/Camera';
import { FamilyPage } from '../pages/Family';
import { ChatPage } from '../pages/Chat';
import { SettingsPage } from '../pages/Settings';
import { AlbumPage } from '../pages/Album';
import { AlbumDetailPage } from '../pages/Album/detail';
import { MemoPage } from '../pages/Memo';
import { EmotionPage } from '../pages/Emotion';
import { LoginPage } from '../pages/Login';
import { AuthProvider, useAuth } from '../shared/context/AuthContext';
import { useState, useCallback } from 'react';

// ─── Page transition ────────────────────────────────────────────────

const pageTransition = {
  duration: 0.3,
  ease: [0.25, 0.46, 0.45, 0.94] as const,
};

// ─── Sidebar width ──────────────────────────────────────────────────

const SIDEBAR_W = { collapsed: 72, expanded: 256 };

// ─── Animated routes ────────────────────────────────────────────────

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        initial={{ opacity: 0, y: 12 }}
        transition={pageTransition}
        className="flex-1 overflow-y-auto sm:pt-[90px] pt-[14px] px-4 py-6 sm:px-6 lg:px-8 pb-20 sm:pb-6"
      >
        <Routes location={location}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/emotion" element={<EmotionPage />} />
          <Route path="/camera" element={<CameraPage />} />
          <Route path="/family" element={<FamilyPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/album" element={<AlbumPage />} />
          <Route path="/album/:id" element={<AlbumDetailPage />} />
          <Route path="/memo" element={<MemoPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/:tab" element={<SettingsPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Page header ────────────────────────────────────────────────────

function PageHeader() {
  const { pathname } = useLocation();
  const item = pages.find((p) => p.path === pathname || (p.path !== '/' && pathname.startsWith(p.path)));
  if (!item) return null;
  return (
    <motion.div
      key={item.id}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      initial={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex items-center justify-between"
    >
      <p className="text-sm text-neutral-600">{item.subtitle}</p>
      <div id="page-header-actions" />
    </motion.div>
  );
}

// ─── Main layout ────────────────────────────────────────────────────

function MainLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const handleToggle = useCallback((v: boolean) => {
    setCollapsed(v);
    localStorage.setItem('sidebar_collapsed', String(v));
  }, []);

  const sidebarWidth = collapsed ? SIDEBAR_W.collapsed : SIDEBAR_W.expanded;

  return (
    <div className="h-screen bg-neutral-50 flex flex-col overflow-hidden">
      <Sidebar
        brand="智能管家"
        collapsed={collapsed}
        items={pages}
        onToggle={handleToggle}
      />
      <main
        className="sm:pl-[var(--sidebar-w)] flex-1 flex flex-col overflow-hidden transition-all duration-300"
        style={{ '--sidebar-w': `${sidebarWidth}px` } as React.CSSProperties}
      >
        <header className="hidden sm:block fixed top-0 right-0 z-30 sm:left-[var(--sidebar-w)] border-b border-neutral-200/50 bg-white/70 backdrop-blur-lg px-4 py-4 sm:px-6 lg:px-8 transition-all duration-300">
          <PageHeader />
        </header>
        <AnimatedRoutes />
      </main>
    </div>
  );
}

// ─── App ────────────────────────────────────────────────────────────

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-50">
        <p className="text-neutral-400">加载中...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <MainLayout />;
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
