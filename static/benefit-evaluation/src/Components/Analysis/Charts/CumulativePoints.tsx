import React, { useEffect, useState } from "react";
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
import PageHeader from "@atlaskit/page-header";
import { GoalTableItem } from "../../../Models/GoalStructureModel";
import { PolynomialRegression } from "ml-regression-polynomial";

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

const CumulativePoints = ({ items }: Props) => {
  const [chartData, setChartData] = useState<any[]>([{ x: 0, y: 0 }]);
  const [totalCosts, setTotalCosts] = useState<number>(0);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    if (items === undefined) return;
    const tempChartData: any[] = [];
    const tempLabels: string[] = [];

    let totalBenefit = 0;
    let totalCosts = 0;

    items.forEach((epic) => {
      tempLabels.push(epic.description!);
      totalBenefit += epic.balancedPoints?.value!!;
      totalCosts += epic.issueCost!!.balanced_points * 100;
      tempChartData.push({
        label: epic.description!,
        data: [{ x: totalCosts, y: totalBenefit }],
        type: "scatter" as const,
        backgroundColor: "rgba(255, 99, 132, 1)",
        pointRadius: 3,
      });
    });
    setTotalCosts(totalCosts);
    setLabels(tempLabels);
    if (tempChartData.length > 0)
      tempChartData[tempChartData.length - 1].data = [{ x: 100, y: 100 }];

    const xRegData = tempChartData.map((item) => item.data[0].x);
    const yRegData = tempChartData.map((item) => item.data[0].y);
    const degree = 2;

    const regression = new PolynomialRegression(xRegData, yRegData, degree);
    tempChartData.push({
      data: Array.from({ length: totalCosts + 1 }, (_, index) => {
        return (
          regression.coefficients[2] * index * index +
          regression.coefficients[1] * index +
          regression.coefficients[0]
        );
      }),
      type: "line" as const,
      label: "Regression Line",
      borderColor: "rgba(91, 98, 222, 0.6)",
      pointRadius: 0,
    });

    setChartData(tempChartData);
  }, [items]);

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1,
    scales: {
      x: {
        beginAtZero: true,
        title: { text: "cumulative estimated cost", display: true },
      },
      y: {
        beginAtZero: true,
        title: { text: "cumulative estimated benefit", display: true },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context: any) => {
            if (context.dataset.data.length > 1) return "";
            const dataPoint =
              chartData[context.datasetIndex].data[context.dataIndex];
            const label = chartData[context.datasetIndex].label;

            if (label === undefined) return "";
            return [
              `${dataPoint.x} accumulated costs`,
              `${dataPoint.y} accumulated benefit`,
            ];
          },
          title: (context: any) => {
            const index = context[0].datasetIndex;
            const label = labels[index];
            if (label === undefined) return "";
            return label;
          },
        },
      },
      datalabels: {
        display: false,
      },
    },
  };

  return (
    <div style={{ position: "relative" }}>
      <PageHeader>Cumulative: Benefits & Costs</PageHeader>
      <Tooltip content="View the estimated benefit and cost by the cumulative order of epics completed. Along with the trend from a regression analysis.">
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
          position: "relative",
        }}
      >
        <Chart
          type="scatter"
          data={{
            datasets: chartData,
            labels: Array.from({ length: totalCosts + 1 }, (_, index) => {
              return index.toString();
            }),
          }}
          options={options}
        />
      </div>
    </div>
  );
};
export default CumulativePoints;
