import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';
import Footer from './components/Footer';
import { ChatProvider } from './context/ChatContext';
import Chatbot from './components/Chatbot';

// Placeholder components
import CourseDetail from './pages/CourseDetail';
import LearningInterface from './pages/LearningInterface';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import SearchResults from './pages/SearchResults';
import CloudInspector from './pages/CloudInspector';
import MyLearning from './pages/MyLearning';
import MobileSimulatorPage from './pages/MobileSimulatorPage';
const Dashboard = () => <div className="p-8 text-2xl">Dashboard</div>;

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const MainLayout = ({ children }) => (
  <>
    {children}
    <Footer />
  </>
);

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Analytics />
            <Routes>
              {/* Standalone Mobile App Simulator - No Footer, Internal Auth */}
              <Route path="/mobile-app" element={<MobileSimulatorPage />} />

              {/* Public Routes with Footer */}
              <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
              <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
              <Route path="/forgot-password" element={<MainLayout><ForgotPassword /></MainLayout>} />
              <Route path="/reset-password/:token" element={<MainLayout><ResetPassword /></MainLayout>} />
              <Route path="/" element={<MainLayout><Home /></MainLayout>} />

              {/* Protected Routes with Footer */}
              <Route path="/course/:id" element={
                <ProtectedRoute>
                  <MainLayout><CourseDetail /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <MainLayout><Dashboard /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <MainLayout><Profile /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <MainLayout><Settings /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/cloud-inspector" element={
                <ProtectedRoute>
                  <MainLayout><CloudInspector /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/search" element={
                <ProtectedRoute>
                  <MainLayout><SearchResults /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/learning/:id" element={
                <ProtectedRoute>
                  <LearningInterface />
                </ProtectedRoute>
              } />
              <Route path="/my-learning" element={
                <ProtectedRoute>
                  <MainLayout><MyLearning /></MainLayout>
                </ProtectedRoute>
              } />
            </Routes>
            <Chatbot />
          </div>
        </Router>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
