import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import RegisterPage from './components/RegisterPage';
import LoadingScreen from './components/LoadingScreen';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import OnboardingWizard from './components/OnboardingWizard';
import DiagnosticTest from './components/DiagnosticTest';
import ProfileCompetencyView from './components/ProfileCompetencyView';
import LearningPathView from './components/LearningPathView';
import MistakeNotebookView from './components/MistakeNotebookView';
import ClassroomView from './components/ClassroomView';
import MissionsView from './components/MissionsView';

export default function App() {
  // Navigation & User State
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'register' | 'loading' | 'app' | 'onboarding'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authMode, setAuthMode] = useState('signup');
  
  // User Profile
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('adaptivemath_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Setup Profile (configured in wizard)
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('adaptivemath_profile');
    return saved ? JSON.parse(saved) : null;
  });

  // Diagnostic Test State
  const [hasCompletedTest, setHasCompletedTest] = useState(() => {
    return localStorage.getItem('adaptivemath_test_completed') === 'true';
  });

  const [testResults, setTestResults] = useState(() => {
    const saved = localStorage.getItem('adaptivemath_test_results');
    return saved ? JSON.parse(saved) : null;
  });

  const [mistakesList, setMistakesList] = useState(() => {
    const saved = localStorage.getItem('adaptivemath_mistakes');
    return saved ? JSON.parse(saved) : [];
  });

  const [wizardStep, setWizardStep] = useState(1);

  // Sync to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('adaptivemath_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('adaptivemath_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('adaptivemath_profile', JSON.stringify(userProfile));
    } else {
      localStorage.removeItem('adaptivemath_profile');
    }
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('adaptivemath_test_completed', hasCompletedTest ? 'true' : 'false');
  }, [hasCompletedTest]);

  useEffect(() => {
    if (testResults) {
      localStorage.setItem('adaptivemath_test_results', JSON.stringify(testResults));
    }
  }, [testResults]);

  // Handler: Start Register or Login
  const handleStartAuth = (mode = 'signup') => {
    setAuthMode(mode);
    setCurrentView('register');
  };

  // Handler: Complete Auth (from Register/Login screen)
  const handleCompleteAuth = (userData) => {
    setCurrentUser(userData);
    setCurrentView('loading');
  };

  // Handler: Loading Screen Finished -> go to app dashboard
  const handleLoadingFinished = () => {
    setCurrentView('app');
    setActiveTab('dashboard');
  };

  // Handler: Start Onboarding Wizard
  const handleStartOnboarding = () => {
    setActiveTab('onboarding');
    setWizardStep(1);
  };

  // Handler: Finish Onboarding Wizard
  const handleFinishOnboarding = (profileData) => {
    setUserProfile(profileData);
    // As shown in video, after finishing wizard it enters the diagnostic test
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

  // Handler: Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setUserProfile(null);
    setHasCompletedTest(false);
    setTestResults(null);
    localStorage.clear();
    setCurrentView('landing');
  };

  // Helper page title for top navbar
  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'onboarding':
        return 'Thiết lập hồ sơ';
      case 'dashboard':
        return 'AdaptiveMath';
      case 'profile':
        return 'Hồ sơ năng lực';
      case 'learning-path':
        return 'Lộ trình học';
      case 'diagnostic':
        return 'Kiểm tra đầu vào';
      case 'missions':
        return 'Nhiệm vụ số';
      case 'mistakes':
        return 'Sổ tay lỗi sai';
      case 'classroom':
        return 'Lớp học';
      default:
        return 'AdaptiveMath';
    }
  };

  // Render Workflow Screen
  if (currentView === 'landing') {
    return (
      <LandingPage
        onStartRegistration={() => handleStartAuth('signup')}
        onLogin={() => handleStartAuth('login')}
      />
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

  // Inside Main App with Sidebar
  return (
    <div className="app-container">
      {/* Dark emerald sidebar matching video */}
      <Sidebar
        activeTab={activeTab === 'onboarding' ? 'dashboard' : activeTab}
        onSelectTab={(tabId) => setActiveTab(tabId)}
      />

      <div className="main-content-area">
        {/* Top bar with Breadcrumbs / Title & User Profile */}
        <Navbar
          pageTitle={getHeaderTitle()}
          currentUser={currentUser}
          onLogout={handleLogout}
          progress={activeTab === 'onboarding' ? { step: wizardStep, total: 8 } : null}
        />

        <main className="tab-viewport">
          {activeTab === 'onboarding' && (
            <OnboardingWizard
              currentUser={currentUser}
              onComplete={handleFinishOnboarding}
              onCancel={() => setActiveTab('dashboard')}
              onStepChange={(step) => setWizardStep(step)}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              userProfile={userProfile}
              onStartSetup={handleStartOnboarding}
              onStartDiagnostic={() => setActiveTab('diagnostic')}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileCompetencyView
              hasCompletedTest={hasCompletedTest}
              testResults={testResults}
              onStartDiagnostic={() => setActiveTab('diagnostic')}
            />
          )}

          {activeTab === 'learning-path' && (
            <LearningPathView
              hasCompletedTest={hasCompletedTest}
              userProfile={userProfile}
              onStartDiagnostic={() => setActiveTab('diagnostic')}
            />
          )}

          {activeTab === 'diagnostic' && (
            <DiagnosticTest
              onFinishTest={handleFinishTest}
              onPauseTest={handlePauseTest}
            />
          )}

          {activeTab === 'missions' && (
            <MissionsView
              onStartDiagnostic={() => setActiveTab('diagnostic')}
            />
          )}

          {activeTab === 'mistakes' && (
            <MistakeNotebookView
              mistakes={mistakesList}
              onStartPractice={() => setActiveTab('diagnostic')}
            />
          )}

          {activeTab === 'classroom' && <ClassroomView />}
        </main>
      </div>
    </div>
  );
}
