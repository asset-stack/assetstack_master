import Analytics from './pages/Analytics';
import Dashboard from './pages/Dashboard';
import Equipment from './pages/Equipment';
import MLModels from './pages/MLModels';
import Maintenance from './pages/Maintenance';
import Predictions from './pages/Predictions';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Analytics": Analytics,
    "Dashboard": Dashboard,
    "Equipment": Equipment,
    "MLModels": MLModels,
    "Maintenance": Maintenance,
    "Predictions": Predictions,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};