import Analytics from './pages/Analytics';
import Dashboard from './pages/Dashboard';
import Equipment from './pages/Equipment';
import MLModels from './pages/MLModels';
import Maintenance from './pages/Maintenance';
import Onboarding from './pages/Onboarding';
import Predictions from './pages/Predictions';
import SensorIntegration from './pages/SensorIntegration';
import DigitalTwin from './pages/DigitalTwin';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Analytics": Analytics,
    "Dashboard": Dashboard,
    "Equipment": Equipment,
    "MLModels": MLModels,
    "Maintenance": Maintenance,
    "Onboarding": Onboarding,
    "Predictions": Predictions,
    "SensorIntegration": SensorIntegration,
    "DigitalTwin": DigitalTwin,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};