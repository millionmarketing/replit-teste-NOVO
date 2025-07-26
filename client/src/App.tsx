import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import Dashboard from "@/pages/dashboard";
import Messages from "@/pages/messages";
import Agents from "@/pages/agents";
import Contacts from "@/pages/contacts";
import Analytics from "@/pages/analytics";
import Reporting from "@/pages/reporting";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/messages" component={Messages} />
      <Route path="/agents" component={Agents} />
      <Route path="/contacts" component={Contacts} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/reporting" component={Reporting} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark min-h-screen bg-background text-foreground">
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Topbar />
              <main className="flex-1 overflow-auto">
                <Router />
              </main>
            </div>
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
