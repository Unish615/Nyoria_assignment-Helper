import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DevEmailInbox } from './components/DevEmailInbox';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

import { DashboardPage } from './pages/DashboardPage';
import { CreateAssignmentPage } from './pages/CreateAssignmentPage';
import { AssignmentEditorPage } from './pages/AssignmentEditorPage';
import { MyAssignmentsPage } from './pages/MyAssignmentsPage';
import { MySamplesPage } from './pages/MySamplesPage';
import { QuestionGeneratorPage } from './pages/QuestionGeneratorPage';
import { QuestionPapersPage } from './pages/QuestionPapersPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-nyora-500 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Protected User Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/create-assignment" element={<ProtectedRoute><CreateAssignmentPage /></ProtectedRoute>} />
              <Route path="/assignment-editor" element={<ProtectedRoute><AssignmentEditorPage /></ProtectedRoute>} />
              <Route path="/my-assignments" element={<ProtectedRoute><MyAssignmentsPage /></ProtectedRoute>} />
              <Route path="/my-samples" element={<ProtectedRoute><MySamplesPage /></ProtectedRoute>} />
              <Route path="/question-generator" element={<ProtectedRoute><QuestionGeneratorPage /></ProtectedRoute>} />
              <Route path="/question-papers" element={<ProtectedRoute><QuestionPapersPage /></ProtectedRoute>} />
              <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

              {/* Server-Verified Admin Route */}
              <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />

              {/* Catch-all Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <DevEmailInbox />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
