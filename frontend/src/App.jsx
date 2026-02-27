import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CopilotLayout from './layouts/CopilotLayout';
import DashboardPage from './pages/dashboard/DashboardPage';
import BrandProfilePage from './pages/BrandProfilePage';
import StrategyPlannerPage from './pages/StrategyPlannerPage';
import ContentGeneratorPage from './pages/ContentGeneratorPage';
import ContentLibraryPage from './pages/ContentLibraryPage';
import EngagementAnalyticsPage from './pages/EngagementAnalyticsPage';
import OptimizationInsightsPage from './pages/OptimizationInsightsPage';
import AlertsPage from './pages/AlertsPage';
import ReportsPage from './pages/ReportsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<CopilotLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/brand" element={<BrandProfilePage />} />
        <Route path="/strategy" element={<StrategyPlannerPage />} />
        <Route path="/generate" element={<ContentGeneratorPage />} />
        <Route path="/library" element={<ContentLibraryPage />} />
        <Route path="/analytics" element={<EngagementAnalyticsPage />} />
        <Route path="/optimization" element={<OptimizationInsightsPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Route>
    </Routes>
  );
}
