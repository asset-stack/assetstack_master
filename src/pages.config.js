import Dashboard from './pages/Dashboard';
import Equipment from './pages/Equipment';
import Maintenance from './pages/Maintenance';
import Analytics from './pages/Analytics';
import Predictions from './pages/Predictions';
import MLModels from './pages/MLModels';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Equipment": Equipment,
    "Maintenance": Maintenance,
    "Analytics": Analytics,
    "Predictions": Predictions,
    "MLModels": MLModels,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};