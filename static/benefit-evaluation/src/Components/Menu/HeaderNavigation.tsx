import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAppContext } from "../../Contexts/AppContext";
import {
  AtlassianNavigation,
  Help,
  PrimaryButton,
  Settings,
} from "@atlaskit/atlassian-navigation";
import { Box, Flex, xcss } from "@atlaskit/primitives";
import { useAPI } from "../../Contexts/ApiContext";
import { SpotlightTarget } from "@atlaskit/onboarding";
import { useTranslation } from "@forge/react";
import { view } from "@forge/bridge";
import GlobeIcon from "@atlaskit/icon/core/globe";
import Button from "@atlaskit/button";
import Tooltip from "@atlaskit/tooltip";
import Popup from "@atlaskit/popup";
import { MenuGroup, Section, ButtonItem } from "@atlaskit/menu";

type ForgeSupportedLocaleCode = "no-NO" | "en-US" | string;

export const HeaderNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState<string>();
  const [isLangPopupOpen, setIsLangPopupOpen] = useState(false);
  const [scope] = useAppContext();
  const api = useAPI();

  const { t } = useTranslation();
  const [currentLocale, setCurrentLocale] =
    useState<ForgeSupportedLocaleCode>("no-NO");

  useEffect(() => {
    view.getContext().then((context) => {
      if (context.locale) {
        setCurrentLocale(context.locale as ForgeSupportedLocaleCode);
      }
    });
  }, []);

  const handleLanguageChange = (newLocale: ForgeSupportedLocaleCode) => {
    setCurrentLocale(newLocale);
    setIsLangPopupOpen(false);
    const event = new CustomEvent("languageChange", { detail: newLocale });
    window.dispatchEvent(event);
  };

  useEffect(() => {
    const scopeLocation = location.pathname.replaceAll("/", "");
    const index = tabLinks.find((tabLink) =>
      scopeLocation.includes(tabLink.src)
    );
    setSelectedTab(index?.id);
  }, [location, t]);

  const tabLinks = [
    {
      name: t("nav.goal_structure"),
      src: "goal-structure",
      id: "goal-structure",
    },
    {
      name: t("nav.estimation"),
      src: "estimation",
      id: "estimation",
    },
    ...(!location.pathname.includes("portfolio/pf")
      ? [{ name: t("nav.analysis"), src: "analysis", id: "analysis" }]
      : []),
  ];

  const LanguageDropdown = () => (
    <Popup
      isOpen={isLangPopupOpen}
      onClose={() => setIsLangPopupOpen(false)}
      placement="bottom-end"
      content={() => (
        <Box xcss={xcss({ minWidth: "150px", padding: "space.100" })}>
          <MenuGroup>
            <Section title={t("nav.language_tooltip")}>
              <ButtonItem
                isSelected={currentLocale === "no-NO"}
                onClick={() => handleLanguageChange("no-NO")}
              >
                Norsk (bokmål)
              </ButtonItem>
              <ButtonItem
                isSelected={currentLocale === "da-DK"} // Endret fra ny-NO
                onClick={() => handleLanguageChange("da-DK")} // Endret fra ny-NO
              >
                Norsk (nynorsk)
              </ButtonItem>
              <ButtonItem
                isSelected={currentLocale === "en-US"}
                onClick={() => handleLanguageChange("en-US")}
              >
                English
              </ButtonItem>
            </Section>
          </MenuGroup>
        </Box>
      )}
      trigger={(triggerProps) => (
        <Box
          xcss={xcss({
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "32px",
            height: "32px",
          })}
        >
          <Tooltip content={t("nav.language_tooltip")}>
            <Button
              {...triggerProps}
              appearance="subtle"
              spacing="none"
              onClick={() => setIsLangPopupOpen(!isLangPopupOpen)}
              iconBefore={<GlobeIcon label={t("nav.language_tooltip")} />}
            />
          </Tooltip>
        </Box>
      )}
    />
  );

  return (
    <AtlassianNavigation
      label="site"
      renderProductHome={() => null}
      renderHelp={() => (
        <Flex alignItems="center" gap="space.050">
          <LanguageDropdown />
          <SpotlightTarget name="restart-onboarding">
            <Help
              tooltip={t("nav.help_tooltip")}
              onClick={() => {
                api.onboarding.setOnboardingComplete(false).then(() => {
                  navigate("/goal-structure");
                });
              }}
            />
          </SpotlightTarget>
        </Flex>
      )}
      renderSettings={() => (
        <SpotlightTarget name="settings">
          <Settings
            tooltip={t("nav.settings_tooltip")}
            isSelected={
              selectedTab === "settings" ||
              location.pathname.includes("settings")
            }
            onClick={() => navigate("settings")}
          />
        </SpotlightTarget>
      )}
      primaryItems={[
        <Flex
          key="scope"
          alignItems="center"
          xcss={xcss({
            marginLeft: "4px",
            marginRight: "16px",
            color: "color.text.subtle",
          })}
        >
          <Box
            as="h5"
            xcss={xcss({ color: "color.text.accent.blue", fontWeight: "bold" })}
          >
            {scope.name.toUpperCase()}
          </Box>
        </Flex>,
        ...tabLinks.map((tabLink) => (
          <div key={tabLink.id}>
            <SpotlightTarget name={tabLink.id}>
              <PrimaryButton
                isSelected={selectedTab === tabLink.id}
                onClick={() => navigate(tabLink.src)}
              >
                {tabLink.name}
              </PrimaryButton>
            </SpotlightTarget>
          </div>
        )),
      ]}
    />
  );
};
