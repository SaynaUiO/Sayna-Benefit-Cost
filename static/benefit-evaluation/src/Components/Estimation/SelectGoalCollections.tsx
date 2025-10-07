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

//Denne filen er for nedtrekkslista i Estimates.

export type GoalTierOption = {
  //Et enkelt valg i nedtrakningslista skal ha relasjon GoalTier - UpperGoalTier (Epic-Effect)
  label: string;
  value: {
    goalTier: GoalTier; //Hele verdien til GoalTier
    upperGoalTier: GoalTier; //Hele verdien til GoalTier
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
  const [options, setOptions] = useState<GoalTierOption[]>(); //En liste over tilgjengelige valg Epic-Eff, Eff-Org, Org-Samf
  const [isLoading, setLoading] = useState<boolean>(true); //Om data fortsatt hentes
  const [selectedOption, setSelectedOption] = useState<GoalTierOption>(); //Det alternativet som har blitt valgt, f.eks Epic-Eff

  const { goal_tier_type, goal_tier_id, upper_goal_tier_id } = useParams(); //Henter parameterne fra URL-en (Se mer på dette)
  const location = useLocation(); //Gir tilgang til nåværende url
  const navigate = useNavigate(); //Brukes til å endre URLen (navigere til en side)
  const api = useAPI();
  const [scope] = useAppContext();

  //Denne funksjonen tar to GoalTier objekter og nruker Maps til å sende brukeren til en nyURL.
  // Dette er den primære måten å bytte valgt estimering på. type: 0 for all relevant data
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
        console.log("Rådata fra getAll:", goalTiers);

        //Sorter i riktig girarkisk rekkefølge:
        const HIERARCHY_ORDER = ["Formål", "Effektmål", "Epic"];

        // 3. Sorter validGoalTiers: Formål (0) -> Effektmål (1) -> Epic (2)
        goalTiers.sort((a, b) => {
          const aIndex = HIERARCHY_ORDER.indexOf(a.name);
          const bIndex = HIERARCHY_ORDER.indexOf(b.name);
          return aIndex - bIndex;
        });

        const estimationOptions: GoalTierOption[] = []; //Lager en tom liste
        for (let index = 0; index < goalTiers.length - 1; index++) {
          //Itererer gjennom GoalTiers
          const lowerGoalTier = goalTiers[index + 1]; // Epic (nederst)
          const upperGoalTier = goalTiers[index]; // Effektmål (over)

          // Sørg for at ingen navn er tomme (den defensive fiksingen fra sist)
          const lowerGoalTierName = lowerGoalTier.name || lowerGoalTier.id;
          const upperGoalTierName = upperGoalTier.name || upperGoalTier.id;
          estimationOptions.push({
            label: `${lowerGoalTierName} - ${upperGoalTierName}`, // Epic - Effektmål
            value: {
              goalTier: lowerGoalTier, // Dette er "nedre nivå"
              upperGoalTier: upperGoalTier, // Dette er "øvre nivå"
            },
          });
        }
        //estimationOptions.reverse(); //Reserveres for at høyere nivå skal vises flrst
        console.debug(estimationOptions);
        return estimationOptions;
      })
      .catch((error) => {
        console.error(error);
        return [];
      });
  };

  //Denne hooken kjøres en gnag for å hente datene med fetch
  useEffect(() => {
    console.debug("useEffect");
    let isMounted = true;
    fetch().then((options) => {
      console.debug("awaiting results");
      if (isMounted) setOptions(options);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  //Denne useEffekten prøver å finne et alternativ i options i komponenten selectedOption
  useEffect(() => {
    if (options) {
      if (options.length > 0) {
        const option = options.find(
          //Pørver å finne et alternatv i options som samsvarer med de tre URL-parameterne
          (option) =>
            `${option.value.goalTier.type}` === goal_tier_type &&
            `${option.value.goalTier.id}` === goal_tier_id &&
            `${option.value.upperGoalTier.id}` === upper_goal_tier_id
        );
        //Hvis et treff blir funnet, settes selectedOption, og onChange kalles for å varsle foreldrekomponenten om valget
        if (option) {
          console.debug("Select option with parameters");
          setSelectedOption(option);
          setLoading(false);
          onChange(option);
          //HVis det bare er et alternativ totalt, velges det automatisk, og nvigatsjon startes til den tilhørende urlen vis ChooseGoalTier
        } else if (options.length === 1) {
          console.debug("Selecting only option");
          const { goalTier, upperGoalTier: upperGoalTier } = options[0].value;
          ChooseGoalTier(goalTier, upperGoalTier);
          setLoading(false);
        } else {
          console.debug("No option selected");
          setLoading(false);
        }
      } else {
        console.debug("No options");
        setLoading(false);
      }
    }
  }, [options, location.pathname]);

  //Navigasjonsfunksjon:  (kanskje fjerne dette)
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

  //Brukergrensesnitt:
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
        <Label htmlFor="">Select which goal tiers you want to evaluate</Label>
        <Grid
          xcss={xcss({ width: "100%" })}
          templateColumns="32px 1fr 32px"
          alignItems="center"
          columnGap="space.400"
        >
          <Tooltip content="Evaluate One Rank Down">
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
            placeholder={
              isLoading
                ? "Loading..."
                : options && options.length > 0
                ? "Select which tiers to evaluate"
                : "No goal collections found"
            }
          />
          <Tooltip content="Evaluate One Rank Up">
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
            Assign benefit points to the{" "}
            {Number(goal_tier_type) === GoalTierTypeEnum.ISSUE_TYPE
              ? `epics`
              : `${selectedOption?.value.goalTier.name} goals`}{" "}
            indicating how much each{" "}
            {Number(goal_tier_type) === GoalTierTypeEnum.ISSUE_TYPE
              ? "epic"
              : "goal"}{" "}
            contributes to the "{selectedOption?.value.upperGoalTier.name}"
            goals on the tier above.
          </p>
        )}
      </Stack>
      {options && options.length === 0 && (
        <EmptyState
          header="Could not find any goal collections"
          description="You can create goals collections by clicking the button below"
          headingLevel={2}
          primaryAction={
            <Button
              appearance="primary"
              onClick={() =>
                navigate("../goal-structure/create-goal-collection")
              }
            >
              Create Goal Collections
            </Button>
          }
        />
      )}
    </>
  );
};
