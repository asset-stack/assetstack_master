import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { ClientProvider } from '@/lib/ClientContext';
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
import AssetTree from './pages/AssetTree';
import NetworkGlobePage from './pages/NetworkGlobe';
import ScanAnalysisPage from './pages/ScanAnalysis';
import BetaFeatures from './pages/BetaFeatures';
import SavingsLedger from './pages/SavingsLedger';
import SecurityCenter from './pages/SecurityCenter';
import Landing from './pages/Landing';
import Industries from './pages/Industries';
import LandingCompliance from './pages/LandingCompliance.jsx';
import SpareParts from './pages/SpareParts';
import CostCenter from './pages/CostCenter';
import Suppliers from './pages/Suppliers';
import CapitalPlan from './pages/CapitalPlan';
import Valuation from './pages/Valuation';
import DefectBacklog from './pages/DefectBacklog';
import FundingOptimiser from './pages/FundingOptimiser';
import ScenarioModeller from './pages/ScenarioModeller';
import InspectionCycles from './pages/InspectionCycles';
import CohortPerformance from './pages/CohortPerformance';
import FieldSurvey from './pages/FieldSurvey';
import DataQuality from './pages/DataQuality';
import DefectCascade from './pages/DefectCascade';
import ClimateRisk from './pages/ClimateRisk';
import PhotoLibrary from './pages/PhotoLibrary';
import PhotoDiff from './pages/PhotoDiff';
import SavedViews from './pages/SavedViews';
import BulkUpdate from './pages/BulkUpdate';
import PortfolioInsights from './pages/PortfolioInsights';
import Finance from './pages/Finance';
import LocationDetail from './pages/LocationDetail';
import Presentation from './pages/Presentation';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import PrintLanding from './pages/PrintLanding';
import LandingEditor from './pages/LandingEditor';
import ConditionInspector from './pages/ConditionInspector';
import VerifyReports from './pages/VerifyReports';
import SWSCAudit from './pages/SWSCAudit.jsx';
import CompanyProfile from './pages/CompanyProfile.jsx';
import SuperAdminClients from './pages/SuperAdminClients.jsx';
import Brochure from './pages/Brochure.jsx';
import Product from './pages/Product.jsx';
import Solutions from './pages/Solutions.jsx';

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
      {/* Public landing page — no sidebar/layout wrapper */}
      <Route path="/" element={<Landing />} />
      <Route path="/Landing" element={<Landing />} />
      <Route path="/Product" element={<Product />} />
      <Route path="/Solutions" element={<Solutions />} />
      <Route path="/Industries" element={<Industries />} />
      <Route path="/LandingCompliance" element={<LandingCompliance />} />
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
      <Route path="/AssetTree" element={
            <LayoutWrapper currentPageName="AssetTree">
              <AssetTree />
            </LayoutWrapper>
          } />
      <Route path="/NetworkGlobe" element={
            <LayoutWrapper currentPageName="NetworkGlobe">
              <NetworkGlobePage />
            </LayoutWrapper>
          } />
      <Route path="/ScanAnalysis" element={
            <LayoutWrapper currentPageName="ScanAnalysis">
              <ScanAnalysisPage />
            </LayoutWrapper>
          } />
      <Route path="/BetaFeatures" element={
            <LayoutWrapper currentPageName="BetaFeatures">
              <BetaFeatures />
            </LayoutWrapper>
          } />
      <Route path="/SavingsLedger" element={
            <LayoutWrapper currentPageName="SavingsLedger">
              <SavingsLedger />
            </LayoutWrapper>
          } />
      <Route path="/SecurityCenter" element={
            <LayoutWrapper currentPageName="SecurityCenter">
              <SecurityCenter />
            </LayoutWrapper>
          } />
      <Route path="/SpareParts" element={
            <LayoutWrapper currentPageName="SpareParts">
              <SpareParts />
            </LayoutWrapper>
          } />
      <Route path="/CostCenter" element={
            <LayoutWrapper currentPageName="CostCenter">
              <CostCenter />
            </LayoutWrapper>
          } />
      <Route path="/Suppliers" element={
            <LayoutWrapper currentPageName="Suppliers">
              <Suppliers />
            </LayoutWrapper>
          } />
      <Route path="/CapitalPlan" element={
            <LayoutWrapper currentPageName="CapitalPlan">
              <CapitalPlan />
            </LayoutWrapper>
          } />
      <Route path="/Valuation" element={
            <LayoutWrapper currentPageName="Valuation">
              <Valuation />
            </LayoutWrapper>
          } />
      <Route path="/DefectBacklog" element={
            <LayoutWrapper currentPageName="DefectBacklog">
              <DefectBacklog />
            </LayoutWrapper>
          } />
      <Route path="/FundingOptimiser" element={
            <LayoutWrapper currentPageName="FundingOptimiser">
              <FundingOptimiser />
            </LayoutWrapper>
          } />
      <Route path="/ScenarioModeller" element={
            <LayoutWrapper currentPageName="ScenarioModeller">
              <ScenarioModeller />
            </LayoutWrapper>
          } />
      <Route path="/InspectionCycles" element={
            <LayoutWrapper currentPageName="InspectionCycles">
              <InspectionCycles />
            </LayoutWrapper>
          } />
      <Route path="/CohortPerformance" element={
            <LayoutWrapper currentPageName="CohortPerformance">
              <CohortPerformance />
            </LayoutWrapper>
          } />
      <Route path="/FieldSurvey" element={
            <LayoutWrapper currentPageName="FieldSurvey">
              <FieldSurvey />
            </LayoutWrapper>
          } />
      <Route path="/DataQuality" element={
            <LayoutWrapper currentPageName="DataQuality">
              <DataQuality />
            </LayoutWrapper>
          } />
      <Route path="/DefectCascade" element={
            <LayoutWrapper currentPageName="DefectCascade">
              <DefectCascade />
            </LayoutWrapper>
          } />
      <Route path="/ClimateRisk" element={
            <LayoutWrapper currentPageName="ClimateRisk">
              <ClimateRisk />
            </LayoutWrapper>
          } />
      <Route path="/PhotoLibrary" element={
            <LayoutWrapper currentPageName="PhotoLibrary">
              <PhotoLibrary />
            </LayoutWrapper>
          } />
      <Route path="/PhotoDiff" element={
            <LayoutWrapper currentPageName="PhotoDiff">
              <PhotoDiff />
            </LayoutWrapper>
          } />
      <Route path="/SavedViews" element={
            <LayoutWrapper currentPageName="SavedViews">
              <SavedViews />
            </LayoutWrapper>
          } />
      <Route path="/BulkUpdate" element={
            <LayoutWrapper currentPageName="BulkUpdate">
              <BulkUpdate />
            </LayoutWrapper>
          } />
      <Route path="/PortfolioInsights" element={
            <LayoutWrapper currentPageName="PortfolioInsights">
              <PortfolioInsights />
            </LayoutWrapper>
          } />
      <Route path="/Finance" element={
            <LayoutWrapper currentPageName="Finance">
              <Finance />
            </LayoutWrapper>
          } />
      <Route path="/LocationDetail" element={
            <LayoutWrapper currentPageName="Locations">
              <LocationDetail />
            </LayoutWrapper>
          } />
      <Route path="/Presentation" element={<Presentation />} />
      <Route path="/PrintLanding" element={<PrintLanding />} />
      <Route path="/Brochure" element={<Brochure />} />
      <Route path="/LandingEditor" element={
            <LayoutWrapper currentPageName="LandingEditor">
              <LandingEditor />
            </LayoutWrapper>
          } />
      <Route path="/ConditionInspector" element={
            <LayoutWrapper currentPageName="ConditionInspector">
              <ConditionInspector />
            </LayoutWrapper>
          } />
      <Route path="/VerifyReports" element={
            <LayoutWrapper currentPageName="VerifyReports">
              <VerifyReports />
            </LayoutWrapper>
          } />
      <Route path="/SWSCAudit" element={
            <LayoutWrapper currentPageName="SWSCAudit">
              <SWSCAudit />
            </LayoutWrapper>
          } />
      <Route path="/CompanyProfile" element={
            <LayoutWrapper currentPageName="CompanyProfile">
              <CompanyProfile />
            </LayoutWrapper>
          } />
      <Route path="/SuperAdminClients" element={
            <LayoutWrapper currentPageName="SuperAdminClients">
              <SuperAdminClients />
            </LayoutWrapper>
          } />
      <Route path="/Projects" element={
            <LayoutWrapper currentPageName="Projects">
              <Projects />
            </LayoutWrapper>
          } />
      <Route path="/ProjectDetail" element={
            <LayoutWrapper currentPageName="Projects">
              <ProjectDetail />
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
          <ClientProvider>
            <AuthenticatedApp />
          </ClientProvider>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App