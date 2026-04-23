import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import ProposalBuilder from "./pages/ProposalBuilder";
import ProposalPreview from "./pages/ProposalPreview";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/AdminDashboard";
import Pricing from "./pages/Pricing";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Landing} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/builder"} component={ProposalBuilder} />
      <Route path={"/builder/:id"} component={ProposalBuilder} />
      <Route path={"/proposal/:id"} component={ProposalPreview} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/pricing"} component={Pricing} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
