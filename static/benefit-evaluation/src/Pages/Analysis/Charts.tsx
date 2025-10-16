import React from "react";
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip as ChartTooltip,
  LineController,
  BarController,
} from "chart.js";
import { Chart } from "react-chartjs-2";

// Registrerer alle nødvendige Chart.js-komponenter
ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  ChartTooltip,
  LineController,
  BarController
);

interface ChartJsData {
  labels: string[];
  datasets: any[];
}

interface PeriodizationChartProps {
  chartData: ChartJsData;
}

export const PeriodizationChart: React.FC<PeriodizationChartProps> = ({
  chartData,
}) => {
  // Chart.js Options for kombinert Bar/Line diagram
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Netto Poeng og Akkumulert NPV over tid",
      },
    },
    scales: {
      // Venstre Y-akse for Stolpene (Netto Poeng)
      yNetPoints: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        title: {
          display: true,
          text: "Netto Poeng (BP - SP)",
        },
        grid: {
          drawOnChartArea: true,
        },
      },
      // Høyre Y-akse for Linjen (Akkumulert NPV)
      yAccumulatedNPV: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        title: {
          display: true,
          text: "Akkumulert NPV",
        },
        // Sikrer at Null-linjen (Breakeven) er synlig og at aksen er riktig skalert
        min: chartData.datasets[1]?.data
          ? Math.min(0, ...chartData.datasets[1].data)
          : undefined,
        max: chartData.datasets[1]?.data
          ? Math.max(0, ...chartData.datasets[1].data)
          : undefined,
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        title: {
          display: true,
          text: "Periode (År)",
        },
      },
    },
  };

  return (
    <div style={{ height: "400px" }}>
      {/* Bruker 'Chart' fra react-chartjs-2 med type 'bar' for kombinasjon */}
      <Chart type={"bar"} data={chartData} options={options} />
    </div>
  );
};
