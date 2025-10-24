import { useEffect, useState } from "react";
import QueuesIcon from "@atlaskit/icon/glyph/queues";
import PageIcon from "@atlaskit/icon/glyph/page";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAPI } from "../../Contexts/ApiContext";
import { view } from "@forge/bridge";
import { ScopeType, ScopeTypeEnum } from "../../Contexts/AppContext";
import { Portfolio } from "../../Models/PortfolioModel";
import {
  ButtonItem,
  Header,
  NavigationFooter,
  NavigationHeader,
  NestableNavigationContent,
  Section,
  SideNavigation,
  SkeletonItem,
} from "@atlaskit/side-navigation";
import { AdminPortfolio } from "../../Pages/Portfolio/AdminPortfolio";
import { Box, xcss } from "@atlaskit/primitives";
import { LeftSidebar } from "@atlaskit/page-layout";
import { SpotlightTarget } from "@atlaskit/onboarding";

export const Nav = () => {
  const [project, setProject] = useState<ScopeType>();
  const [portfolios, setPortfolios] = useState<Portfolio[]>();
  const [createPortfolioOpen, setCreatePortfolioOpen] =
    useState<boolean>(false);

  const navigation = useNavigate();
  const location = useLocation();
  const api = useAPI();
  const endpoint = location.pathname.split("/").at(-1);

  const { scopeId } = useParams();

  const portfolioButtons = () => {
    if (portfolios) {
      const returnItems: JSX.Element[] = [];
      portfolios.map((portfolio) => {
        returnItems.push(
          <ButtonItem
            iconBefore={<QueuesIcon label="" />}
            isSelected={scopeId === portfolio.id && endpoint !== "introduction"}
            key={portfolio.id}
            description={portfolio.description}
            onClick={() => {
              navigation(`../portfolio/${portfolio.id}/`);
            }}
          >
            {portfolio.name}
          </ButtonItem>
        );
      });
      return returnItems;
    } else {
      return <SkeletonItem hasIcon isShimmering />;
    }
  };
  return <Box xcss={xcss({ zIndex: "layer", height: "100%" })}></Box>;
};
