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
import { useTranslation } from "@forge/react";

export const Nav = () => {
  const { t } = useTranslation();
  const [project, setProject] = useState<ScopeType>();
  const [portfolios, setPortfolios] = useState<Portfolio[]>();
  const [createPortfolioOpen, setCreatePortfolioOpen] =
    useState<boolean>(false);

  const navigation = useNavigate();
  const location = useLocation();
  const api = useAPI();
  const endpoint = location.pathname.split("/").at(-1);

  const { scopeId } = useParams();

  const refetch = () => {
    setPortfolios(undefined);
    api.portfolio
      .getAll()
      .then((response) => {
        setPortfolios(response);
      })
      .catch((error) => {
        console.error(error);
        setPortfolios([]);
      });
    view.getContext().then((context) => {
      api.project
        .get(context.extension.project.id)
        .then((project) => {
          if (project) {
            setProject({
              type: ScopeTypeEnum.PROJECT,
              id: project.id,
              name: project.name,
            });
          }
        })
        .catch((error) => {
          console.error(error);
        });
    });
  };

  useEffect(() => {
    refetch();
  }, []);

  const portfolioButtons = () => {
    if (portfolios) {
      return portfolios.map((portfolio) => (
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
      ));
    } else {
      return <SkeletonItem hasIcon isShimmering />;
    }
  };

  return (
    <Box xcss={xcss({ zIndex: "layer", height: "100%" })}>
      <LeftSidebar isFixed={true}>
        <SideNavigation label="project">
          <NavigationHeader>
            <Header description={t("nav_sidebar.header_description")}>
              BenefitOKR
            </Header>
          </NavigationHeader>
          <NestableNavigationContent>
            <SpotlightTarget name="project">
              <Section hasSeparator title={t("nav_sidebar.project_section")}>
                {project ? (
                  <ButtonItem
                    iconBefore={<PageIcon label="" />}
                    isSelected={
                      scopeId === project.id && endpoint !== "introduction"
                    }
                    onClick={() => {
                      navigation(`../project/${project.id}/`);
                    }}
                  >
                    {project.name}
                  </ButtonItem>
                ) : (
                  <SkeletonItem hasIcon isShimmering />
                )}
              </Section>
            </SpotlightTarget>
            <SpotlightTarget name="introduction-and-help">
              <Section title={t("nav_sidebar.introduction_section")}>
                <ButtonItem
                  isSelected={endpoint === "introduction"}
                  onClick={() => {
                    navigation("introduction");
                  }}
                >
                  {t("nav_sidebar.introduction_item")}
                </ButtonItem>
              </Section>
            </SpotlightTarget>
          </NestableNavigationContent>
          <NavigationFooter>
            <></>
          </NavigationFooter>
        </SideNavigation>
        {createPortfolioOpen && (
          <AdminPortfolio
            mode={"create"}
            onClose={() => {
              setCreatePortfolioOpen(false);
              refetch();
            }}
          />
        )}
      </LeftSidebar>
    </Box>
  );
};
