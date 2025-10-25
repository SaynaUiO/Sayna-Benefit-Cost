import React, { useMemo } from "react";
// Antar at du har denne komponenten for Chart.js
import { PeriodizationChart } from "./Charts";

// Importer nødvendige typer for Chart.js
// ChartData og ChartOptions er ikke strengt nødvendig hvis du ikke bruker dem,
// men vi beholder dem i tilfelle du har dem i din faktiske fil.
import { ChartData, ChartOptions } from "chart.js";

// Importer typen for periodiseringsresultatene, for å definere props
import { PeriodizationPeriodResult } from "./periodizationCalculations";
import { SpotlightTarget } from "@atlaskit/onboarding";

// Definerer props for denne komponenten
interface PeriodizationChartContainerProps {
  periodizationResults: PeriodizationPeriodResult[];
}

// ** chartOptions er FJERNEDE her **

export const PeriodizationChartContainer: React.FC<
  PeriodizationChartContainerProps
> = ({ periodizationResults }) => {
  // Merk: Ingen eksplisitt type casting her, som er grunnen til at den kompilerte lokalt.
  const chartDataJs = useMemo(() => {
    if (periodizationResults.length === 0) return { labels: [], datasets: [] };

    const labels = periodizationResults.map((r) => `År ${r.period}`);
    const grossBenefitData = periodizationResults.map((r) => r.grossBenefit);
    const grossCostData = periodizationResults.map((r) => r.grossCost);
    const netPointsData = periodizationResults.map((r) => r.netPoints);
    const accumulatedNPVData = periodizationResults.map(
      (r) => r.accumulatedNPV
    );

    return {
      labels: labels,
      datasets: [
        // BRUTTO GEVINST (BP) - LINJE
        {
          type: "line" as const,
          label: "Total BP",
          borderColor: "rgba(44, 154, 44, 1)",
          backgroundColor: "rgba(0, 150, 0, 0.1)",
          data: grossBenefitData,
          yAxisID: "yNetPoints",
          tension: 0.4,
          pointRadius: 2,
          borderWidth: 3,
        },
        // BRUTTO KOSTNAD (SP) - LINJE
        {
          type: "line" as const,
          label: "Total SP",
          borderColor: "rgba(204, 78, 78, 1)",
          backgroundColor: "rgba(255, 0, 0, 0.1)",
          data: grossCostData,
          yAxisID: "yNetPoints",
          tension: 0.4,
          pointRadius: 2,
          borderWidth: 3,
        },
        // STOLPER (Netto Poeng)
        {
          type: "bar" as const,
          label: "Netto Poeng ",
          backgroundColor: (context: any) => {
            const value = context.raw;
            return value >= 0
              ? "rgba(171, 245, 209, 0.8)"
              : "rgba(255, 189, 173, 0.8)";
          },
          borderColor: "rgba(255, 255, 255, 0.5)",
          borderWidth: 1,
          data: netPointsData,
          yAxisID: "yNetPoints",
        },
        // LINJE (Akkumulert NPV)
        {
          type: "line" as const,
          label: "Akkumulert NPV",
          borderColor: "rgb(53, 162, 235)",
          backgroundColor: "rgba(53, 162, 235, 0.2)",
          data: accumulatedNPVData,
          yAxisID: "yAccumulatedNPV",
          tension: 0.4,
          pointRadius: 5,
        },
      ],
    };
  }, [periodizationResults]);

  if (periodizationResults.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: "40px" }}>
      {/* NY TITTEL - Flyttet fra Analysis.tsx */}
      <SpotlightTarget name="third-table">
        <h3>3. Finansiell Plan (Gevinst, Kostnad, Netto) Over Tid </h3>
      </SpotlightTarget>
      <p>
        Diagrammet kombinerer Brutto Gevinst (BP), Brutto Kostnad (SP), Netto
        Poeng (stolper) og Akkumulert NPV (tynn linje, høyre akse). Nullpunktet
        (Breakeven) er der den Akkumulerte NPV-linjen krysser null-linjen.
      </p>

      {/* Ingen options prop sendes inn */}
      <PeriodizationChart chartData={chartDataJs} />
    </div>
  );
};
