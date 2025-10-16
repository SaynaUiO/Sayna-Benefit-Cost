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

// Hardkodet tidsramme (skal senere hentes fra brukerinput)
const NUMBER_OF_PERIODS = 16;

// Legg til denne typen for å lagre profilvalgene per Epic ID
interface EpicProfileSelections {
  [epicId: string]: {
    bpProfile: ProfileOption | null;
    spProfile: ProfileOption | null;
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
    useState<EpicProfileSelections>({});
  const [periodizationResults, setPeriodizationResults] = useState<
    PeriodizationPeriodResult[]
  >([]);

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

  //2. Håndterer profil dropdown:
  const handleProfileChange = useCallback(
    (
      epicId: string,
      type: "bp" | "sp",
      selectedOption: ProfileOption | null
    ) => {
      setProfileSelections((prevSelections) => ({
        ...prevSelections,
        [epicId]: {
          ...prevSelections[epicId],
          // Oppdaterer enten bpProfile eller spProfile
          [`${type}Profile`]: selectedOption,
        },
      }));
    },
    []
  );

  useEffect(() => {
    // Sjekker om vi har data å jobbe med
    if (
      epicGoals &&
      epicGoals.length > 0 &&
      Object.keys(profileSelections).length > 0
    ) {
      // Utfør total beregning basert på alle Epics og valgte profiler
      const results = calculateTotalPeriodization(
        epicGoals,
        profileSelections,
        NUMBER_OF_PERIODS
      );

      // Lagrer det endelige resultatet
      setPeriodizationResults(results);
    }
  }, [epicGoals, profileSelections]); // Avhenger av Epic-data og profilvalg

  // Legg til en default verdi hvis profilen ikke er valgt
  useEffect(() => {
    if (epicGoals && Object.keys(profileSelections).length === 0) {
      const defaultSelections: EpicProfileSelections = {};
      epicGoals.forEach((epic) => {
        defaultSelections[epic.id] = {
          // Setter en default profil, f.eks. den første i listen
          bpProfile: benefitProfiles[0],
          spProfile: costProfiles[0],
        };
      });
      setProfileSelections(defaultSelections);
    }
  }, [epicGoals, profileSelections]);

  //3. Rader for tabellen
  const rows = epicGoals?.map((epic) => {
    const epicId = epic.id;
    const currentSelections = profileSelections[epicId] || {
      bpProfile: null,
      spProfile: null,
    };

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
              value={currentSelections.bpProfile}
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
              value={currentSelections.spProfile}
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
      { key: "period", content: "Periode" },
      { key: "totalBP", content: "Total BP" },
      { key: "totalSP", content: "Total SP" },
      { key: "netPoints", content: "Netto Poeng" },
      { key: "discount", content: "Discount Factor " },
      { key: "netNPV", content: "Netto Nåverdi" },
      { key: "accumulatedNPV", content: "Akkumulert NPV" },
    ],
  };

  // Lager rader for totaltabellen basert på periodizationResults
  const totalTableRows = periodizationResults.map((result) => ({
    key: `p-${result.period}`,
    cells: [
      { key: "period", content: `Q${result.period}` },
      { key: "totalBP", content: String(result.totalBP) },
      { key: "totalSP", content: String(result.totalSP) },
      { key: "netPoints", content: String(result.netPoints) },
      { key: "discount", content: String(result.discountFactor) },
      { key: "netNPV", content: String(result.netDiscountedPoints) },
      { key: "accumulatedNPV", content: String(result.accumulatedNPV) },
    ],
  }));

  const chartData = useMemo(() => {
    if (periodizationResults.length === 0) return [];

    // Hver periode er ett dataobjekt
    return periodizationResults.map((result) => ({
      // xAccessor
      xAxis: `Q${result.period}`,
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

  const chartDataJs = useMemo(() => {
    if (periodizationResults.length === 0) return { labels: [], datasets: [] };

    const labels = periodizationResults.map((r) => `Q${r.period}`);
    const netPointsData = periodizationResults.map((r) => r.netPoints);
    const accumulatedNPVData = periodizationResults.map(
      (r) => r.accumulatedNPV
    );

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
              ? "rgba(75, 192, 192, 0.8)"
              : "rgba(255, 99, 132, 0.8)";
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
          <DynamicTable
            caption={`Finansiell plan over ${NUMBER_OF_PERIODS} kvartaler`}
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
