import Dashboard from './pages/Dashboard';
import Equipment from './pages/Equipment';
import Maintenance from './pages/Maintenance';
import Analytics from './pages/Analytics';


export const PAGES = {
    "Dashboard": Dashboard,
    "Equipment": Equipment,
    "Maintenance": Maintenance,
    "Analytics": Analytics,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
};