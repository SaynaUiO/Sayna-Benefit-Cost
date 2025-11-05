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

  // *NYE STATS FOR NOK-FAKTORER*
  const [bpNokFactor, setBpNokFactor] = useState<number>(0.225); // Standardverdi for BP (millioner NOK)
  const [spNokFactor, setSpNokFactor] = useState<number>(0.6); // Standardverdi for SP (millioner NOK)

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

  // *NY FUNKSJON: Håndterer endring i NOK-faktor*
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
        numberOfPeriods,
        // NYE ARGUMENTER: Send inn NOK-faktorene
        bpNokFactor,
        spNokFactor
      );
      setPeriodizationResults(results);
    }
  }, [
    epicGoals,
    profileSelections,
    numberOfPeriods,
    // NYE AVHENGIGHETER: Kjører beregningen på nytt når faktorene endres
    bpNokFactor,
    spNokFactor,
  ]);

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
        actionsBeforeElement="12/18"
        headingAfterElement={
          <Button
            iconBefore={<CrossIcon size="small" label="end" />}
            appearance="subtle"
            onClick={() => end()}
          />
        }
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
        heading="Epics tabell"
        target="first-table"
        key="first-table"
      >
        Her ser du en tabell over alle epics, med tilhørende nyttepoeng- og
        kostnadsverdier som ble fordelt tidligere.
      </Spotlight>,
      <Spotlight
        actionsBeforeElement="13/18"
        headingAfterElement={
          <Button
            iconBefore={<CrossIcon size="small" label="end" />}
            appearance="subtle"
            onClick={() => end()}
          />
        }
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
        heading="Endre profil"
        target="profile"
        key="profile"
      >
        Profilene fungerer som maler for hvordan poengene fordeles over tid. Når
        du endrer en profil, oppdateres tabellen og grafen under automatisk.
      </Spotlight>,
      <Spotlight
        actionsBeforeElement="14/18"
        headingAfterElement={
          <Button
            iconBefore={<CrossIcon size="small" label="end" />}
            appearance="subtle"
            onClick={() => end()}
          />
        }
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
        heading="Finansiell plan tabell"
        target="second-table"
        key="second-table"
      >
        Tabellen viser den finansielle planen over en periode på 10–20 år, med
        samlet nytte (BP) og kostnad (SP) for alle epics.
      </Spotlight>,
      <Spotlight
        actionsBeforeElement="15/18"
        headingAfterElement={
          <Button
            iconBefore={<CrossIcon size="small" label="end" />}
            appearance="subtle"
            onClick={() => end()}
          />
        }
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
        heading="Juster år"
        target="year-tooltip"
        key="year-tooltip"
      >
        Med disse pilene kan du justere hvor mange år den finansielle planen
        skal dekke.
      </Spotlight>,
      <Spotlight
        actionsBeforeElement="16/18"
        headingAfterElement={
          <Button
            iconBefore={<CrossIcon size="small" label="end" />}
            appearance="subtle"
            onClick={() => end()}
          />
        }
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
        heading="Graf"
        target="third-table"
        key="third-table"
      >
        Dette er en dynamisk graf som oppdateres når du endrer på profilene.
        Grafen lar deg enkelt analysere de ulike verdiene i forhold til
        hverandre. Du kan også trykke på de fire boksene øverst, som
        representerer hver verdi, for å skjule dem i grafen.
      </Spotlight>,
      <Spotlight
        actionsBeforeElement="17/18"
        headingAfterElement={
          <Button
            iconBefore={<CrossIcon size="small" label="end" />}
            appearance="subtle"
            onClick={() => end()}
          />
        }
        actions={[
          {
            onClick: () => next(),
            text: "Next",
          },
          {
            onClick: () => back(),
            text: "Back",
            appearance: "subtle",
          },
        ]}
        heading="Innstillinger"
        target="settings"
        key="settings"
      >
        Under Innstillinger kan du starte prosjektet på nytt om ønskelig.
      </Spotlight>,
      <Spotlight
        actionsBeforeElement="18/18"
        headingAfterElement={
          <Button
            iconBefore={<CrossIcon size="small" label="end" />}
            appearance="subtle"
            onClick={() => end()}
          />
        }
        actions={[
          { onClick: () => end(), text: "OK" },
          {
            onClick: () => back(),
            text: "Go back",
            appearance: "subtle",
          },
        ]}
        heading="Start onboardingen på nytt"
        target="restart-onboarding"
        key="restart-onboarding"
      >
        Du kan starte denne onboardingen på nytt når som helst ved å trykke på
        dette hjelpeikonet.
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
        På denne siden får du en oversikt over estimeringen av nytte og kostnad
        over tid. Ved å velge profiler for hver epic nedenfor, kan du se hvordan
        den finansielle planen utvikler seg og endres basert på fordelingen.
      </p>

      <div>
        {/* 1. EPIC SELECTION TABLE (OPPDATERT MED NYE PROPS) */}
        <EpicSelectionTable
          epicGoals={epicGoals}
          profileSelections={profileSelections}
          handleProfileChange={handleProfileChange}
          bpNokFactor={bpNokFactor}
          spNokFactor={spNokFactor}
          // *NY PROP*: Sender funksjonen som håndterer endringen i staten
          handleFactorChange={handleFactorChange}
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
