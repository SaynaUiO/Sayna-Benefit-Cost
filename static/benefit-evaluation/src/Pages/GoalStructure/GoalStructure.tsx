import Button, { ButtonGroup } from "@atlaskit/button";
import { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import DynamicTable from "@atlaskit/dynamic-table";
import { useAppContext } from "../../Contexts/AppContext";
import { useAPI } from "../../Contexts/ApiContext";
import { GoalTierHead } from "../../Components/GoalStructure/GoalTierHead";
import { GoalTierRows } from "../../Components/GoalStructure/GoalTierRows";
import PageHeader from "@atlaskit/page-header";
import {
  GoalTier,
  GoalCollection,
  Goal,
  balancedPointsEnum,
} from "../../Models";
import { SelectGoalTier } from "../../Components/GoalTiers/SelectGoalTier";
import { GoalTable } from "../../Components/GoalTiers/GoalTable";
import {
  Spotlight,
  SpotlightTransition,
  SpotlightTarget,
} from "@atlaskit/onboarding";
import { AdminGoalCollection } from "./AdminGoalCollection";
import { DeleteGoalCollection } from "./DeleteGoalCollection";

//Sayna Inports:
import NewGoalTierButton from "../../SaynaSineFiler/NewGoalTierButton";
import GoalTierTableTree from "../../SaynaSineFiler/GoalTierTableTree";
import { GOAL_TYPE_DROPDOWN_ITEMS } from "../../SaynaSineFiler/goalDropdownItems";

// * Goal Tier
type option = {
  label: string;
  value: GoalCollection;
};

export const GoalStructure = () => {
  const [items, setItems] = useState<GoalTier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRankable, setRankable] = useState<boolean>(false);

  const [selectedOption, setSelectedOption] = useState<option>();
  const [isFetching, setFetching] = useState<boolean>(false);

  const [upperIsMonetary, setIsUpperMonetary] = useState<boolean>(false);
  const [postfix, setPostfix] = useState<string>("$");

  // * Open panes
  const [showCreateGoalCollection, setShowCreateGoalCollection] =
    useState<boolean>(false);
  const [showEditGoalCollection, setShowEditGoalCollection] =
    useState<boolean>(false);
  const [editGoalCollection, setEditGoalCollection] = useState<GoalTier | null>(
    null
  );
  const [showDeleteGoalCollection, setShowDeleteGoalCollection] =
    useState<boolean>(false);
  const [deleteGoalCollection, setDeleteGoalCollection] =
    useState<GoalTier | null>(null);

  const [scope] = useAppContext();
  const api = useAPI();
  const location = useLocation();
  const refresh = location.state?.refresh;
  const navigation = useNavigate();

  useEffect(() => {
    const setValuesMonetaryAndPostfix = async () => {
      if (items.length >= 2) {
        const upGoals: Goal[] = await api.goal.getAll(
          items[0].scopeId,
          items[0].id
        );

        const upIsMonetary = upGoals.some(
          (goal) => goal.balancedPoints?.type === balancedPointsEnum.MONETARY
        );
        if (upIsMonetary) setPostfix(upGoals[0].balancedPoints?.postFix || "$");
        setIsUpperMonetary(upIsMonetary);
      }
    };
    setValuesMonetaryAndPostfix();
  }, [items]);

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

  const onRankEnd = (params: any) => {
    if (!params.destination || params.sourceKey === params.destination.afterKey)
      return;
    navigation(
      `change-rank/${params.sourceKey}/${params.destination?.afterKey}`
    );
  };

  const rows = useCallback(() => {
    return GoalTierRows(
      items,
      isRankable,
      setSelectedOption,
      setShowEditGoalCollection,
      setEditGoalCollection,
      setShowDeleteGoalCollection,
      setDeleteGoalCollection
    );
  }, [
    items,
    isRankable,
    setSelectedOption,
    setShowEditGoalCollection,
    setEditGoalCollection,
    setShowDeleteGoalCollection,
    setDeleteGoalCollection,
  ]);

  const actions = (
    <ButtonGroup>
      <SpotlightTarget name="create-goal-collection">
        <Button
          appearance="primary"
          onClick={() => setShowCreateGoalCollection(true)}
        >
          New Goal Collection
        </Button>
      </SpotlightTarget>
      <Button
        isSelected={isRankable}
        isDisabled={!items || items.length < 3}
        onClick={() => setRankable(!isRankable)}
      >
        Change ranking
      </Button>
    </ButtonGroup>
  );

  // * Onboarding
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

  const renderActiveSpotlight = () => {
    const spotlights = [
      <Spotlight
        actions={[
          {
            onClick: () => next(),
            text: "Next",
          },
          {
            onClick: () => end(),
            text: "Dismiss",
            appearance: "subtle",
          },
        ]}
        heading="Benefit/Cost"
        target="project"
        key="project"
      >
        Thanks for using Benefit/Cost, a brief introduction of the project pages
        will now follow.
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
        heading="Goal Structure"
        target="goal-structure"
        key="goal-structure"
      >
        View and administrate all the goal collections, set cost and time per
        epic and create goals. A goal structure is a layer/tier of goals, at the
        bottom you can find epics, above that you might find project goals,
        followed by company goals and so on.
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
        heading="Estimation"
        target="estimation"
        key="estimation"
      >
        The estimation tab is used for assigning benefit points to each task.
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
        heading="Analysis"
        target="analysis"
        key="analysis"
      >
        View an analysis of graphs and a table over all the entered values and
        sort by the preferred metric. Graphs like burndown chart, timeline
        chart.
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
        heading="Create Goal Collection"
        target="create-goal-collection"
        key="create-goal-structure"
      >
        Use this button to create new goal collections such as a collection for
        project goals.
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
        heading="Manage Goals/Objectives"
        target="set-costs-time"
        key="set-costs-time"
      >
        Create new goals by selecting a tier above tier 1, then you can create,
        manage, delete and set values.
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
        heading="Set Cost and Time"
        target="set-costs-time"
        key="set-costs-time"
      >
        By selecting goal Tier 1 you can set the cost and time for each epic.
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
        heading="Introduction and Help"
        target="introduction-and-help"
        key="introduction-and-help"
      >
        More information about how to use Benefit/Cost can be found on the
        introduction page.
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
        heading="Settings"
        target="settings"
        key="settings"
      >
        The settings for what issue type to target and what fields can be
        changed at any time in the settings.
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
        target="restart-onboarding"
        key="restart-onboarding"
      >
        You can restart this onboarding at any time by pressing this help icon.
      </Spotlight>,
    ];

    if (activeSpotlight === null) {
      return null;
    }

    return spotlights[activeSpotlight];
  };

  return (
    <>
      {!isOnboardingCompleted && (
        <SpotlightTransition>{renderActiveSpotlight()}</SpotlightTransition>
      )}
      <PageHeader actions={actions}>Goal Structure</PageHeader>
      <DynamicTable
        head={GoalTierHead()}
        rows={rows()}
        page={1}
        isRankable={isRankable}
        onRankEnd={(params) => {
          onRankEnd(params);
        }}
        loadingSpinnerSize="large"
        isLoading={loading}
      />
      <Outlet />
      {/* Goal Tier */}
      {items.length !== 0 && <PageHeader>Manage Goal Collections</PageHeader>}

      <SelectGoalTier
        isDisabled={isFetching}
        onChange={(value) => {
          setSelectedOption(value);
        }}
        selectedOption={selectedOption}
        setSelectedOption={(option: option) => setSelectedOption(option)}
        goalTiers={items}
      />

      {selectedOption && (
        <GoalTable
          goalTier={selectedOption.value}
          isHighestGoalTier={
            items.length > 0 && selectedOption.value.id === items[0].id
          }
          upperIsMonetary={upperIsMonetary}
          postfix={postfix}
          onFetching={(isFetching) => setFetching(isFetching)}
        />
      )}

      {showCreateGoalCollection && (
        <AdminGoalCollection
          mode="create"
          goal_collection={null}
          close={(refresh: boolean) => {
            setShowCreateGoalCollection(false);
            if (refresh) {
              setLoading(true);
              setRankable(false);
              fetchData().then((items) => {
                setItems(items);
                setLoading(false);
              });
            }
          }}
        />
      )}

      {showEditGoalCollection && editGoalCollection && (
        <AdminGoalCollection
          mode="edit"
          goal_collection={editGoalCollection}
          close={(refresh: boolean) => {
            setShowEditGoalCollection(false);
            setEditGoalCollection(null);
            if (refresh) {
              setLoading(true);
              setRankable(false);
              fetchData().then((items) => {
                setItems(items);
                setLoading(false);
              });
            }
          }}
        />
      )}

      {showDeleteGoalCollection && deleteGoalCollection && (
        <DeleteGoalCollection
          goal_collection_id={deleteGoalCollection.id}
          name={deleteGoalCollection.name}
          close={(refresh: boolean) => {
            setShowDeleteGoalCollection(false);
            setDeleteGoalCollection(null);
            if (refresh) {
              setLoading(true);
              setRankable(false);
              fetchData().then((items) => {
                setItems(items);
                setLoading(false);
              });
            }
          }}
        />
      )}

      <div>
        {/* This is the button "Nytt Mål Nivå" */}
        <NewGoalTierButton
          buttonLabel="Nytt mål nivå"
          dropdownItems={GOAL_TYPE_DROPDOWN_ITEMS}
          onSave={(type) => {
            console.log("Saving new goal tier:", type);
            // Logic to save the new goal tier
          }}
          isPrimary={true}
        />

        {/* This is the table three */}
        <GoalTierTableTree />
      </div>
    </>
  );
};
