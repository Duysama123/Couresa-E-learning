import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
const Dashboard = () => <div className="p-8 text-2xl">Dashboard</div>;

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              {/* Public Home Page */}
              <Route path="/" element={<Home />} />

              <Route path="/course/:id" element={
                <ProtectedRoute>
                  <CourseDetail />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/cloud-inspector" element={
                <ProtectedRoute>
                  <CloudInspector />
                </ProtectedRoute>
              } />
              <Route path="/search" element={
                <ProtectedRoute>
                  <SearchResults />
                </ProtectedRoute>
              } />
              <Route path="/learning/:id" element={
                <ProtectedRoute>
                  <LearningInterface />
                </ProtectedRoute>
              } />
              <Route path="/my-learning" element={
                <ProtectedRoute>
                  <MyLearning />
                </ProtectedRoute>
              } />
            </Routes>
            <Footer />
            <Chatbot />
          </div>
        </Router>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
