import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AIAssistant from './pages/AIAssistant';
import Locations from './pages/Locations';
import RoleManagement from './pages/RoleManagement';
import JobBoard from './pages/JobBoard';
import ContractorPortal from './pages/ContractorPortal';
import SetupGuide from './pages/SetupGuide';
import DataImport from './pages/DataImport';
import Settings from './pages/Settings';
import CommandCenter from './pages/CommandCenter';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName="CommandCenter">
          <CommandCenter />
        </LayoutWrapper>
      } />
      <Route path="/CommandCenter" element={
        <LayoutWrapper currentPageName="CommandCenter">
          <CommandCenter />
        </LayoutWrapper>
      } />
      <Route path="/Dashboard" element={
        <LayoutWrapper currentPageName="Dashboard">
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="/AIAssistant" element={
            <LayoutWrapper currentPageName="AIAssistant">
              <AIAssistant />
            </LayoutWrapper>
          } />
      <Route path="/Locations" element={
            <LayoutWrapper currentPageName="Locations">
              <Locations />
            </LayoutWrapper>
          } />
      <Route path="/RoleManagement" element={
            <LayoutWrapper currentPageName="RoleManagement">
              <RoleManagement />
            </LayoutWrapper>
          } />
      <Route path="/JobBoard" element={
            <LayoutWrapper currentPageName="JobBoard">
              <JobBoard />
            </LayoutWrapper>
          } />
      <Route path="/ContractorPortal" element={
            <LayoutWrapper currentPageName="ContractorPortal">
              <ContractorPortal />
            </LayoutWrapper>
          } />
      <Route path="/SetupGuide" element={
            <LayoutWrapper currentPageName="SetupGuide">
              <SetupGuide />
            </LayoutWrapper>
          } />
      <Route path="/DataImport" element={
            <LayoutWrapper currentPageName="DataImport">
              <DataImport />
            </LayoutWrapper>
          } />
      <Route path="/Settings" element={
            <LayoutWrapper currentPageName="Settings">
              <Settings />
            </LayoutWrapper>
          } />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App