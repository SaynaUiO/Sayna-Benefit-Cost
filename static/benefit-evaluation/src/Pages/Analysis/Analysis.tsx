import { useEffect, useState, useCallback, useMemo } from "react";
import PageHeader from "@atlaskit/page-header";
import { Goal } from "../../Models";
import { useAppContext } from "../../Contexts/AppContext";
import { useAPI } from "../../Contexts/ApiContext";
import {
  calculateTotalPeriodization,
  PeriodizationPeriodResult,
} from "./periodizationCalculations";

// Importer periodiseringslogikk og typer
import {
  benefitProfiles,
  costProfiles,
  EpicProfileSelections,
  ProfileOption,
} from "./periodizationTypes";

// Importer de separerte komponentene
import { EpicSelectionTable } from "./EpicSelectionTable";
import { TotalResultsTable } from "./TotalResultsTable";
// VIKTIG: Importerer den nye containeren
import { PeriodizationChartContainer } from "./PeriodizationChartContainer";
import { Spotlight, SpotlightTransition } from "@atlaskit/onboarding";

export const Analysis = () => {
  const [scope] = useAppContext();
  const api = useAPI();

  // --- STATS OG KONTROLL ---
  const [epicGoals, setEpicGoals] = useState<Goal[] | null>(null);
  const [profileSelections, setProfileSelections] =
    useState<EpicProfileSelections>({});
  const [periodizationResults, setPeriodizationResults] = useState<
    PeriodizationPeriodResult[]
  >([]);
  const [numberOfPeriods, setNumberOfPeriods] = useState<number>(10);
  const [inputError, setInputError] = useState<string | null>(null); // beholdes for funksjoner

  const MIN_YEARS = 10;
  const MAX_YEARS = 20;

  //Onboarding:
  const [isOnboardingCompleted, setOnboardingCompleted] =
    useState<boolean>(true);
  const [activeSpotlight, setActiveSpotlight] = useState<null | number>(null);
  const next = () => setActiveSpotlight((activeSpotlight || 0) + 1);
  const back = () => setActiveSpotlight((activeSpotlight || 1) - 1);
  const end = () => {
    api.onboarding.setOnboardingComplete(true);
    setActiveSpotlight(null);
    setOnboardingCompleted(true);
  };

  // KONTROLLFUNKSJONER (BEHOLDES HER da de endrer STATE)
  const incrementYears = useCallback(() => {
    setInputError(null);
    setNumberOfPeriods((prevYears) => Math.min(prevYears + 1, MAX_YEARS));
  }, []);

  const decrementYears = useCallback(() => {
    setInputError(null);
    setNumberOfPeriods((prevYears) => Math.max(prevYears - 1, MIN_YEARS));
  }, []);

  // --- EFFEKTER OG BEREGNINGER ---

  // 1. Beregn periodisering
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
        numberOfPeriods
      );
      setPeriodizationResults(results);
    }
  }, [epicGoals, profileSelections, numberOfPeriods]);

  // 2. Fetch epic data fra goal funksjonen
  const fetchEpicGoals = useCallback(async () => {
    try {
      const allCollections = await api.goalCollection.getAll(scope.id);
      let allEpics: Goal[] = [];

      for (const collection of allCollections) {
        const epics = await api.goal.getAll(scope.id, collection.id);
        const epicGoals = epics.filter(
          (goal) => goal.goalCollectionId === "root-epic"
        );
        allEpics = allEpics.concat(epicGoals);
      }
      setEpicGoals(allEpics);
    } catch (error) {
      console.error("Error fetching epic goals:", error);
    }
  }, [scope.id, api]);

  useEffect(() => {
    fetchEpicGoals();
  }, [fetchEpicGoals]);

  // 3. Håndterer profil dropdown (BEHOLDES HER da den endrer STATE)
  const handleProfileChange = useCallback(
    (
      epicId: string,
      type: "bp" | "sp",
      selectedOption: ProfileOption | null
    ) => {
      const keyToUpdate =
        type === "bp" ? "benefitProfileKey" : "costProfileKey";
      const value =
        selectedOption?.value ||
        (keyToUpdate === "benefitProfileKey"
          ? benefitProfiles[0].value
          : costProfiles[0].value);

      setProfileSelections((prevSelections) => ({
        ...prevSelections,
        [epicId]: {
          ...prevSelections[epicId],
          [keyToUpdate]: value,
        },
      }));
    },
    []
  );

  // 4. Sett default profiler
  useEffect(() => {
    if (epicGoals && Object.keys(profileSelections).length === 0) {
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
  }, [epicGoals, profileSelections]);

  // FJERNEDE USEMEMO FOR chartData og chartDataJs.
  // Denne logikken ligger nå i PeriodizationChartContainer.tsx

  //Fortsetter Onboarding:
  useEffect(() => {
    // Sjekk om onboardingen er fullført
    api.onboarding.isOnboardingComplete().then((completed: boolean) => {
      if (!completed) {
        // Hvis IKKE fullført, start Estimation-spesifikke spotlights her
        setActiveSpotlight(0);
      }
    });
  }, [api]);

  const renderActiveSpotlight = () => {
    const spotlights = [
      <Spotlight
        actions={[
          {
            onClick: () => next(),
            text: "Neste",
          },
          {
            onClick: () => back(),
            text: "Back",
            appearance: "subtle",
          },
        ]}
        heading=""
        target="first-table"
        key="first-table"
      >
        Her ser vi en tabell over alle Epics med deres tilhørende Nyttepoeng- og
        kostnads-verdier som vi fordelte tidligere.
      </Spotlight>,
      <Spotlight
        actions={[
          {
            onClick: () => next(),
            text: "Neste",
          },
          {
            onClick: () => back(),
            text: "Back",
            appearance: "subtle",
          },
        ]}
        heading=""
        target="profile"
        key="profile"
      >
        Ved å endre på profilene, vil du også endre på tabellen og grafen under.
        På denne siden er alt dynamisk.
      </Spotlight>,
      <Spotlight
        actions={[
          {
            onClick: () => next(),
            text: "Neste",
          },
          {
            onClick: () => back(),
            text: "Back",
            appearance: "subtle",
          },
        ]}
        heading=""
        target="second-table"
        key="second-table"
      >
        Denne tabellen viser finansiell plan over 10 til 20 år. Den viser den
        samlede nytten (BP) og kostnaden (SP) for epicsene.
      </Spotlight>,
      <Spotlight
        actions={[
          {
            onClick: () => next(),
            text: "Neste",
          },
          {
            onClick: () => back(),
            text: "Back",
            appearance: "subtle",
          },
        ]}
        heading=""
        target="year-tooltip"
        key="year-tooltip"
      >
        Med disse pilene kan du justere på årene.
      </Spotlight>,
      <Spotlight
        actions={[
          {
            onClick: () => next(),
            text: "Neste",
          },
          {
            onClick: () => back(),
            text: "Back",
            appearance: "subtle",
          },
        ]}
        heading=""
        target="third-table"
        key="third-table"
      >
        Dette er en dynamisk graf som endrer seg når du endrer på profilene. Med
        denne grafen kan du lett analysere de ulike verdiene i forhold til
        hverandre. Du kan også trykk på de 4 boksene på toppen av grafen som
        representerer hver verdi, for å skjule dem i grafen.
      </Spotlight>,
      <Spotlight
        actions={[
          { onClick: () => end(), text: "OK" },
          {
            onClick: () => back(),
            text: "Go back",
            appearance: "subtle",
          },
        ]}
        heading="Restart Onboarding"
        target="restart-onboarding"
        key="restart-onboarding"
      >
        You can restart this onboarding at any time by pressing this help icon.
      </Spotlight>,
    ];

    if (activeSpotlight === null) {
      return null;
    }

    return spotlights[activeSpotlight];
  };

  return (
    <>
      {activeSpotlight !== null && (
        <SpotlightTransition>{renderActiveSpotlight()}</SpotlightTransition>
      )}
      <PageHeader>Periodisering</PageHeader>
      <p>
        På denne siden får du en oversikt over estimeringen av benefit of cost
        over tid. Velg profiler for hver Epic under for å se den finansielle
        planen.
      </p>

      <div>
        {/* 1. EPIC SELECTION TABLE */}
        <EpicSelectionTable
          epicGoals={epicGoals}
          profileSelections={profileSelections}
          handleProfileChange={handleProfileChange}
        />
      </div>

      {/* 2. TOTAL BEREGNINGSTABELL */}
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

      {/* 3. VISUALISERING AV FINANSIELL PLAN */}
      {/* Bruker PeriodizationChartContainer for all Chart-logikk og rendering */}
      {periodizationResults.length > 0 && (
        <PeriodizationChartContainer
          periodizationResults={periodizationResults}
        />
      )}
    </>
  );
};
