import { useEffect, useState } from "react";
import { GoalTableItem } from "../../../Models/GoalStructureModel";
import { Scatter } from "react-chartjs-2";
import seedrandom from "seedrandom";
import {
  Chart as ChartJS,
  TimeScale,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Filler,
  Legend,
} from "chart.js";
ChartJS.register(
  TimeScale,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Filler,
  Legend
);
import PageHeader from "@atlaskit/page-header";

import { token } from "@atlaskit/tokens";
import styled from "@emotion/styled";
import Tooltip, { TooltipPrimitive } from "@atlaskit/tooltip";
import QuestionCircleIcon from "@atlaskit/icon/glyph/question-circle";
import { Box } from "@atlaskit/primitives";

const InlineDialog = styled(TooltipPrimitive)`
  background: white;
  border-radius: ${token("border.radius", "4px")};
  box-shadow: ${token("elevation.shadow.overlay")};
  box-sizing: content-box;
  color: black;
  max-height: 300px;
  max-width: 300px;
  padding: ${token("space.100", "8px")} ${token("space.150", "12px")};
`;

type Props = {
  items: GoalTableItem[];
};

type ChartData = {
  datasets: {
    label: string;
    data: { x: number; y: number }[];
    backgroundColor: string;
    pointRadius: number;
  }[];
};

function getRandomColor(seed: string) {
  const rng = seedrandom(seed);
  const randomRed = Math.floor(rng() * 256);
  const randomGreen = Math.floor(rng() * 256);
  const randomBlue = Math.floor(rng() * 256);

  return `rgb(${randomRed},${randomGreen},${randomBlue})`;
}

export const ScatterChart = ({ items }: Props) => {
  const [chartData, setChartData] = useState<ChartData>();

  useEffect(() => {
    const chart: ChartData = { datasets: [] };

    let seed: number = 4;
    items.forEach((epic) => {
      chart.datasets.push({
        label: epic.description!,
        data: [
          {
            x: epic.balancedPoints?.value || 0,
            y: epic.issueCost!!.balanced_points * 100 || 0,
          },
        ],
        backgroundColor: getRandomColor(seed.toString()),
        pointRadius: 4,
      });
      seed++;
    });
    setChartData(chart);
  }, [items]);

  if (!chartData) return null;

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1,
    scales: {
      x: {
        title: {
          display: true,
          text: "Benefits",
        },
        min: 0,
        max:
          Math.max(
            ...[
              ...chartData.datasets.flatMap((dataset) =>
                dataset.data.map((point) => point.y)
              ),
              ...chartData.datasets.flatMap((dataset) =>
                dataset.data.map((point) => point.x)
              ),
            ]
          ) + 1,
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
          text: "Costs",
        },
        min: 0,
        max:
          Math.max(
            ...[
              ...chartData.datasets.flatMap((dataset) =>
                dataset.data.map((point) => point.y)
              ),
              ...chartData.datasets.flatMap((dataset) =>
                dataset.data.map((point) => point.x)
              ),
            ]
          ) + 1,
        grid: {
          display: false,
        },
      },
    },
    animation: {
      duration: 2000,
      easing: "easeInOutQuad" as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const dataPoint =
              chartData.datasets[context.datasetIndex].data[context.dataIndex];
            const label = chartData.datasets[context.datasetIndex].label;

            return `"${label}" with ${dataPoint.x} benefit and ${dataPoint.y} cost`;
          },
        },
      },
      datalabels: {
        color: "gray",
        fontSize: 16,
        formatter: function (value: any, context: any) {
          return items[context.datasetIndex]?.key || "";
        },
        clamp: true,
        anchor: "end" as const,
        align: "end" as const,
      },
    },
    layout: {
      padding: 20,
    },
  };

  return (
    <div style={{ position: "relative" }}>
      <PageHeader>Scattered: Benefit & Cost</PageHeader>
      <Tooltip content="The scattered epics to show the general spread of epics.">
        <Box
          style={{
            cursor: "pointer",
            position: "absolute",
            top: "1rem",
            right: "1rem",
          }}
        >
          <QuestionCircleIcon label="" />
        </Box>
      </Tooltip>
      <Scatter options={options} data={chartData} style={{ marginTop: 20 }} />
    </div>
  );
};
