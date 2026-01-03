import Select from "@atlaskit/select";
import { Stack, Grid, xcss } from "@atlaskit/primitives";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import EmptyState from "@atlaskit/empty-state";
import Button from "@atlaskit/button";
import { useAppContext } from "../../Contexts/AppContext";
import { useAPI } from "../../Contexts/ApiContext";
import { Label } from "@atlaskit/form";
import HipchatChevronDoubleUpIcon from "@atlaskit/icon/glyph/hipchat/chevron-double-up";
import HipchatChevronDoubleDownIcon from "@atlaskit/icon/glyph/hipchat/chevron-double-down";
import Tooltip from "@atlaskit/tooltip";
import { GoalTier } from "../../Models/GoalTierModel";
import { GoalTierTypeEnum } from "../../Models";
import { SpotlightTarget } from "@atlaskit/onboarding";

// Import the translation hook
import { useTranslation } from "@forge/react";

export type GoalTierOption = {
  label: string;
  value: {
    goalTier: GoalTier;
    upperGoalTier: GoalTier;
  };
};

export type SelectGoalCollectionsProps = {
  isDisabled?: boolean;
  onChange: (value: GoalTierOption) => void;
};

export const SelectGoalCollections = ({
  onChange,
  isDisabled,
}: SelectGoalCollectionsProps) => {
  const { t } = useTranslation();
  const [options, setOptions] = useState<GoalTierOption[]>();
  const [isLoading, setLoading] = useState<boolean>(true);
  const [selectedOption, setSelectedOption] = useState<GoalTierOption>();

  const { goal_tier_type, goal_tier_id, upper_goal_tier_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const api = useAPI();
  const [scope] = useAppContext();

  const ChooseGoalTier = (goalTier: GoalTier, upperGoalTier: GoalTier) => {
    navigate(
      `../estimation/${goalTier.type}/${goalTier.id}/${upperGoalTier.id}`,
      { replace: true }
    );
  };

  const fetch = async (): Promise<GoalTierOption[]> => {
    return await api.goalCollection
      .getAll(scope.id)
      .then((goalTiers) => {
        const cleanedGoalTiers = goalTiers.map((tier) => {
          if (tier.id === "root-formaal" && (tier as any).goals) {
            const cleanTier = { ...tier, scopeId: tier.scopeId || scope.id };
            delete (cleanTier as any).goals;
            return cleanTier as GoalTier;
          }
          if (!tier.scopeId) {
            return { ...tier, scopeId: scope.id } as GoalTier;
          }
          return tier;
        });

        // Note: Keeping HIERARCHY_ORDER strings as they match your database/API tier names
        const HIERARCHY_ORDER = ["Formål", "Planlagte Nyttevirkninger", "Epic"];

        cleanedGoalTiers.sort((a, b) => {
          const aIndex = HIERARCHY_ORDER.indexOf(a.name);
          const bIndex = HIERARCHY_ORDER.indexOf(b.name);
          return aIndex - bIndex;
        });

        const estimationOptions: GoalTierOption[] = [];
        for (let index = 0; index < cleanedGoalTiers.length - 1; index++) {
          const lowerGoalTier = cleanedGoalTiers[index + 1];
          const upperGoalTier = cleanedGoalTiers[index];

          const lowerGoalTierName = lowerGoalTier.name || lowerGoalTier.id;
          const upperGoalTierName = upperGoalTier.name || upperGoalTier.id;
          estimationOptions.push({
            label: `${lowerGoalTierName} - ${upperGoalTierName}`,
            value: {
              goalTier: lowerGoalTier,
              upperGoalTier: upperGoalTier,
            },
          });
        }
        return estimationOptions;
      })
      .catch((error) => {
        console.error(error);
        return [];
      });
  };

  useEffect(() => {
    let isMounted = true;
    fetch().then((options) => {
      if (isMounted) setOptions(options);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (options && options.length > 0) {
      const option = options.find(
        (option) =>
          `${option.value.goalTier.type}` === goal_tier_type &&
          `${option.value.goalTier.id}` === goal_tier_id &&
          `${option.value.upperGoalTier.id}` === upper_goal_tier_id
      );
      if (option) {
        setSelectedOption(option);
        setLoading(false);
        onChange(option);
      } else if (options.length === 1) {
        const { goalTier, upperGoalTier: upperGoalTier } = options[0].value;
        ChooseGoalTier(goalTier, upperGoalTier);
        setLoading(false);
      } else if (options.length > 1) {
        const defaultOption = options[options.length - 1];
        const { goalTier, upperGoalTier } = defaultOption.value;
        ChooseGoalTier(goalTier, upperGoalTier);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } else if (options) {
      setLoading(false);
    }
  }, [options, location.pathname]);

  const selectRankAboveCurrent = () => {
    if (options && selectedOption) {
      const index = options.findIndex((option) => option === selectedOption);
      if (index !== 0) {
        const { goalTier, upperGoalTier } = options[index - 1].value;
        ChooseGoalTier(goalTier, upperGoalTier);
      }
    } else if (options && options.length > 0) {
      const { goalTier, upperGoalTier } = options[0].value;
      ChooseGoalTier(goalTier, upperGoalTier);
    }
  };

  const selectRankBelowCurrent = () => {
    if (options && selectedOption) {
      const index = options.findIndex((option) => option === selectedOption);
      if (index !== options.length - 1) {
        const { goalTier, upperGoalTier } = options[index + 1].value;
        ChooseGoalTier(goalTier, upperGoalTier);
      }
    } else if (options && options.length > 0) {
      const { goalTier, upperGoalTier } = options[options.length - 1].value;
      ChooseGoalTier(goalTier, upperGoalTier);
    }
  };

  const getPlaceholder = () => {
    if (isLoading) return t("estimation.select.placeholder_loading");
    if (options && options.length > 0)
      return t("estimation.select.placeholder_select");
    return t("estimation.select.placeholder_empty");
  };

  return (
    <>
      <Stack
        xcss={xcss({
          zIndex: "layer",
          position: "relative",
          marginTop: "1rem",
          marginBottom: "1rem",
          maxWidth: "500px",
        })}
        alignInline="center"
      >
        <Label htmlFor="">{t("estimation.select.label")}</Label>
        <Grid
          xcss={xcss({ width: "100%" })}
          templateColumns="32px 1fr 32px"
          alignItems="center"
          columnGap="space.400"
        >
          <Tooltip content={t("estimation.select.tooltip_down")}>
            <Button
              onClick={() => selectRankBelowCurrent()}
              iconBefore={<HipchatChevronDoubleDownIcon label="Rank down" />}
              isDisabled={
                isLoading ||
                isDisabled ||
                !options ||
                options.length === 0 ||
                selectedOption === options![options!.length - 1]
              }
            />
          </Tooltip>
          <SpotlightTarget name="relation">
            <Select
              inputId="single-select-example"
              className="single-select"
              classNamePrefix="react-select"
              isLoading={isLoading}
              value={selectedOption}
              autoFocus
              onChange={(value) => {
                const option = value as GoalTierOption;
                const { goalTier, upperGoalTier } = option.value;
                ChooseGoalTier(goalTier, upperGoalTier);
              }}
              isDisabled={isLoading || isDisabled}
              options={options}
              placeholder={getPlaceholder()}
            />
          </SpotlightTarget>
          <Tooltip content={t("estimation.select.tooltip_up")}>
            <Button
              onClick={() => selectRankAboveCurrent()}
              iconBefore={<HipchatChevronDoubleUpIcon label="Rank up" />}
              isDisabled={
                isLoading ||
                isDisabled ||
                !options ||
                options.length === 0 ||
                selectedOption === options![0]
              }
            />
          </Tooltip>
        </Grid>
        {selectedOption && (
          <p>
            {Number(goal_tier_type) === GoalTierTypeEnum.ISSUE_TYPE ||
            selectedOption?.value.goalTier.name.toLowerCase().includes("epic")
              ? t("estimation.select.desc_epic")
              : t("estimation.select.desc_benefit")}
          </p>
        )}
      </Stack>
      {options && options.length === 0 && (
        <EmptyState
          header={t("estimation.empty_state.header")}
          description={t("estimation.empty_state.description")}
          headingLevel={2}
          primaryAction={
            <Button
              appearance="primary"
              onClick={() =>
                navigate("../goal-structure/create-goal-collection")
              }
            >
              {t("estimation.empty_state.button")}
            </Button>
          }
        />
      )}
    </>
  );
};
