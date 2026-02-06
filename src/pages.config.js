/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Analytics from './pages/Analytics';
import Dashboard from './pages/Dashboard';
import Depreciation from './pages/Depreciation';
import DigitalTwin from './pages/DigitalTwin';
import Equipment from './pages/Equipment';
import MLModels from './pages/MLModels';
import Maintenance from './pages/Maintenance';
import MaintenancePlanning from './pages/MaintenancePlanning';
import MobileChecklist from './pages/MobileChecklist';
import Onboarding from './pages/Onboarding';
import Predictions from './pages/Predictions';
import Reports from './pages/Reports';
import SensorIntegration from './pages/SensorIntegration';
import MyProfile from './pages/MyProfile';
import TeamDirectory from './pages/TeamDirectory';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Analytics": Analytics,
    "Dashboard": Dashboard,
    "Depreciation": Depreciation,
    "DigitalTwin": DigitalTwin,
    "Equipment": Equipment,
    "MLModels": MLModels,
    "Maintenance": Maintenance,
    "MaintenancePlanning": MaintenancePlanning,
    "MobileChecklist": MobileChecklist,
    "Onboarding": Onboarding,
    "Predictions": Predictions,
    "Reports": Reports,
    "SensorIntegration": SensorIntegration,
    "MyProfile": MyProfile,
    "TeamDirectory": TeamDirectory,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};