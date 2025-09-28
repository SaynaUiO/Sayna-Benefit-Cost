import { useState } from "react";
import { useAppContext } from "../../Contexts/AppContext";
import PageHeader from "@atlaskit/page-header";

//Sayna Inports:
import { GoalStructureContainer } from "../../SaynaSineFiler/components/GoalStructureContainer";

export const GoalStructure = () => (
  <>
    <PageHeader>Medfin</PageHeader>
    <GoalStructureContainer />
  </>
);
