import Dashboard from './pages/Dashboard';
import Equipment from './pages/Equipment';
import Maintenance from './pages/Maintenance';
import Analytics from './pages/Analytics';
import Predictions from './pages/Predictions';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Equipment": Equipment,
    "Maintenance": Maintenance,
    "Analytics": Analytics,
    "Predictions": Predictions,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};