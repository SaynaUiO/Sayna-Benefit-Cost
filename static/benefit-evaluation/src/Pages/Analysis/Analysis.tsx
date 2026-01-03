import { useEffect, useState, useCallback } from "react";
import PageHeader from "@atlaskit/page-header";
import { Goal } from "../../Models";
import { useAppContext } from "../../Contexts/AppContext";
import { useAPI } from "../../Contexts/ApiContext";
import {
  calculateTotalPeriodization,
  PeriodizationPeriodResult,
} from "./periodizationCalculations";
import Button from "@atlaskit/button";
import CrossIcon from "@atlaskit/icon/glyph/cross";

// Updated imports
import {
  EpicProfileSelections,
  ProfileOption,
  usePeriodizationProfiles,
} from "./periodizationTypes";

import { EpicSelectionTable } from "./EpicSelectionTable";
import { TotalResultsTable } from "./TotalResultsTable";
import { PeriodizationChartContainer } from "./PeriodizationChartContainer";
import { Spotlight, SpotlightTransition } from "@atlaskit/onboarding";

// Import translation hook
import { useTranslation } from "@forge/react";

export const Analysis = () => {
  const { t } = useTranslation();
  const [scope] = useAppContext();
  const api = useAPI();

  // 1. Hook call moved inside the component
  const { benefitProfiles, costProfiles, benefitProfileMap, costProfileMap } =
    usePeriodizationProfiles();

  // --- STATS AND CONTROL ---
  const [epicGoals, setEpicGoals] = useState<Goal[] | null>(null);
  const [profileSelections, setProfileSelections] =
    useState<EpicProfileSelections>({});
  const [periodizationResults, setPeriodizationResults] = useState<
    PeriodizationPeriodResult[]
  >([]);
  const [numberOfPeriods, setNumberOfPeriods] = useState<number>(10);
  const [inputError, setInputError] = useState<string | null>(null);

  const [bpNokFactor, setBpNokFactor] = useState<number>(0.225);
  const [spNokFactor, setSpNokFactor] = useState<number>(0.6);

  const MIN_YEARS = 10;
  const MAX_YEARS = 20;

  // Onboarding control
  const [activeSpotlight, setActiveSpotlight] = useState<null | number>(null);
  const next = () => setActiveSpotlight((activeSpotlight || 0) + 1);
  const back = () => setActiveSpotlight((activeSpotlight || 1) - 1);
  const end = () => {
    api.onboarding.setOnboardingComplete(true);
    setActiveSpotlight(null);
  };

  const incrementYears = useCallback(() => {
    setInputError(null);
    setNumberOfPeriods((prevYears) => Math.min(prevYears + 1, MAX_YEARS));
  }, []);

  const decrementYears = useCallback(() => {
    setInputError(null);
    setNumberOfPeriods((prevYears) => Math.max(prevYears - 1, MIN_YEARS));
  }, []);

  const handleFactorChange = useCallback(
    (factorType: "bp" | "sp", newValue: number) => {
      if (factorType === "bp") {
        setBpNokFactor(newValue);
      } else {
        setSpNokFactor(newValue);
      }
    },
    []
  );

  // --- EFFECTS AND CALCULATIONS ---

  // 1. Calculate periodization
  useEffect(() => {
    if (
      epicGoals &&
      epicGoals.length > 0 &&
      Object.keys(profileSelections).length > 0 &&
      numberOfPeriods >= 1
    ) {
      const results = calculateTotalPeriodization(
        epicGoals,
        profileSelections,
        numberOfPeriods,
        bpNokFactor,
        spNokFactor
      );
      setPeriodizationResults(results);
    }
  }, [epicGoals, profileSelections, numberOfPeriods, bpNokFactor, spNokFactor]);

  // 2. Fetch epic data
  const fetchEpicGoals = useCallback(async () => {
    try {
      const allCollections = await api.goalCollection.getAll(scope.id);
      let allEpics: Goal[] = [];

      for (const collection of allCollections) {
        const epics = await api.goal.getAll(scope.id, collection.id);
        const filtered = epics.filter(
          (goal) => goal.goalCollectionId === "root-epic"
        );
        allEpics = allEpics.concat(filtered);
      }
      setEpicGoals(allEpics);
    } catch (error) {
      console.error("Error fetching epic goals:", error);
    }
  }, [scope.id, api]);

  useEffect(() => {
    fetchEpicGoals();
  }, [fetchEpicGoals]);

  // 3. Handle profile dropdown changes
  const handleProfileChange = useCallback(
    (
      epicId: string,
      type: "bp" | "sp",
      selectedOption: ProfileOption | null
    ) => {
      const keyToUpdate =
        type === "bp" ? "benefitProfileKey" : "costProfileKey";

      // Use localized profiles from the hook
      const value =
        selectedOption?.value ||
        (keyToUpdate === "benefitProfileKey"
          ? benefitProfiles[0]?.value
          : costProfiles[0]?.value);

      setProfileSelections((prevSelections) => ({
        ...prevSelections,
        [epicId]: {
          ...prevSelections[epicId],
          [keyToUpdate]: value,
        },
      }));
    },
    [benefitProfiles, costProfiles] // Added dependencies
  );

  // 4. Set default profiles
  useEffect(() => {
    if (
      epicGoals &&
      Object.keys(profileSelections).length === 0 &&
      benefitProfiles.length > 0
    ) {
      const defaultSelections: EpicProfileSelections = {};
      const defaultBPKey = benefitProfiles[0].value;
      const defaultSPKey = costProfiles[0].value;

      epicGoals.forEach((epic) => {
        defaultSelections[epic.id] = {
          benefitProfileKey: defaultBPKey,
          costProfileKey: defaultSPKey,
        };
      });
      setProfileSelections(defaultSelections);
    }
  }, [epicGoals, profileSelections, benefitProfiles, costProfiles]);

  // 5. Onboarding initialization
  useEffect(() => {
    api.onboarding.isOnboardingComplete().then((completed: boolean) => {
      if (!completed) {
        setActiveSpotlight(0);
      }
    });
  }, [api]);

  const renderActiveSpotlight = () => {
    const spotlights = [
      <Spotlight
        actionsBeforeElement="13/20"
        headingAfterElement={
          <Button
            iconBefore={<CrossIcon size="small" label="end" />}
            appearance="subtle"
            onClick={end}
          />
        }
        actions={[
          { onClick: next, text: t("analysis.onboarding.next") },
          {
            onClick: back,
            text: t("analysis.onboarding.back"),
            appearance: "subtle",
          },
        ]}
        heading={t("analysis.onboarding.epics_table.title")}
        target="first-table"
        key="first-table"
      >
        {t("analysis.onboarding.epics_table.body")}
      </Spotlight>,
      <Spotlight
        actionsBeforeElement="14/20"
        headingAfterElement={
          <Button
            iconBefore={<CrossIcon size="small" label="end" />}
            appearance="subtle"
            onClick={end}
          />
        }
        actions={[
          { onClick: next, text: t("analysis.onboarding.next") },
          {
            onClick: back,
            text: t("analysis.onboarding.back"),
            appearance: "subtle",
          },
        ]}
        heading={t("analysis.onboarding.change_profile.title")}
        target="profile"
        key="profile"
      >
        {t("analysis.onboarding.change_profile.body")}
      </Spotlight>,
      <Spotlight
        actionsBeforeElement="15/20"
        headingAfterElement={
          <Button
            iconBefore={<CrossIcon size="small" label="end" />}
            appearance="subtle"
            onClick={end}
          />
        }
        actions={[
          { onClick: next, text: t("analysis.onboarding.next") },
          {
            onClick: back,
            text: t("analysis.onboarding.back"),
            appearance: "subtle",
          },
        ]}
        heading={t("analysis.onboarding.points_to_nok.title")}
        target="pointsToNok"
        key="pointsToNok"
      >
        {t("analysis.onboarding.points_to_nok.body")}
      </Spotlight>,
      <Spotlight
        actionsBeforeElement="16/20"
        headingAfterElement={
          <Button
            iconBefore={<CrossIcon size="small" label="end" />}
            appearance="subtle"
            onClick={end}
          />
        }
        actions={[
          { onClick: next, text: t("analysis.onboarding.next") },
          {
            onClick: back,
            text: t("analysis.onboarding.back"),
            appearance: "subtle",
          },
        ]}
        heading={t("analysis.onboarding.financial_plan.title")}
        target="second-table"
        key="second-table"
      >
        {t("analysis.onboarding.financial_plan.body")}
      </Spotlight>,
      <Spotlight
        actionsBeforeElement="17/20"
        headingAfterElement={
          <Button
            iconBefore={<CrossIcon size="small" label="end" />}
            appearance="subtle"
            onClick={end}
          />
        }
        actions={[
          { onClick: next, text: t("analysis.onboarding.next") },
          {
            onClick: back,
            text: t("analysis.onboarding.back"),
            appearance: "subtle",
          },
        ]}
        heading={t("analysis.onboarding.adjust_years.title")}
        target="year-tooltip"
        key="year-tooltip"
      >
        {t("analysis.onboarding.adjust_years.body")}
      </Spotlight>,
      <Spotlight
        actionsBeforeElement="18/20"
        headingAfterElement={
          <Button
            iconBefore={<CrossIcon size="small" label="end" />}
            appearance="subtle"
            onClick={end}
          />
        }
        actions={[
          { onClick: next, text: t("analysis.onboarding.next") },
          {
            onClick: back,
            text: t("analysis.onboarding.back"),
            appearance: "subtle",
          },
        ]}
        heading={t("analysis.onboarding.chart.title")}
        target="third-table"
        key="third-table"
      >
        {t("analysis.onboarding.chart.body")}
      </Spotlight>,
      <Spotlight
        actionsBeforeElement="19/20"
        headingAfterElement={
          <Button
            iconBefore={<CrossIcon size="small" label="end" />}
            appearance="subtle"
            onClick={end}
          />
        }
        actions={[
          { onClick: next, text: t("analysis.onboarding.next") },
          {
            onClick: back,
            text: t("analysis.onboarding.back"),
            appearance: "subtle",
          },
        ]}
        heading={t("analysis.onboarding.settings.title")}
        target="settings"
        key="settings"
      >
        {t("analysis.onboarding.settings.body")}
      </Spotlight>,
      <Spotlight
        actionsBeforeElement="20/20"
        headingAfterElement={
          <Button
            iconBefore={<CrossIcon size="small" label="end" />}
            appearance="subtle"
            onClick={end}
          />
        }
        actions={[
          { onClick: end, text: t("analysis.onboarding.ok") },
          {
            onClick: back,
            text: t("analysis.onboarding.go_back"),
            appearance: "subtle",
          },
        ]}
        heading={t("analysis.onboarding.restart.title")}
        target="restart-onboarding"
        key="restart-onboarding"
      >
        {t("analysis.onboarding.restart.body")}
      </Spotlight>,
    ];

    if (activeSpotlight === null) return null;
    return spotlights[activeSpotlight];
  };

  return (
    <>
      {activeSpotlight !== null && (
        <SpotlightTransition>{renderActiveSpotlight()}</SpotlightTransition>
      )}
      <PageHeader>{t("analysis.title")}</PageHeader>
      <p>{t("analysis.description")}</p>

      <div>
        <EpicSelectionTable
          epicGoals={epicGoals}
          profileSelections={profileSelections}
          handleProfileChange={handleProfileChange}
          bpNokFactor={bpNokFactor}
          spNokFactor={spNokFactor}
          handleFactorChange={handleFactorChange}
          // Pass down localized data from the hook
          benefitProfiles={benefitProfiles}
          costProfiles={costProfiles}
          benefitProfileMap={benefitProfileMap}
          costProfileMap={costProfileMap}
        />
      </div>

      {periodizationResults.length > 0 && (
        <TotalResultsTable
          periodizationResults={periodizationResults}
          numberOfPeriods={numberOfPeriods}
          incrementYears={incrementYears}
          decrementYears={decrementYears}
          MIN_YEARS={MIN_YEARS}
          MAX_YEARS={MAX_YEARS}
        />
      )}

      {periodizationResults.length > 0 && (
        <PeriodizationChartContainer
          periodizationResults={periodizationResults}
        />
      )}
    </>
  );
};
