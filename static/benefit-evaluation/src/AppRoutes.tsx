import { Routes, Route } from "react-router-dom";
import { Estimation } from "./Pages/Estimation/Estimation";
import { AddPortfolioItems } from "./Pages/GoalTiers/PortfolioItems/AddPortfolioItems";
import { GoalStructure } from "./Pages/GoalStructure/GoalStructure";
import { Home } from "./Pages/Home";
import { Settings } from "./Pages/Settings/Settings";
import { AppContextProvider } from "./Contexts/AppContext";
import { Disconnect } from "./Pages/GoalTiers/PortfolioItems/Disconnect";
import { Analysis } from "./Pages/Analysis/Analysis";
import { Introduction } from "./Pages/Introduction/Introduction";
import { AdminPortfolio } from "./Pages/Portfolio/AdminPortfolio";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path=":scopeType?/:scopeId?" element={<AppContextProvider />}>
        <Route index element={<Home />} />
        <Route path="goal-structure" element={<GoalStructure />}>
          {/* Portfolio */}
          <Route path=":portfolio_item_id/remove" element={<Disconnect />} />
          <Route path="portfolio-item/add" element={<AddPortfolioItems />} />
        </Route>
        <Route path="estimation" element={<Estimation />} />
        <Route path="analysis" element={<Analysis />} />
        <Route
          path="estimation/:goal_tier_type/:goal_tier_id/:upper_goal_tier_id"
          element={<Estimation />}
        />
        <Route path="settings" element={<Settings />}>
          <Route
            path="edit-portfolio"
            element={<AdminPortfolio mode="edit" />}
          />
        </Route>
        <Route path="introduction" element={<Introduction />} />
      </Route>
    </Routes>
  );
};
