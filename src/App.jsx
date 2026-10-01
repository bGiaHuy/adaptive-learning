import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import RegisterPage from './components/RegisterPage';
import LoadingScreen from './components/LoadingScreen';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import EnglishHub from './components/EnglishHub';
import EnglishImportView from './components/EnglishImportView';
import EnglishPlacementView from './components/EnglishPlacementView';
import EnglishTeacherView from './components/EnglishTeacherView';
import EnglishStudentClassView from './components/EnglishStudentClassView';
import OnboardingWizard from './components/OnboardingWizard';
import DiagnosticTest from './components/DiagnosticTest';
import ProfileCompetencyView from './components/ProfileCompetencyView';
import LearningPathView from './components/LearningPathView';
import MistakeNotebookView from './components/MistakeNotebookView';
import ClassroomView from './components/ClassroomView';
import MissionsView from './components/MissionsView';
import SessionManagementModal from './components/SessionManagementModal';
import TeacherPendingView from './components/TeacherPendingView';
import TeacherClassroomsView from './components/TeacherClassroomsView';
import AdminPortalView from './components/AdminPortalView';
import NotFoundView from './components/NotFoundView';
import LegalNoticeModal from './components/LegalNoticeModal';
import ChangePasswordModal from './components/ChangePasswordModal';
import { authApi, studentApi } from './lib/apiClient';

export default function App() {
  const isUnknownUrl = () => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    return (path !== '/' && path !== '/index.html') || (hash && hash !== '#' && hash !== '#/');
  };
  const [unknownUrl, setUnknownUrl] = useState(isUnknownUrl);

  useEffect(() => {
    const syncUrl = () => setUnknownUrl(isUnknownUrl());
    window.addEventListener('hashchange', syncUrl);
    window.addEventListener('popstate', syncUrl);
    return () => {
      window.removeEventListener('hashchange', syncUrl);
      window.removeEventListener('popstate', syncUrl);
    };
  }, []);
  // Navigation & User State
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'register' | 'loading' | 'app' | 'onboarding'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedEnglishLessonId, setSelectedEnglishLessonId] = useState(null);
  const [authMode, setAuthMode] = useState('signup');
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Authenticated User State (Server-backed only)
  const [currentUser, setCurrentUser] = useState(null);

  // Student Data (fetched from API)
  const [userProfile, setUserProfile] = useState(null);
  const [hasCompletedTest, setHasCompletedTest] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [mistakesList, setMistakesList] = useState([]);
  const [wizardStep, setWizardStep] = useState(1);

  // Helper to determine starting tab by role
  const getDefaultTabForRole = (role) => {
    switch (role) {
      case 'TEACHER_APPLICANT':
        return 'teacher-pending';
      case 'TEACHER':
        return 'teacher-classes';
      case 'ADMIN':
      case 'CONTENT_AUTHOR':
      case 'CONTENT_REVIEWER':
        return 'admin-overview';
      case 'STUDENT':
      default:
        return 'dashboard';
    }
  };

  // Bootstrap session on app mount via GET /auth/me
  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      try {
        const data = await authApi.getMe();
        if (isMounted && data.user) {
          setCurrentUser(data.user);
          setCurrentView('app');
          setActiveTab(getDefaultTabForRole(data.user.role));

          // If student, load student profile from server
          if (data.user.role === 'STUDENT') {
            try {
              const profData = await studentApi.getProfile();
              if (profData.profile) {
                setUserProfile(profData.profile);
              }
              if (profData.stats?.completedAttemptsCount > 0) {
                setHasCompletedTest(true);
              }
            } catch {
              // Non-blocking if profile not yet completed
            }
          }
        }
      } catch {
        // No active session or 401: stay on landing
        if (isMounted) {
          setCurrentUser(null);
        }
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    };

    bootstrapSession();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handler: Start Register or Login
  const handleStartAuth = (mode = 'signup') => {
    setAuthMode(mode);
    setCurrentView('register');
  };

  const leaveUnknownUrl = (destination) => {
    window.history.replaceState(null, '', '/');
    setUnknownUrl(false);
    setCurrentView(destination);
    if (destination === 'app') setActiveTab(getDefaultTabForRole(currentUser?.role));
  };

  // Handler: Complete Auth (from Register/Login screen)
  const handleCompleteAuth = (userData) => {
    setCurrentUser(userData);
    setActiveTab(getDefaultTabForRole(userData?.role));
    setCurrentView('loading');
  };

  // Handler: Loading Screen Finished -> go to role home
  const handleLoadingFinished = () => {
    setCurrentView('app');
    if (currentUser?.role) {
      setActiveTab(getDefaultTabForRole(currentUser.role));
    }
  };

  // Handler: Start Onboarding Wizard
  const handleStartOnboarding = () => {
    setActiveTab('onboarding');
    setWizardStep(1);
  };

  // Handler: Finish Onboarding Wizard
  const handleFinishOnboarding = (profileData) => {
    setUserProfile(profileData);
    setActiveTab('diagnostic');
  };

  // Handler: Finish Diagnostic Test
  const handleFinishTest = (results) => {
    setHasCompletedTest(true);
    setTestResults(results);
    setActiveTab('profile');
  };

  // Handler: Pause / Exit Diagnostic Test
  const handlePauseTest = () => {
    setActiveTab('dashboard');
  };

  // Handler: Logout (clears DB session and cookie)
  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors during logout
    }
    setCurrentUser(null);
    setUserProfile(null);
    setHasCompletedTest(false);
    setTestResults(null);
    setMistakesList([]);
    setCurrentView('landing');
    setActiveTab('dashboard');
  };

  // Helper page title for top navbar
  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'onboarding':
        return 'Thiết lập hồ sơ';
      case 'dashboard':
        return 'Khám phá tiếng Anh';
      case 'listening':
        return 'Luyện nghe';
      case 'admin-english':
        return 'Nội dung tiếng Anh';
      case 'profile':
        return 'Hồ sơ năng lực';
      case 'learning-path':
        return 'Lộ trình học cá nhân';
      case 'diagnostic':
        return 'Kiểm tra đầu vào tiếng Anh';
      case 'missions':
        return 'Nhiệm vụ số';
      case 'mistakes':
        return 'Sổ tay lỗi sai';
      case 'classroom':
        return 'Lớp học của em';
      case 'teacher-pending':
        return 'Hồ sơ giáo viên chờ duyệt';
      case 'teacher-classes':
        return 'Lớp học tiếng Anh';
      case 'teacher-analytics':
        return 'Báo cáo & Can thiệp sư phạm';
      case 'admin-overview':
        return 'Tổng quan hệ thống';
      case 'admin-applicants':
        return 'Duyệt giáo viên ứng tuyển';
      case 'admin-questions':
        return 'Ngân hàng câu hỏi (Maker-Checker)';
      case 'admin-audit':
        return 'Nhật ký kiểm toán hệ thống';
      default:
        return 'Adaptive Learning';
    }
  };

  // Bootstrapping Splash
  if (isBootstrapping) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f4f0e7',
          color: '#0f172a',
          fontFamily: 'serif'
        }}
      >
        <div style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '12px' }}>
          ◉ Adaptive Learning
        </div>
        <div style={{ fontSize: '0.9rem', color: '#64748b', fontFamily: 'sans-serif' }}>
          Đang khôi phục phiên bảo mật...
        </div>
      </div>
    );
  }

  if (unknownUrl) {
    return (
      <NotFoundView
        isLoggedIn={Boolean(currentUser)}
        onNavigateHome={() => leaveUnknownUrl('landing')}
        onNavigateDashboard={() => leaveUnknownUrl('app')}
      />
    );
  }

  // Render Public Screens
  if (currentView === 'landing') {
    return (
      <>
        <LandingPage
          onStartRegistration={() => handleStartAuth('signup')}
          onLogin={() => handleStartAuth('login')}
          onOpenLegal={() => setShowLegalModal(true)}
        />
        <LegalNoticeModal
          isOpen={showLegalModal}
          onClose={() => setShowLegalModal(false)}
        />
      </>
    );
  }

  if (currentView === 'register') {
    return (
      <RegisterPage
        initialMode={authMode}
        onCompleteRegistration={handleCompleteAuth}
        onNavigateHome={() => setCurrentView('landing')}
      />
    );
  }

  if (currentView === 'loading') {
    return <LoadingScreen onFinished={handleLoadingFinished} />;
  }

  if (currentView !== 'app') {
    return (
      <NotFoundView
        isLoggedIn={Boolean(currentUser)}
        onNavigateHome={() => setCurrentView('landing')}
        onNavigateDashboard={() => {
          setCurrentView('app');
          setActiveTab('dashboard');
        }}
      />
    );
  }

  const role = currentUser?.role || 'STUDENT';

  // Role Shell Guards
  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab === 'onboarding' ? 'dashboard' : activeTab}
        onSelectTab={(tabId) => { setSelectedEnglishLessonId(null); setActiveTab(tabId); }}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenSessions={() => setShowSessionModal(true)}
        onOpenLegal={() => setShowLegalModal(true)}
        onOpenChangePassword={() => setShowPasswordModal(true)}
        progress={activeTab === 'onboarding' ? { step: wizardStep, total: 8 } : null}
      />

      <div className="main-content-area">
        <main className="tab-viewport">
          {/* TEACHER APPLICANT VIEW */}
          {role === 'TEACHER_APPLICANT' && (
            <TeacherPendingView
              currentUser={currentUser}
              onRefreshUser={(updated) => setCurrentUser(updated)}
            />
          )}

          {/* VERIFIED TEACHER VIEWS */}
          {role === 'TEACHER' && (
            <EnglishTeacherView currentUser={currentUser} />
          )}

          {/* ADMIN & CONTENT VIEWS */}
          {(role === 'ADMIN' || role === 'CONTENT_AUTHOR' || role === 'CONTENT_REVIEWER') && (
            activeTab === 'admin-english' ? <EnglishImportView currentUser={currentUser} /> : <AdminPortalView
              currentUser={currentUser}
              defaultTab={
                activeTab === 'admin-applicants'
                  ? 'applicants'
                  : activeTab === 'admin-questions'
                  ? 'questions'
                  : activeTab === 'admin-audit'
                  ? 'audit'
                  : 'overview'
              }
            />
          )}

          {/* STUDENT VIEWS */}
          {role === 'STUDENT' && (
            <>
              {activeTab === 'onboarding' && (
                <OnboardingWizard
                  currentUser={currentUser}
                  onComplete={handleFinishOnboarding}
                  onCancel={() => setActiveTab('dashboard')}
                  onStepChange={(step) => setWizardStep(step)}
                />
              )}

              {activeTab === 'dashboard' && (
                <EnglishHub view="explore" currentUser={currentUser} initialLessonId={selectedEnglishLessonId} />
              )}

              {activeTab === 'listening' && <EnglishHub view="listening" currentUser={currentUser} />}

              {activeTab === 'profile' && (
                <ProfileCompetencyView
                  hasCompletedTest={hasCompletedTest}
                  testResults={testResults}
                  onStartDiagnostic={() => setActiveTab('diagnostic')}
                />
              )}

              {activeTab === 'learning-path' && (
                <EnglishHub view="progress" currentUser={currentUser} />
              )}

              {activeTab === 'diagnostic' && (
                <EnglishPlacementView onExplore={() => setActiveTab('dashboard')} />
              )}

              {activeTab === 'missions' && (
                <MissionsView
                  onStartDiagnostic={() => setActiveTab('diagnostic')}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}

              {activeTab === 'mistakes' && (
                <MistakeNotebookView
                  mistakes={mistakesList}
                  onStartPractice={() => setActiveTab('diagnostic')}
                />
              )}

              {activeTab === 'classroom' && <EnglishStudentClassView onOpenLesson={(lessonId) => { setSelectedEnglishLessonId(lessonId); setActiveTab('dashboard'); }} />}

              {!['onboarding', 'dashboard', 'listening', 'profile', 'learning-path', 'diagnostic', 'missions', 'mistakes', 'classroom'].includes(activeTab) && (
                <NotFoundView
                  isLoggedIn={true}
                  onNavigateDashboard={() => setActiveTab('dashboard')}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Session Management Modal */}
      <SessionManagementModal
        isOpen={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        onSessionRevoked={handleLogout}
      />

      {/* Legal & Privacy Policy Modal (Draft Gate 0 D-02) */}
      <LegalNoticeModal
        isOpen={showLegalModal}
        onClose={() => setShowLegalModal(false)}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
}
