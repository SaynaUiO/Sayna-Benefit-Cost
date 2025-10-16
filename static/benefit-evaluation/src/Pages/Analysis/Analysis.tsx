import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import PageHeader from "@atlaskit/page-header";
import { Goal } from "../../Models";
import { useAppContext } from "../../Contexts/AppContext";
import { useAPI } from "../../Contexts/ApiContext";
import DynamicTable from "@atlaskit/dynamic-table";
import Lozenge from "@atlaskit/lozenge";
import Select from "@atlaskit/select";
import {
  calculateTotalPeriodization,
  PeriodizationPeriodResult,
} from "./periodizationCalculations";

import { PeriodizationChart } from "./Charts";
import Tooltip from "@atlaskit/tooltip";
import Button from "@atlaskit/button";
import HipchatChevronDoubleUpIcon from "@atlaskit/icon/glyph/hipchat/chevron-double-up";
import HipchatChevronDoubleDownIcon from "@atlaskit/icon/glyph/hipchat/chevron-double-down";

//Definerer select
// Definerer typen for Select Options
interface ProfileOption {
  label: string; // Visningsnavnet i dropdown-menyen
  value: string; // En unik nøkkel for profilen (brukes i beregningen)
}

// 6 BENEFIT-PROFILER (BP)
const benefitProfiles: ProfileOption[] = [
  { label: "Uniform with delay", value: "BP_DELAY_UNIFORM" },
  { label: "Delay with plateau", value: "BP_DELAY_PLATEAU" },
  { label: "Delay with peak and deterioration", value: "BP_DELAY_PEAK_DET" },
  {
    label: "Immediate effect with linear increase and plateau",
    value: "BP_IMM_INCREASE",
  },
  {
    label: "Beginners enthusiasm and deterioration",
    value: "BP_BEGINNERS_DET",
  },
  { label: "Uniform", value: "BP_UNIFORM" },
];

// 5 COST-PROFILER (SP)
const costProfiles: ProfileOption[] = [
  {
    label: "Development (1 period) with uniform post deployment",
    value: "SP_DEV1_UNIFORM",
  },
  {
    label: "Development (1 period) with decreasing post deployment",
    value: "SP_DEV1_DECREASING",
  },
  {
    label: "High development (1 period) with low decreasing post deployment",
    value: "SP_HIGH_DEV_LOW_DEC",
  },
  {
    label: "Low development (1 period) with increasing post deployment",
    value: "SP_LOW_DEV_INCREASING",
  },
  {
    label: "High development (1 period) with decreasing post deployment",
    value: "SP_HIGH_DEV_DECREASING",
  },
];

// NYTTIG: Lager Map for raskt oppslag av ProfileOption ut fra den lagrede nøkkelen (string)
const getProfileMap = (
  options: ProfileOption[]
): Record<string, ProfileOption> => {
  return options.reduce((acc, option) => {
    acc[option.value] = option;
    return acc;
  }, {} as Record<string, ProfileOption>);
};

const benefitProfileMap = getProfileMap(benefitProfiles);
const costProfileMap = getProfileMap(costProfiles);

// KORRIGERT TYPE: Lagrer nå KUN strengene (keys) for å matche 'calculateTotalPeriodization'
interface EpicProfileSelections {
  [epicId: string]: {
    benefitProfileKey: string; // NYTT NAVN OG TYPE
    costProfileKey: string; // NYTT NAVN OG TYPE
  };
}

//---Feridg med select definering---

// Definerer head for DynamicTable
const head = {
  cells: [
    { key: "epic", content: "Epic", width: 5 },
    { key: "bp", content: "Total BP", width: 5 },
    { key: "sp", content: "Total SP", width: 5 },
    { key: "bpProfile", content: "Velg BP profil", width: 5 },
    { key: "spProfile", content: "Velg SP profil", width: 5 },
  ],
};

export const Analysis = () => {
  const [scope] = useAppContext();
  const api = useAPI();

  //Stats:
  const [epicGoals, setEpicGoals] = useState<Goal[] | null>(null);
  const [profileSelections, setProfileSelections] =
    useState<EpicProfileSelections>({}); // Bruker den korrigerte typen
  const [periodizationResults, setPeriodizationResults] = useState<
    PeriodizationPeriodResult[]
  >([]);
  // Ny state: Lagrer valgt antall ÅR (starter med 1)
  const [numberOfPeriods, setNumberOfPeriods] = useState<number>(10);

  // State for å håndtere input-feilmeldinger
  const [inputError, setInputError] = useState<string | null>(null);

  const MIN_YEARS = 10; // Ny minste tillatte verdi
  const MAX_YEARS = 20; // Maksimal tillatte verdi

  // NY FUNKSJON: Øker antall år med 1 (opp til MAX_YEARS)
  const incrementYears = () => {
    setInputError(null); // Rens feilmeldingen
    setNumberOfPeriods((prevYears) => {
      const newYears = prevYears + 1;
      if (newYears > MAX_YEARS) {
        // Returner maksverdien
        return MAX_YEARS;
      }
      return newYears;
    });
  };

  // NY FUNKSJON: Reduserer antall år med 1 (ned til MIN_YEARS)
  const decrementYears = () => {
    setInputError(null);
    setNumberOfPeriods((prevYears) => {
      const newYears = prevYears - 1;
      if (newYears < MIN_YEARS) {
        return MIN_YEARS;
      }
      return newYears;
    });
  };

  useEffect(() => {
    if (
      epicGoals &&
      epicGoals.length > 0 &&
      Object.keys(profileSelections).length > 0
    ) {
      // Sikrer at beregningen ikke kjører hvis input er ugyldig (selv om state burde fange det)
      if (numberOfPeriods < 1) return;

      const results = calculateTotalPeriodization(
        epicGoals,
        profileSelections, // Denne har nå KORREKT type
        numberOfPeriods // Nå er dette antall ÅR
      );
      setPeriodizationResults(results);
    }
  }, [epicGoals, profileSelections, numberOfPeriods]);

  //1. Fetch epic data fra goal funksjonen
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

  //2. Håndterer profil dropdown: Lagrer KUN nøkkelstrengen (value)
  const handleProfileChange = useCallback(
    (
      epicId: string,
      type: "bp" | "sp",
      selectedOption: ProfileOption | null
    ) => {
      // Bestemmer hvilken nøkkel vi skal oppdatere
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
          [keyToUpdate]: value, // Lagrer KUN strengen (key)
        },
      }));
    },
    []
  );

  // KORRIGERT BLOKK: Legg til en default verdi hvis profilen ikke er valgt - Bruker KUN nøkkelstrenger
  useEffect(() => {
    if (epicGoals && Object.keys(profileSelections).length === 0) {
      const defaultSelections: EpicProfileSelections = {};

      // Henter de korrekte streng-nøklene fra default-profilene
      const defaultBPKey = benefitProfiles[0].value;
      const defaultSPKey = costProfiles[0].value;

      epicGoals.forEach((epic) => {
        defaultSelections[epic.id] = {
          // Setter de korrekte nøkkelnavnene og streng-verdiene
          benefitProfileKey: defaultBPKey,
          costProfileKey: defaultSPKey,
        };
      });
      setProfileSelections(defaultSelections);
    }
  }, [epicGoals, profileSelections]);

  // ----------------------------------------------------
  // Merknad: Den andre useEffect for beregning er flyttet opp tidligere for logisk flyt og er uendret.
  // ----------------------------------------------------

  //3. Rader for tabellen
  const rows = epicGoals?.map((epic) => {
    const epicId = epic.id;
    // Henter de lagrede nøklene (string) fra state
    const currentKeys = profileSelections[epicId] || {
      benefitProfileKey: benefitProfiles[0].value,
      costProfileKey: costProfiles[0].value,
    };

    // Konverterer nøkkelen tilbake til ProfileOption for Select-komponenten (visning)
    const currentBP = benefitProfileMap[currentKeys.benefitProfileKey];
    const currentSP = costProfileMap[currentKeys.costProfileKey];

    return {
      key: epicId,
      cells: [
        { key: "epic", content: epic.key },
        {
          key: "bp",
          content: (
            <Lozenge appearance="new" isBold>
              {String(epic.balancedPoints?.value || "")}
            </Lozenge>
          ),
        },
        {
          key: "sp",
          content: (
            <Lozenge appearance="success" isBold>
              {String(epic.issueCost?.cost || "")}
            </Lozenge>
          ),
        },
        {
          key: "bpProfile",
          content: (
            <Select
              options={benefitProfiles}
              value={currentBP} // Bruker det oppslåtte ProfileOption-objektet
              onChange={(option) =>
                handleProfileChange(epicId, "bp", option as ProfileOption)
              }
              placeholder="Velg BP-profil..."
              spacing="compact"
            />
          ),
          // Sørger for at Select-komponenten får plass i cellen
        },
        {
          key: "spProfile",
          content: (
            <Select
              options={costProfiles}
              value={currentSP} // Bruker det oppslåtte ProfileOption-objektet
              onChange={(option) =>
                handleProfileChange(epicId, "sp", option as ProfileOption)
              }
              placeholder="Velg SP-profil..."
              spacing="compact"
            />
          ),
        },
      ],
    };
  });

  // Definisjon av head for totaltabellen
  const totalTableHead = {
    cells: [
      { key: "period", content: "År" },
      { key: "grossBenefit", content: "Brutto Gevinst (BP)" }, // Nytt navn
      { key: "grossCost", content: "Brutto Kostnad (SP)" }, // Nytt navn
      { key: "netPoints", content: "Netto Poeng" },
      { key: "discount", content: "Discount Factor " },
      { key: "netNPV", content: "Netto Nåverdi" }, // Nytt navn
      { key: "accumulatedNPV", content: "Akkumulert NPV" },
    ],
  };

  // Lager rader for totaltabellen basert på periodizationResults
  const totalTableRows = periodizationResults.map((result) => ({
    key: `p-${result.period}`,
    cells: [
      { key: "period", content: `${result.period}` },
      { key: "grossBenefit", content: String(result.grossBenefit) }, // Korrigert: totalBP -> grossBenefit
      { key: "grossCost", content: String(result.grossCost) }, // Korrigert: totalSP -> grossCost
      { key: "netPoints", content: String(result.netPoints) },
      { key: "discount", content: String(result.discountFactor) },
      { key: "netNPV", content: String(result.netPresentValue) }, // Korrigert: netDiscountedPoints -> netPresentValue
      { key: "accumulatedNPV", content: String(result.accumulatedNPV) },
    ],
  }));

  const chartData = useMemo(() => {
    if (periodizationResults.length === 0) return [];

    // Hver periode er ett dataobjekt
    return periodizationResults.map((result) => ({
      // xAccessor
      xAxis: `År ${result.period}`,
      // yAccessor (Netto Poeng)
      value: result.netPoints,
      // Ekstra data for farge/tooltip (Bruker farge for å skille positiv/negativ)
      financialState: result.netPoints >= 0 ? "Netto Gevinst" : "Netto Kostnad",
      // Akkumulert NPV for tooltip
      accumulatedNPV: result.accumulatedNPV,
    }));
  }, [periodizationResults]);

  // Definerer Series for Bar Chart. Vi trenger kun én serie for Netto Poeng.
  const netPointsSeries = [
    {
      key: "Netto Poeng",
      data: chartData,
    },
  ];

  // KORRIGERT BLOKK: Oppdaterer feltnavnet i datakilden for Chart.js
  const chartDataJs = useMemo(() => {
    if (periodizationResults.length === 0) return { labels: [], datasets: [] };

    const labels = periodizationResults.map((r) => `År ${r.period}`);
    const netPointsData = periodizationResults.map((r) => r.netPoints);
    const accumulatedNPVData = periodizationResults.map(
      (r) => r.accumulatedNPV
    ); // Bruker 'accumulatedNPV', som er korrekt

    return {
      labels: labels,
      datasets: [
        {
          // DATASET 1: STOLPER (Netto Poeng)
          type: "bar" as const,
          label: "Netto Poeng (Kvartalsvis)",
          // Custom fargefunksjon: Grønn for positiv, Rød for negativ
          backgroundColor: (context: any) => {
            const value = context.raw;
            return value >= 0
              ? "rgba(171, 245, 209, 0.8)"
              : "rgba(255, 189, 173, 0.8)";
          },
          borderColor: "rgba(255, 255, 255, 0.5)",
          borderWidth: 1,
          data: netPointsData,
          yAxisID: "yNetPoints", // Koblet til venstre akse
        },
        {
          // DATASET 2: LINJE (Akkumulert NPV)
          type: "line" as const,
          label: "Akkumulert NPV",
          borderColor: "rgb(53, 162, 235)",
          backgroundColor: "rgba(53, 162, 235, 0.2)",
          data: accumulatedNPVData,
          yAxisID: "yAccumulatedNPV", // Koblet til høyre akse
          tension: 0.4,
          pointRadius: 5,
        },
      ],
    };
  }, [periodizationResults]);

  return (
    <>
      <PageHeader>Periodisering</PageHeader>
      <p>
        På denne siden får du en oversikt over estimeringen av benefit of cost
        over tid. Velg profiler for hver Epic under for å se den finansielle
        planen.
      </p>

      <div>
        <DynamicTable
          caption="Liste over epics"
          head={head}
          rows={rows}
        ></DynamicTable>
      </div>

      {/* 2. TOTAL BEREGNINGSTABELL */}
      {periodizationResults.length > 0 && (
        <div>
          {/* KONTROLL FOR TIDSRAMME (KNAPPER) */}
          <div
            style={{
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <h3 style={{ marginRight: "10px" }}>
              Finansiell plan over {numberOfPeriods} år
            </h3>

            {/* Knapp for å redusere år */}
            <Tooltip content={"Reduser antall år"}>
              <Button
                onClick={decrementYears}
                isDisabled={numberOfPeriods <= MIN_YEARS}
                iconBefore={<HipchatChevronDoubleDownIcon label="Reduser år" />}
              />
            </Tooltip>

            {/* Knapp for å øke år */}
            <Tooltip content={"Øk antall år"}>
              <Button
                onClick={incrementYears}
                isDisabled={numberOfPeriods >= MAX_YEARS}
                iconBefore={<HipchatChevronDoubleUpIcon label="Øk år" />}
              />
            </Tooltip>
          </div>
          <DynamicTable
            head={totalTableHead}
            rows={totalTableRows}
            rowsPerPage={4}
            defaultPage={1}
          ></DynamicTable>
        </div>
      )}

      {/* 3. VISUALISERING AV FINANSIELL PLAN */}
      {chartDataJs.labels.length > 0 && (
        <div style={{ marginTop: "40px" }}>
          <h3>3. Netto Nåverdi (NPV) Over Tid </h3>
          <p>
            Diagrammet kombinerer Netto Poeng (stolper) og den kritiske
            Akkumulerte NPV (linjen). Nullpunktet (Breakeven) er der den
            Akkumulerte NPV-linjen krysser null-linjen.
          </p>

          {/* Kaller den nye komponenten med de korrekt formaterte dataene */}
          <PeriodizationChart chartData={chartDataJs} />
        </div>
      )}
    </>
  );
};
