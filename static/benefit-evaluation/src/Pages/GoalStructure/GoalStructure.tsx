import { useState } from "react";
import { useAppContext } from "../../Contexts/AppContext";
import PageHeader from "@atlaskit/page-header";
import { GoalStructureContainer } from "../../SaynaSineFiler/components/GoalStructureContainer";

//Sayna Inports:

export const GoalStructure = () => (
  <>
    <PageHeader>Målstruktur</PageHeader>
    <GoalStructureContainer />
  </>
);
