import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import PortfolioPage from './pages/PortfolioPage';
import ChatPage from './pages/ChatPage';
import ChartsPage from './pages/ChartsPage';
import AuthPage from './pages/AuthPage';
import SettingsPage from './pages/SettingsPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/chat" element={<ChatPage />} />
                {/* Sidebar Navigation Routes */}
                <Route path="/markets" element={<ChartsPage />} />
                <Route path="/portfolio" element={<PortfolioPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/charts" element={<ChartsPage />} />
            </Routes>
        </Router>
    );
}

export default App;
