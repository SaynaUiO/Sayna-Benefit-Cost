import React, { useMemo } from "react";
import { PeriodizationChart } from "./Charts";
import { PeriodizationPeriodResult } from "./periodizationCalculations";
import { SpotlightTarget } from "@atlaskit/onboarding";
import { useTranslation } from "@forge/react";

interface PeriodizationChartContainerProps {
  periodizationResults: PeriodizationPeriodResult[];
}

export const PeriodizationChartContainer: React.FC<
  PeriodizationChartContainerProps
> = ({ periodizationResults }) => {
  const { t } = useTranslation();

  const chartDataJs = useMemo(() => {
    if (periodizationResults.length === 0) return { labels: [], datasets: [] };

    // Localize the X-axis labels (e.g., "Year 1", "År 1")
    const labels = periodizationResults.map(
      (r) => `${t("chart.year_label")} ${r.period}`
    );
    const grossBenefitData = periodizationResults.map((r) => r.grossBenefit);
    const grossCostData = periodizationResults.map((r) => r.grossCost);
    const netPointsData = periodizationResults.map((r) => r.netPoints);
    const accumulatedNPVData = periodizationResults.map(
      (r) => r.accumulatedNPV
    );

    return {
      labels: labels,
      datasets: [
        // TOTAL BP - LINE
        {
          type: "line" as const,
          label: t("chart.total_bp"),
          borderColor: "rgba(44, 154, 44, 1)",
          backgroundColor: "rgba(0, 150, 0, 0.1)",
          data: grossBenefitData,
          yAxisID: "yNetPoints",
          tension: 0.4,
          pointRadius: 2,
          borderWidth: 3,
        },
        // TOTAL SP - LINE
        {
          type: "line" as const,
          label: t("chart.total_sp"),
          borderColor: "rgba(204, 78, 78, 1)",
          backgroundColor: "rgba(255, 0, 0, 0.1)",
          data: grossCostData,
          yAxisID: "yNetPoints",
          tension: 0.4,
          pointRadius: 2,
          borderWidth: 3,
        },
        // BARS (Net Value)
        {
          type: "bar" as const,
          label: t("chart.net_value"),
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
        // LINE (Accumulated NPV)
        {
          type: "line" as const,
          label: t("chart.acc_npv"),
          borderColor: "rgb(53, 162, 235)",
          backgroundColor: "rgba(53, 162, 235, 0.2)",
          data: accumulatedNPVData,
          yAxisID: "yAccumulatedNPV",
          tension: 0.4,
          pointRadius: 5,
        },
      ],
    };
  }, [periodizationResults, t]); // Added t to dependencies

  if (periodizationResults.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: "40px" }}>
      <h3>{t("chart.title")}</h3>

      <p>{t("chart.description")}</p>

      <PeriodizationChart chartData={chartDataJs} />
      <SpotlightTarget name="third-table">
        <div />
      </SpotlightTarget>
    </div>
  );
};
