import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

// Common Components
import Header from './components/common/Header.jsx';
import Footer from './components/common/Footer.jsx';
import CommandPalette from './components/common/CommandPalette.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';

// Public Pages
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import SchemeCatalogPage from './pages/SchemeCatalogPage.jsx';
import DemoHubPage from './pages/DemoHubPage.jsx';
import PrivacySecurityPage from './pages/PrivacySecurityPage.jsx';

// Applicant Pages
import ApplicantDashboard from './pages/ApplicantDashboard.jsx';
import ApplicationWizard from './pages/ApplicationWizard.jsx';
import ApplicationDetailPage from './pages/ApplicationDetailPage.jsx';
import DeficiencyResolverPage from './pages/DeficiencyResolverPage.jsx';
import DocumentManagerPage from './pages/DocumentManagerPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import GrievanceHelpPage from './pages/GrievanceHelpPage.jsx';

// Officer & Workflow Pages
import OfficerQueuePage from './pages/OfficerQueuePage.jsx';
import OfficerVerificationPage from './pages/OfficerVerificationPage.jsx';
import SelectionPage from './pages/SelectionPage.jsx';
import FinanceDashboard from './pages/FinanceDashboard.jsx';

// Admin & Governance Pages
import AdminDashboard from './pages/AdminDashboard.jsx';
import SchemeRuleBuilderPage from './pages/SchemeRuleBuilderPage.jsx';
import AuditTrailPage from './pages/AuditTrailPage.jsx';

// 404 Page
import NotFoundPage from './pages/NotFoundPage.jsx';

function App() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Global Accessibility & Navigation Header */}
      <Header onOpenSearch={() => setCommandPaletteOpen(true)} />

      {/* Quick Search Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        <Routes>
          {/* Public & Scheme Discovery Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/schemes" element={<SchemeCatalogPage />} />
          <Route path="/demo" element={<DemoHubPage />} />
          <Route path="/privacy" element={<PrivacySecurityPage />} />

          {/* Applicant Portal (Role Protected) */}
          <Route
            path="/applicant/dashboard"
            element={
              <ProtectedRoute allowedRoles={['APPLICANT', 'ADMIN', 'SUPER_ADMIN']}>
                <ApplicantDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applicant/application/new"
            element={
              <ProtectedRoute allowedRoles={['APPLICANT', 'ADMIN', 'SUPER_ADMIN']}>
                <ApplicationWizard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applicant/application/:id"
            element={
              <ProtectedRoute>
                <ApplicationDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applicant/deficiencies"
            element={
              <ProtectedRoute allowedRoles={['APPLICANT', 'ADMIN', 'SUPER_ADMIN']}>
                <DeficiencyResolverPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applicant/documents"
            element={
              <ProtectedRoute allowedRoles={['APPLICANT', 'ADMIN', 'SUPER_ADMIN']}>
                <DocumentManagerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applicant/profile"
            element={
              <ProtectedRoute allowedRoles={['APPLICANT', 'ADMIN', 'SUPER_ADMIN']}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applicant/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applicant/help"
            element={
              <ProtectedRoute>
                <GrievanceHelpPage />
              </ProtectedRoute>
            }
          />

          {/* Verification & Scrutiny Officer Workflows */}
          <Route
            path="/officer/queue"
            element={
              <ProtectedRoute
                allowedRoles={[
                  'VERIFICATION_OFFICER',
                  'SCRUTINY_OFFICER',
                  'ADMIN',
                  'SUPER_ADMIN',
                ]}
              >
                <OfficerQueuePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/verify/:id"
            element={
              <ProtectedRoute
                allowedRoles={[
                  'VERIFICATION_OFFICER',
                  'SCRUTINY_OFFICER',
                  'ADMIN',
                  'SUPER_ADMIN',
                ]}
              >
                <OfficerVerificationPage />
              </ProtectedRoute>
            }
          />

          {/* Selection Board Merit & Sanctions */}
          <Route
            path="/selection"
            element={
              <ProtectedRoute
                allowedRoles={['SELECTION_COMMITTEE', 'ADMIN', 'SUPER_ADMIN']}
              >
                <SelectionPage />
              </ProtectedRoute>
            }
          />

          {/* Finance Division & DBT APBS Disbursals */}
          <Route
            path="/finance"
            element={
              <ProtectedRoute
                allowedRoles={['FINANCE_OFFICER', 'ADMIN', 'SUPER_ADMIN']}
              >
                <FinanceDashboard />
              </ProtectedRoute>
            }
          />

          {/* Administrator, Scheme Rules, and Audit Trail */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/schemes"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                <SchemeRuleBuilderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                <AuditTrailPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Statutory Footer */}
      <Footer />
    </div>
  );
}

export default App;
