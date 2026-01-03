import { GoalTypeEnum } from "../../Models";
import { EpicTableTree } from "./Tables/ProductTableTree";
import { ObjectiveTableTree } from "./Tables/ObjectiveTableTree";
import { BenefitTableTree } from "./Tables/BenefitTableTree";
import GoalDrawer from "./GoalDrawer";
import { SetEpicCostTime } from "../../Pages/GoalTiers/SetEpicCostTime";
import { useGoalStructure } from "../hooks/useGoalStructure";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { SetValues } from "../../Pages/GoalTiers/SetValues";

import React from "react";
import { useTranslation } from "@forge/react";

export const GoalStructureContainer = () => {
  // Initialize the translation hook
  const { t } = useTranslation();

  const {
    loading,
    epicGoals,
    formaalGoals,
    benefitGoals,
    handlers,
    drawer,
    costTimeModal,
    setValuesModal,
    scope,
    allGoals,
    deleteModal,
  } = useGoalStructure();

  const {
    handleAddGoal,
    handleEditGoal,
    onCloseDrawer,
    handleSetCostTime,
    handleCostTimeModalClose,
    onDeleteGoal,
    handleCloseSetValuesModal,
    handleRefreshData,
    handleOpenSetValuesModal,
  } = handlers;

  if (loading) {
    // FIX: Call t() directly
    return <div>{t("structure.loading")}</div>;
  }

  return (
    <div style={{ padding: "2px" }}>
      <ObjectiveTableTree
        data={formaalGoals}
        onAddGoal={(_parentId, goalCollectionId) =>
          handleAddGoal("Objective", goalCollectionId)
        }
        onEditGoal={handleEditGoal}
        onDeleteGoal={onDeleteGoal}
        onSetValues={handleOpenSetValuesModal}
      />
      <br />

      <BenefitTableTree
        data={benefitGoals}
        onAddGoal={(_parentId, goalCollectionId) =>
          handleAddGoal("Benefit", goalCollectionId)
        }
        onEditGoal={handleEditGoal}
        onDeleteGoal={onDeleteGoal}
      />
      <br />

      <div style={{ marginBottom: "40px" }}>
        <EpicTableTree
          data={epicGoals}
          onAddGoal={(_parentId, goalCollectionId) =>
            handleAddGoal("Product", goalCollectionId)
          }
          onEditGoal={handleEditGoal}
          onDeleteGoal={onDeleteGoal}
          onSetCostTime={handleSetCostTime}
        />
      </div>

      {drawer.isDrawerOpen && drawer.context && (
        <GoalDrawer
          title={
            drawer.context.goalToEdit
              ? `${t("structure.edit_goal_prefix")} ${
                  drawer.context.goalToEdit.id
                }`
              : t("structure.new_goal")
          }
          goalType={drawer.context.goalType}
          goalCategory={drawer.context.goalCategory}
          isOpen={drawer.isDrawerOpen}
          onClose={onCloseDrawer}
          goalToEdit={drawer.context.goalToEdit}
        />
      )}

      {costTimeModal && costTimeModal.isOpen && (
        <SetEpicCostTime
          items={costTimeModal.goals}
          scopeId={scope.id}
          scopeType={GoalTypeEnum.GOAL as unknown as number}
          upperIsMonetary={costTimeModal.upperIsMonetary}
          postfix={costTimeModal.postfix}
          close={() => handleCostTimeModalClose(false)}
          refresh={() => handleCostTimeModalClose(true)}
        />
      )}

      {deleteModal.isOpen && deleteModal.goalToDelete && (
        <DeleteConfirmationModal
          itemName={deleteModal.goalToDelete.key || deleteModal.goalToDelete.id}
          onClose={deleteModal.onClose}
          onConfirm={deleteModal.onConfirm}
        />
      )}

      {setValuesModal && setValuesModal.isOpen && (
        <SetValues
          goal_tier_id={setValuesModal.goal_tier_id}
          goals={setValuesModal.goals}
          close={handleCloseSetValuesModal}
          refresh={handleRefreshData}
        />
      )}

      {/* Translated Debug Title */}
      {/* <h2 style={{ marginTop: "30px" }}>{t("structure.debug_title")}</h2>
      <pre style={{ backgroundColor: "#f4f4f4", padding: "10px" }}>
        {JSON.stringify(allGoals, null, 2)}
      </pre> */}
    </div>
  );
};
