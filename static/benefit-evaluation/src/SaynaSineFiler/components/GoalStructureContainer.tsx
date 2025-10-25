//Filen som samler alt sammen og brukes i GoalStructure.tsx for å få det opp på skjermen

import { GoalTypeEnum } from "../../Models";

import { EpicTableTree } from "./Tables/ProductTableTree";
import { ObjectiveTableTree } from "./Tables/ObjectiveTableTree";
import { BenefitTableTree } from "./Tables/BenefitTableTree";
import GoalDrawer from "./GoalDrawer";
import { SetEpicCostTime } from "../../Pages/GoalTiers/SetEpicCostTime";
import { useGoalStructure } from "../hooks/useGoalStructure";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

export const GoalStructureContainer = () => {
  const {
    loading,
    epicGoals,
    formaalGoals,
    effektGoals,
    handlers,
    drawer,
    costTimeModal,
    scope,
    allGoals,
    deleteModal,
  } = useGoalStructure();

  // Destrukturer handlers for renere bruk
  const {
    handleAddGoal,
    handleEditGoal,
    onCloseDrawer,
    handleSetCostTime,
    handleCostTimeModalClose,
    onDeleteGoal,
  } = handlers;

  // --- RENDERING ---

  if (loading) {
    return <div>Laster målstruktur...</div>;
  }

  return (
    <div style={{ padding: "2px" }}>
      {/* Mål Tabell (Objective) */}
      <ObjectiveTableTree
        data={formaalGoals}
        onAddGoal={(goalCollectionId) =>
          handleAddGoal("Objective", goalCollectionId)
        }
        onEditGoal={handleEditGoal}
        onDeleteGoal={onDeleteGoal}
      />
      <br />

      {/* Effekt Tabell (Benefit) */}
      <BenefitTableTree
        data={effektGoals}
        onAddGoal={
          (
            _parentId,
            goalCollectionId // Tar nå imot to argumenter
          ) => handleAddGoal("Benefit", goalCollectionId) // Bruker den faktiske Collection ID'en
        }
        onEditGoal={handleEditGoal}
        onDeleteGoal={onDeleteGoal}
      />
      <br />

      {/* Produkt/Epic Tabell */}
      <div style={{ marginBottom: "40px" }}>
        <EpicTableTree
          data={epicGoals}
          onAddGoal={(_parentId, goalCollectionId) =>
            // Bruk gjerne den mottatte ID'en (goalCollectionId) for bedre praksis,
            // men hardkodingen din fungerer også her:
            handleAddGoal("Product", goalCollectionId)
          }
          onEditGoal={handleEditGoal}
          onDeleteGoal={onDeleteGoal}
          onSetCostTime={handleSetCostTime}
        />
      </div>

      {/* Drawer */}
      {drawer.isDrawerOpen && drawer.context && (
        <GoalDrawer
          title={
            drawer.context.goalToEdit
              ? `Rediger ${drawer.context.goalToEdit.id}`
              : `Nytt Mål`
          }
          goalType={drawer.context.goalType}
          goalCategory={drawer.context.goalCategory}
          isOpen={drawer.isDrawerOpen}
          onClose={onCloseDrawer}
          goalToEdit={drawer.context.goalToEdit}
        />
      )}

      {/* Cost/Time Modal */}
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

      {/* Delete Modal */}
      {deleteModal.isOpen && deleteModal.goalToDelete && (
        <DeleteConfirmationModal
          itemName={deleteModal.goalToDelete.key || deleteModal.goalToDelete.id}
          onClose={deleteModal.onClose} // closeDeleteModal (Lukker modalen)
          onConfirm={deleteModal.onConfirm} // handleDeleteGoalConfirm (Utfører sletting)
        />
      )}

      {/* Debug Output */}
      <h2 style={{ marginTop: "30px" }}>Alle Hentede Goals (DEBUG)</h2>
      <pre style={{ backgroundColor: "#f4f4f4", padding: "10px" }}>
        {JSON.stringify(allGoals, null, 2)}
      </pre>
    </div>
  );
};
