import { GoalTypeEnum } from "../../Models";
import { EpicTableTree } from "./Tables/ProductTableTree";
import { ObjectiveTableTree } from "./Tables/ObjectiveTableTree";
import { BenefitTableTree } from "./Tables/BenefitTableTree";
import GoalDrawer from "./GoalDrawer";
import { SetEpicCostTime } from "../../Pages/GoalTiers/SetEpicCostTime";
import { useGoalStructure } from "../hooks/useGoalStructure";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { SetValues } from "../../Pages/GoalTiers/SetValues";
import PageHeader from "@atlaskit/page-header";

import React, { useState } from "react";
import { useTranslation } from "@forge/react";
import VisuallyHidden from "@atlaskit/visually-hidden";
import Toggle from "@atlaskit/toggle";
import { Box, Flex, xcss } from "@atlaskit/primitives";

export const GoalStructureContainer = () => {
  const { t } = useTranslation();
  // State for å styre om hjelpetekst skal vises visuelt eller ikke
  const [showHelperText, setShowHelperText] = useState(false);

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
    return <div>{t("structure.loading")}</div>;
  }

  // Hjelpekomponent som aksepterer både tekst og JSX (ReactNode)
  const HeaderText = ({ text }: { text: React.ReactNode }) => {
    const content = (
      <div style={{ color: "#44546F", lineHeight: "1.6" }}>{text}</div>
    );

    return showHelperText ? (
      <Box xcss={xcss({ marginBottom: "space.200", marginTop: "space.100" })}>
        {content}
      </Box>
    ) : (
      <VisuallyHidden>{content}</VisuallyHidden>
    );
  };

  return (
    <>
      {/* Topplinje med overskrift og toggle */}
      <Flex
        justifyContent="space-between"
        alignItems="center"
        xcss={xcss({ marginBottom: "space.300" })}
      >
        <PageHeader>{t("nav.goal_structure")}</PageHeader>

        <Flex alignItems="center">
          <Box xcss={xcss({ marginRight: "space.150" })}>
            <label
              htmlFor="toggle-helper-text"
              style={{ fontSize: "12px", color: "#44546F", fontWeight: 500 }}
            >
              {t("structure.show_helper_text")}
            </label>
          </Box>
          <Toggle
            id="toggle-helper-text"
            isChecked={showHelperText}
            onChange={() => setShowHelperText(!showHelperText)}
          />
        </Flex>
      </Flex>

      {/* --- SEKSJON 1: FORMÅL (OBJECTIVES) --- */}

      <HeaderText
        text={
          <div style={{ maxWidth: "800px", fontSize: "14px" }}>
            <p style={{ marginBottom: "12px" }}>
              {t("structure.purpose.description")}
            </p>

            <p style={{ fontWeight: "bold", marginBottom: "4px" }}>
              {t("structure.purpose.parts_title")}
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px 0" }}>
              <li>{t("structure.purpose.part_1")}</li>
              <li>{t("structure.purpose.part_2")}</li>
            </ul>

            <div
              style={{
                padding: "16px",
                backgroundColor: "#F4F5F7",
                borderRadius: "3px",
                borderLeft: "4px solid #4C9AFF",
                fontSize: "13px",
              }}
            >
              <strong
                style={{
                  fontSize: "14px",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                {t("structure.purpose.example_title")}
              </strong>

              <p style={{ marginBottom: "4px" }}>
                <strong>
                  {t("structure.purpose.example_narrative_label")}
                </strong>
              </p>
              <p style={{ fontStyle: "italic", marginBottom: "12px" }}>
                "{t("structure.purpose.example_narrative_text")}"
              </p>

              <p style={{ marginBottom: "4px" }}>
                <strong>
                  {t("structure.purpose.example_objectives_label")}
                </strong>
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                <li>{t("structure.purpose.example_objective_1")}</li>
                <li>{t("structure.purpose.example_objective_2")}</li>
              </ul>
            </div>
          </div>
        }
      />
      {/* Tabell */}
      <div style={{ padding: "2px" }}>
        {" "}
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
        {/* --- SEKSJON 2: NYTTEVIRKNING (PLANNED BENEFITS) --- */}
        <HeaderText
          text={
            <div style={{ maxWidth: "800px", fontSize: "14px" }}>
              <p style={{ marginBottom: "12px" }}>
                {t("structure.benefits.description")}
              </p>

              <p style={{ fontWeight: "bold", marginBottom: "4px" }}>
                {t("structure.benefits.smarc_title")}
              </p>
              <p
                style={{
                  marginBottom: "16px",
                  fontStyle: "italic",
                  color: "#6B778C",
                }}
              >
                {t("structure.benefits.smarc_list")}
              </p>

              <div
                style={{
                  padding: "16px",
                  backgroundColor: "#F4F5F7",
                  borderRadius: "3px",
                  borderLeft: "4px solid #00B8D9", // En annen farge (Teal/Turkis) for å skille fra Formål
                  fontSize: "13px",
                }}
              >
                <strong
                  style={{
                    fontSize: "14px",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  {t("structure.benefits.example_title")}
                </strong>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: "4px" }}>
                    {t("structure.benefits.example_benefit_1")}
                  </li>
                  <li>{t("structure.benefits.example_benefit_2")}</li>
                </ul>
              </div>
            </div>
          }
        />
        <HeaderText
          text={
            <div style={{ maxWidth: "800px" }}>
              <p>
                {t("structure.benefits.description") ||
                  "Planlagte gevinster (Key Results) som konkretiserer formålet."}
              </p>
            </div>
          }
        />
        {/* Tabell */}
        <BenefitTableTree
          data={benefitGoals}
          onAddGoal={(_parentId, goalCollectionId) =>
            handleAddGoal("Benefit", goalCollectionId)
          }
          onEditGoal={handleEditGoal}
          onDeleteGoal={onDeleteGoal}
        />
        <br />
        <br />
        {/* --- SEKSJON 3: PRODUKT (INITIATIVES) --- */}
        <HeaderText
          text={
            <div style={{ maxWidth: "800px", fontSize: "14px" }}>
              <p style={{ marginBottom: "12px" }}>
                {t("structure.products.description")}
              </p>

              <p style={{ fontWeight: "bold", marginBottom: "4px" }}>
                {t("structure.products.focus_title")}
              </p>
              <p style={{ marginBottom: "16px", color: "#6B778C" }}>
                {t("structure.products.focus_text")}
              </p>

              <div
                style={{
                  padding: "16px",
                  backgroundColor: "#F4F5F7",
                  borderRadius: "3px",
                  borderLeft: "4px solid #FF8B00", // Oransje farge for Produkt/Epic
                  fontSize: "13px",
                }}
              >
                <strong
                  style={{
                    fontSize: "14px",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  {t("structure.products.example_title")}
                </strong>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: "4px" }}>
                    {t("structure.products.example_product_1")}
                  </li>
                  <li>{t("structure.products.example_product_2")}</li>
                </ul>
              </div>
            </div>
          }
        />
        <HeaderText
          text={
            <div style={{ maxWidth: "800px" }}>
              <p>
                {t("structure.products.description") ||
                  "Produkter og tiltak (Initiatives) som skal bidra til å oppnå gevinstene."}
              </p>
            </div>
          }
        />
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
        {/* --- MODALER OG DRAWERS --- */}
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
            itemName={
              deleteModal.goalToDelete.key || deleteModal.goalToDelete.id
            }
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
      </div>
    </>
  );
};
