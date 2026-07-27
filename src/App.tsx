import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { StoreBuilder } from "./pages/StoreBuilder";
import { Trends } from "./pages/Trends";
import { SiteAnalyzer } from "./pages/SiteAnalyzer";
import { ProfitCalculator } from "./pages/ProfitCalculator";
import { AdCopy } from "./pages/AdCopy";
import { Saved } from "./pages/Saved";
import { NotFound } from "./pages/NotFound";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/store-builder" element={<StoreBuilder />} />
        <Route path="/trends" element={<Trends />} />
        <Route path="/tools/site-analyzer" element={<SiteAnalyzer />} />
        <Route path="/tools/profit-calculator" element={<ProfitCalculator />} />
        <Route path="/tools/ad-copy" element={<AdCopy />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
