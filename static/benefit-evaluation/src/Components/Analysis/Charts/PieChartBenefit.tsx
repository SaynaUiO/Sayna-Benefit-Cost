import React, { useEffect, useState } from "react";
import { GoalTableItem } from "../../../Models/GoalStructureModel";
import { Chart as ChartJS, ArcElement } from "chart.js";
import { Pie } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
ChartJS.register(ArcElement, ChartDataLabels);
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
  benefit: boolean;
};

export const PieChartBenefit = ({ items, benefit }: Props) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    if (items === undefined) return;

    const labels: string[] = items.map((item) => item.key);
    const datasetBenefit: any = items.map((item) =>
      benefit
        ? item!.balancedPoints!.value
        : item!.issueCost!.balanced_points * 100
    );

    setLabels(labels);
    setChartData(datasetBenefit);
  }, [items, benefit]);

  const options = {
    layout: {
      padding: 50,
    },
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        color: "gray",
        fontSize: 16,
        formatter: function (value: any, context: any) {
          return labels[context.dataIndex];
        },
        clamp: true,
        anchor: "end" as const,
        align: "end" as const,
      },
    },
  };

  return (
    <div style={{ position: "relative" }}>
      <PageHeader>{benefit ? "Benefits" : "Costs"}: Piechart</PageHeader>
      <Tooltip
        content={`The ${
          benefit ? "benefits" : "costs"
        } piechart shows the share each epic takes of the ${
          benefit ? "benefit" : "cost"
        } points.`}
      >
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
      <div
        style={{
          width: "100%",
          height: "auto",
          aspectRatio: "2 / 1.15",
        }}
      >
        <Pie
          options={options}
          data={{
            labels: labels,
            datasets: [
              {
                label: benefit ? "Benefit Points" : "Cost Points",
                data: chartData,
                backgroundColor: [
                  "rgba(255, 99, 132, 0.8)",
                  "rgba(54, 162, 235, 0.8)",
                  "rgba(255, 206, 86, 0.8)",
                  "rgba(75, 192, 192, 0.8)",
                  "rgba(153, 102, 255, 0.8)",
                  "rgba(255, 159, 64, 0.8)",
                ],
              },
            ],
          }}
        />
      </div>
    </div>
  );
};
