import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import About from "@/pages/about";
import Courses from "@/pages/courses";
import Teachers from "@/pages/teachers";
import Contact from "@/pages/contact";
import Admission from "@/pages/admission";
import PrivacyPolicy from "@/pages/privacy";
import TermsOfService from "@/pages/terms";
import FAQ from "@/pages/faq";
import Fees from "@/pages/fees";

const queryClient = new QueryClient();

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location]);
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/courses" component={Courses} />
        <Route path="/teachers" component={Teachers} />
        <Route path="/contact" component={Contact} />
        <Route path="/admission" component={Admission} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/terms" component={TermsOfService} />
        <Route path="/faq" component={FAQ} />
        <Route path="/fees" component={Fees} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
