import { useState } from "react";
import { useAppContext } from "../../Contexts/AppContext";
import PageHeader from "@atlaskit/page-header";

//Sayna Inports:
import { GoalStructureContainer } from "../../SaynaSineFiler/components/GoalStructureContainer";
import { GoalStructureContainer2 } from "../../SaynaSineFiler/components/GoalStructureContainer2";

export const GoalStructure = () => (
  <>
    <PageHeader>Medfin</PageHeader>
    {/* <GoalStructureContainer /> */}
    <GoalStructureContainer2 />
  </>
);
