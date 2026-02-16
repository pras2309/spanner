import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layout
import AppShell from './components/layout/AppShell';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CompanyList from './pages/companies/CompanyList';
import CompanyForm from './pages/companies/CompanyForm';
import ContactList from './pages/contacts/ContactList';
import ContactForm from './pages/contacts/ContactForm';
import SegmentList from './pages/segments/SegmentList';
import SegmentForm from './pages/segments/SegmentForm';
import ApprovalQueue from './pages/approval/ApprovalQueue';
import ResearcherWorkbench from './pages/workbench/ResearcherWorkbench';
import CSVUpload from './pages/uploads/CSVUpload';
import UploadResult from './pages/uploads/UploadResult';
import ErrorCorrection from './pages/uploads/ErrorCorrection';
import UserManagement from './pages/users/UserManagement';
import UserForm from './pages/users/UserForm';
import CollateralList from './pages/collaterals/CollateralList';
import SegmentDrilldown from './pages/workbench/SegmentDrilldown';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/companies" element={<CompanyList />} />
              <Route path="/companies/new" element={<CompanyForm />} />
              <Route path="/companies/:id/edit" element={<CompanyForm />} />
              <Route path="/contacts" element={<ContactList />} />
              <Route path="/contacts/new" element={<ContactForm />} />
              <Route path="/contacts/:id/edit" element={<ContactForm />} />
              <Route path="/segments" element={<SegmentList />} />
              <Route path="/segments/new" element={<SegmentForm />} />
              <Route path="/segments/:id/edit" element={<SegmentForm />} />
              <Route path="/approval-queue" element={<ApprovalQueue />} />
              <Route path="/workbench" element={<ResearcherWorkbench />} />
              <Route path="/workbench/segments/:id" element={<SegmentDrilldown />} />
              <Route path="/upload" element={<CSVUpload />} />
              <Route path="/uploads/batches/:id" element={<UploadResult />} />
              <Route path="/uploads/batches/:id/errors" element={<ErrorCorrection />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/users/new" element={<UserForm />} />
              <Route path="/users/:id/edit" element={<UserForm />} />
              <Route path="/collaterals" element={<CollateralList />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
