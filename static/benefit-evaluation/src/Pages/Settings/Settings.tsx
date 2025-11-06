import Button from "@atlaskit/button";
import React, { Fragment, useState } from "react";
import { useNavigate } from "react-router";
import { SetIssueType } from "../../Components/SettingsComponents/SetIssueType";
import { Inline, Stack } from "@atlaskit/primitives";
import {
  ScopeTypeEnum,
  ScopeType,
  useAppContext,
} from "../../Contexts/AppContext";
import { useAPI } from "../../Contexts/ApiContext";
import { useAlert } from "../../Contexts/AlertContext";
import { SetIssueStatuses } from "../../Components/SettingsComponents/SetIssueStatuses";
import { ResetProject } from "../../Components/SettingsComponents/ResetProject";
// import { DisconnectProject } from "../../Components/SettingsComponents/DisconnectProject";
import { ResetEverything } from "../../Components/SettingsComponents/ResetEverything";
import { DeletePortfolio } from "../../Components/SettingsComponents/DeletePortfolio";
import PageHeader from "@atlaskit/page-header";

export const Settings = () => {
  const [scope] = useAppContext();
  const navigate = useNavigate();

  return (
    <>
      <PageHeader>Innstillinger</PageHeader>
      <div
        style={{
          marginTop: "1rem",
          maxWidth: "400px",
          display: "grid",
          gap: "1rem",
        }}
      >
        <Stack space="space.200">
          {scope.type === ScopeTypeEnum.PROJECT ? (
            <>
              <SetIssueType />
              <SetIssueStatuses />
              {/* <DisconnectProject /> */}
              <ResetProject />
            </>
          ) : (
            <>
              <Inline space="space.300" spread="space-between">
                <h4>Edit Portfolio</h4>
                <Button onClick={() => navigate("edit-portfolio")}>Edit</Button>
              </Inline>
              <DeletePortfolio />
            </>
          )}
          <ResetEverything />
        </Stack>
      </div>
    </>
  );
};
