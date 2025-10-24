//Filen som samler alt sammen og brukes i GoalStructure.tsx for å få det opp på skjermen

import { GoalTier, GoalTypeEnum } from "../../Models";

import { EpicTableTree } from "./Tables/ProductTableTree";
import { ObjectiveTableTree } from "./Tables/ObjectiveTableTree";
import { BenefitTableTree } from "./Tables/BenefitTableTree";
import GoalDrawer from "./GoalDrawer";
import { SetEpicCostTime } from "../../Pages/GoalTiers/SetEpicCostTime";
import { useGoalStructure } from "../hooks/useGoalStructure";
import {
  Spotlight,
  SpotlightTransition,
  SpotlightTarget,
} from "@atlaskit/onboarding";
import { useEffect, useState } from "react";
import { useAPI } from "../../Contexts/ApiContext";
import { useLocation } from "react-router-dom";
import { css, cssMap, jsx } from "@atlaskit/css";

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
  } = useGoalStructure();

  // Destrukturer handlers for renere bruk
  const {
    handleAddGoal,
    handleEditGoal,
    handleDeleteGoal,
    onCloseDrawer,
    handleSetCostTime,
    handleCostTimeModalClose,
  } = handlers;

  // --- ONBOARDING OG---
  const [getLoading, setLoading] = useState<boolean>(true);
  const [isRankable, setRankable] = useState<boolean>(false);
  const [items, setItems] = useState<GoalTier[]>([]);
  const [isOnboardingCompleted, setOnboardingCompleted] =
    useState<boolean>(true);
  const [activeSpotlight, setActiveSpotlight] = useState<null | number>(0);
  const next = () => setActiveSpotlight((activeSpotlight || 0) + 1);
  const back = () => setActiveSpotlight((activeSpotlight || 1) - 1);
  const end = () => {
    api.onboarding.setOnboardingComplete(true);
    setActiveSpotlight(0);
    setOnboardingCompleted(true);
  };
  const location = useLocation();
  const refresh = location.state?.refresh;
  const api = useAPI();

  const fetchData = async () => {
    return api.goalTier
      .getAll(scope.id, scope.type)
      .then((response) => {
        return response.reverse();
      })
      .catch((error) => {
        console.error(error);
        return [];
      });
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setRankable(false);
    fetchData().then((items) => {
      if (isMounted) {
        api.onboarding
          .isOnboardingComplete()
          .then((completed: boolean) => {
            setOnboardingCompleted(completed);
          })
          .catch((_) => {});
        setItems(items);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [refresh]);

  type Placement = (typeof options)[number];

  const options = [
    "top right",
    "top center",
    "top left",
    "right bottom",
    "right middle",
    "right top",
    "bottom left",
    "bottom center",
    "bottom right",
    "left top",
    "left middle",
    "left bottom",
  ] as const;

  const [dialogPlacement, setDialogPlacement] = useState(0);
  const placement = options[dialogPlacement];

  const renderActiveSpotlight = () => {
    const spotlights = [
      <Spotlight
        actions={[
          {
            onClick: () => next(),
            text: "Next",
          },
          {
            onClick: () => back(),
            text: "Back",
            appearance: "subtle",
          },
        ]}
        heading="Målstruktur"
        target="goal-structure"
        key="goal-structure"
      >
        Denne siden viser og administrerer alle målsamlinger. Den er strukturert
        i OKR form med tre tabeller: Formål (Objective), Planlagte
        Nyttevirkninger (Key Results), og Produkt (Epic).
      </Spotlight>,
      <Spotlight
        actions={[
          {
            onClick: () => next(),
            text: "Next",
          },
          {
            onClick: () => back(),
            text: "Back",
            appearance: "subtle",
          },
        ]}
        heading="Formål"
        target="inline-text"
        key="inline-text"
      >
        Her kan du skrive formålet med prosjektet direkte i feltet. Trykk på
        "✓"-symbolet når du er ferdig.
      </Spotlight>,
      <Spotlight
        actions={[
          {
            onClick: () => next(),
            text: "Next",
          },
          {
            onClick: () => back(),
            text: "Back",
            appearance: "subtle",
          },
        ]}
        heading="Legg til"
        target="add-goal"
        key="add-goal"
        dialogPlacement={placement as Placement}
      >
        Under "Handlinger" finner du et pluss-tegn i hver av de tre tabellene.
        Ved å trykke på denne kan du opprette mål som hører til den aktualle
        tabellen.
      </Spotlight>,
      <Spotlight
        actions={[
          {
            onClick: () => next(),
            text: "Next",
          },
          {
            onClick: () => back(),
            text: "Back",
            appearance: "subtle",
          },
        ]}
        heading="Rediger og slett et mål "
        target="edit/delete-goal"
        key="edit/delete-goal"
        dialogPlacement={placement as Placement}
      >
        Her kan du redigere og slette et mål du har laget.
      </Spotlight>,
      <Spotlight
        actions={[
          {
            onClick: () => next(),
            text: "Next",
          },
          {
            onClick: () => back(),
            text: "Back",
            appearance: "subtle",
          },
        ]}
        heading="Legg til kostnad og tid verdier"
        target="cost/time"
        key="cost/time"
        dialogPlacement={placement as Placement}
      >
        For et produkt kan du fordele kostnader og legge til tid.
      </Spotlight>,
      <Spotlight
        actions={[
          { onClick: () => end(), text: "OK" },
          {
            onClick: () => back(),
            text: "Go back",
            appearance: "subtle",
          },
        ]}
        heading="Restart Onboarding"
        target="start-onboarding"
        key="start-onboarding"
      >
        You can restart this onboarding at any time by pressing this help icon.
      </Spotlight>,
    ];

    if (activeSpotlight === null) {
      return null;
    }

    return spotlights[activeSpotlight];
  };

  // --- RENDERING ---

  if (loading) {
    return <div>Laster målstruktur...</div>;
  }

  return (
    <>
      {!isOnboardingCompleted && (
        <SpotlightTransition>{renderActiveSpotlight()}</SpotlightTransition>
      )}

      <div style={{ padding: "2px" }}>
        {/* Mål Tabell (Objective) */}
        <ObjectiveTableTree
          data={formaalGoals}
          onAddGoal={(goalCollectionId) =>
            handleAddGoal("Objective", goalCollectionId)
          }
          onEditGoal={handleEditGoal}
          onDeleteGoal={handleDeleteGoal}
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
          onDeleteGoal={handleDeleteGoal}
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
            onDeleteGoal={handleDeleteGoal}
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

        {/* Debug Output */}
        <h2 style={{ marginTop: "30px" }}>Alle Hentede Goals (DEBUG)</h2>
        <pre style={{ backgroundColor: "#f4f4f4", padding: "10px" }}>
          {JSON.stringify(allGoals, null, 2)}
        </pre>
      </div>
    </>
  );
};
