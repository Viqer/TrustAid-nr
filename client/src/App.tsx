import { Switch, Route } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { Layout } from './components/Layout';

import LandingPage from './pages/LandingPage';
import CampaignDetailPage from './pages/CampaignDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DonorDashboard from './pages/DonorDashboard';
import NgoDashboard from './pages/NgoDashboard';
import AdminPanel from './pages/AdminPanel';
import ProfilePage from './pages/ProfilePage';
import LedgerPage from './pages/LedgerPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Switch>
          <Route path="/" component={LandingPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/ledger" component={LedgerPage} />
          <Route path="/campaign/:id" component={CampaignDetailPage} />
          <Route path="/campaigns/:id" component={CampaignDetailPage} />
          <Route path="/donor-dashboard" component={DonorDashboard} />
          <Route path="/ngo-dashboard" component={NgoDashboard} />
          <Route path="/admin" component={AdminPanel} />
          <Route>
            <div className="flex items-center justify-center min-h-[60vh] text-center px-4">
              <div>
                <h1 className="text-6xl font-display font-bold text-primary mb-4">404</h1>
                <p className="text-xl text-muted-foreground">Page not found.</p>
              </div>
            </div>
          </Route>
        </Switch>
      </Layout>
      <Toaster position="top-center" richColors theme="light" />
    </QueryClientProvider>
  );
}

export default App;
