import Button from "@atlaskit/button";
import { SpotlightTarget } from "@atlaskit/onboarding";
import { Box, xcss } from "@atlaskit/primitives";
import { useState } from "react";
import { useAPI } from "../../Contexts/ApiContext";
import { useNavigate } from "react-router";

export const Introduction = () => {
  const boxStyles = xcss({
    borderColor: "color.border.accent.gray",
    borderStyle: "solid",
    borderRadius: "border.radius.300",
    borderWidth: "border.width",
    backgroundColor: "color.background.input.pressed",
    padding: "space.200",
  });

  const api = useAPI();
  const navigate = useNavigate();

  return (
    <div style={{ padding: "2rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: "1rem",
        }}
      >
        <h1 style={{ margin: 0 }}>Welcome to Benefit/Cost Management</h1>

        <SpotlightTarget name="start-onboarding">
          <Button
            appearance="primary"
            onClick={() => {
              api.onboarding.setOnboardingComplete(false).then(() => {
                navigate("/goal-structure");
              });
            }}
          >
            Start Onboarding
          </Button>
        </SpotlightTarget>
      </div>
      Benefit/cost management is a strategic approach to evaluate whether the
      investments in a project are justified by the benefits it delivers. More
      info about benefit/cost management can be found below.
      <h2 style={{ paddingBottom: "1rem" }}>
        Understanding Benefit/Cost Management
      </h2>
      <section>
        <Box xcss={boxStyles}>
          <p>Involves:</p>
          <ul>
            <li>
              Assessing the benefit a project is expected to deliver, such as
              improved services or increased sales.
            </li>
            <li>
              Comparing these benefits against the associated lifecycle costs.
            </li>
            <li>
              Continuously monitoring and evaluating development activities to
              ensure that high benefit-to-cost products are delivered.
            </li>
          </ul>
          <p>
            This will give you a metric to estimate value in development
            activities, in addition to traditional metrics for time, cost and
            scope.
          </p>
        </Box>
      </section>
      <h2 style={{ paddingBottom: "1rem" }}>Typical Steps</h2>
      <Box xcss={boxStyles}>
        <p>
          These are some of the typical steps involved in benefit/cost that you
          would be performing in this app:
        </p>
        <ol>
          <li>
            Selecting the correct epics for the project (Project configuration)
          </li>
          <li>
            Creating a goal collection and adding goals for the project (Goal
            Structure page)
          </li>
          <li>
            Assigning values, either weight or monetary value (worth points) for
            all the goals (Goal Structure page)
          </li>
          <li>Assign cost and time to each epic (Goal Structure page)</li>
          <li>
            Assign benefit points to estimate the epics' expected contribution
            (benefit) to goals (Estimation page)
          </li>
          <li>
            View and evaluate the order of how to complete the epics (Analysis
            page)
          </li>
        </ol>
      </Box>
      <h2 style={{ paddingBottom: "1rem" }}>Addressing Soft Benefits</h2>
      <Box xcss={boxStyles}>
        <p>
          Soft benefits refer to qualitative returns that are challenging to
          quantify in monetary terms, often necessitating implicit methods for
          assessment due to practical limitations in precise quantification. To
          address these we use the MISHRI method:
        </p>
        <ol>
          <li>Assign measurable benefits to goals wherever possible.</li>
          <li>Compare and value soft benefits relative to other goals.</li>
          <li>
            Adjust the benefit value based on the relative importance of each
            goal.
          </li>
        </ol>
        <p>
          This approach helps in attributing value to less tangible benefits,
          ensuring they are accounted for in project evaluations.
        </p>
      </Box>
    </div>
  );
};
