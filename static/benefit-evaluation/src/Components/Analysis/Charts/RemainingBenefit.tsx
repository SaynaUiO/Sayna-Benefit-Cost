import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { GoalTableItem } from "../../../Models/GoalStructureModel";
import { Loading } from "../../../Components/Common/Loading";
import "chartjs-adapter-moment";
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
  isMonetary: boolean;
  upperIsMonetary: boolean;
  costValue: number;
  pointValue: number;
};

const RemainingBenefit = ({
  items,
  isMonetary,
  upperIsMonetary,
  costValue,
  pointValue,
}: Props) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    if (items === undefined) return;

    const labels: string[] = [];
    const timelineLabels: Date[] = [];
    const datasetBenefit: any = [];
    const datasetCost: any = [];

    let totalBenefit = !isMonetary ? 100 : 0;
    let totalCosts = !isMonetary ? 100 : 0;
    if (isMonetary) {
      items.forEach((epic) => {
        totalBenefit += epic.balancedPoints!!.value * pointValue;

        totalCosts += upperIsMonetary
          ? epic.issueCost!!.cost
          : costValue * (epic.issueCost!!.balanced_points || 0) * 100;
      });
    }

    datasetBenefit.push(totalBenefit);
    datasetCost.push(totalCosts);
    timelineLabels.push(new Date());
    let hours = 0;
    items.forEach((epic) => {
      labels.push(epic.description!);
      hours += epic.issueCost?.time || 0;
      timelineLabels.push(
        new Date(new Date().getTime() + hours * 60 * 1000 * 60)
      );
      totalBenefit -= isMonetary
        ? epic.balancedPoints!!.value * pointValue
        : epic.balancedPoints!!.value;

      totalCosts -= isMonetary
        ? upperIsMonetary
          ? epic.issueCost!!.cost
          : costValue * (epic.issueCost!!.balanced_points || 0) * 100
        : (epic.issueCost!!.balanced_points || 1 / items.length) * 100;
      if (totalBenefit < 0) totalBenefit = 0;
      if (totalCosts < 0) totalCosts = 0;
      datasetBenefit.push(totalBenefit);
      datasetCost.push(totalCosts);
    });
    labels.push("");
    setLabels(labels);
    if (labels.length > 0) {
      datasetBenefit[datasetBenefit.length - 1] = 0;
      datasetCost[datasetCost.length - 1] = 0;
    }

    const chartData: any[] = timelineLabels.map((label, index) => ({
      label,
      benefit: datasetBenefit[index],
      cost: datasetCost[index],
    }));

    setChartData(chartData);
  }, [items, isMonetary, upperIsMonetary, costValue, pointValue]);

  if (!items || chartData.length === 0) return <Loading />;

  const chartOptions: any = {
    responsive: true,
    scales: {
      x: {
        type: "time",
        time: {
          unit: "hour",
          stepSize: 1,
          displayFormats: {
            minute: "MMM DD, HH:mm",
          },
        },
        categorySpacing: 0,
        ticks: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
      },
    },
    animation: {
      duration: 1500,
      easing: "easeInOutQuad",
    },
    plugins: {
      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,
        callbacks: {
          title: function (tooltipItems: any) {
            const dataIndex = tooltipItems[0].dataIndex;
            return labels[dataIndex];
          },
        },
      },
      legend: {
        display: false,
      },
      datalabels: {
        color: "gray",
        fontSize: 16,
        formatter: function (value: any, context: any) {
          return items[context.dataIndex]?.key || "";
        },
        clamp: true,
        anchor: "end" as const,
        align: "end" as const,
      },
    },
    layout: {
      padding: 30,
    },
  };

  const chartDataset: any = [
    {
      label: "Benefit",
      data: chartData.map((data) => data.benefit),
      fill: "origin",
      backgroundColor: "rgba(46, 163, 77, 0.2)",
      borderColor: "#2ea34d",
      borderWidth: 2,
      pointBackgroundColor: "#2ea34d",
      cubicInterpolationMode: "monotone",
    },
    {
      label: "Costs",
      data: chartData.map((data) => data.cost),
      fill: "origin",
      backgroundColor: "rgba(255, 99, 132, 0.5)",
      borderColor: "#ff6384",
      borderWidth: 2,
      pointBackgroundColor: "#ff6384",
      cubicInterpolationMode: "monotone",
    },
  ];

  const CustomLegend = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        marginLeft: "20px",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          margin: "5px",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 32 32"
          style={{
            display: "inline-block",
            verticalAlign: "middle",
            marginRight: "4px",
          }}
        >
          <path
            strokeWidth="4"
            fill="none"
            stroke="#2ea34d"
            d="M0,16h10.666666666666666
            A5.333333333333333,5.333333333333333,0,1,1,21.333333333333332,16
            H32M21.333333333333332,16
            A5.333333333333333,5.333333333333333,0,1,1,10.666666666666666,16"
          />
        </svg>
        <span style={{ color: "#2ea34d", cursor: "default" }}>Benefit</span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          margin: "5px",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 32 32"
          style={{
            display: "inline-block",
            verticalAlign: "middle",
            marginRight: "4px",
          }}
        >
          <path
            strokeWidth="4"
            fill="none"
            stroke="#ff6384"
            d="M0,16h10.666666666666666
            A5.333333333333333,5.333333333333333,0,1,1,21.333333333333332,16
            H32M21.333333333333332,16
            A5.333333333333333,5.333333333333333,0,1,1,10.666666666666666,16"
          />
        </svg>
        <span style={{ color: "#ff6384", cursor: "default" }}>Cost</span>
      </div>
    </div>
  );

  return (
    <div style={{ position: "relative" }}>
      <PageHeader>Burndown: Benefit & Costs</PageHeader>
      <Tooltip content="The remaining benefit and cost by a product of time.">
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
        <CustomLegend />
        <Line
          data={{
            labels: chartData.map((data) => data.label),
            datasets: chartDataset,
          }}
          options={chartOptions}
        />
      </div>
    </div>
  );
};

export default RemainingBenefit;
