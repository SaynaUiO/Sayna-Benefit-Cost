import { useEffect, useMemo, useState } from "react";
import { SelectGoalCollections } from "../../Components/Estimation/SelectGoalCollections";
import { Loading } from "../../Components/Common/Loading";
import Button from "@atlaskit/button";
import EmptyState from "@atlaskit/empty-state";
import { useNavigate } from "react-router-dom";
import { useAPI } from "../../Contexts/ApiContext";
import { useAppContext } from "../../Contexts/AppContext";
import PageHeader from "@atlaskit/page-header";
import { EstimationContainer } from "./EstimationContainer";
import { EstimationContextProvider } from "./EstimationContext";
import { GoalTier, EstimationMode, EstimationProps } from "../../Models";
import { Spotlight, SpotlightTransition } from "@atlaskit/onboarding";
import CrossIcon from "@atlaskit/icon/glyph/cross";

export const Estimation = () => {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [goalTier, setGoalTier] = useState<GoalTier>();
  const [upperGoalTier, setUpperGoalTier] = useState<GoalTier>();
  const [estimationProps, setEstimationProps] =
    useState<EstimationProps<EstimationMode>>();
  const [error, setError] = useState<string>();

  const navigate = useNavigate();
  const [scope] = useAppContext();
  const api = useAPI();
  const [isOnboardingCompleted, setOnboardingCompleted] =
    useState<boolean>(true);
  const [activeSpotlight, setActiveSpotlight] = useState<null | number>(null);
  const next = () => setActiveSpotlight((activeSpotlight || 0) + 1);
  const back = () => setActiveSpotlight((activeSpotlight || 1) - 1);
  const end = () => {
    api.onboarding.setOnboardingComplete(true);
    setActiveSpotlight(0);
    setOnboardingCompleted(true);
  };
  const navToAnalysis = () => {
    // Hvis dette er siste spotlight
    navigate("../analysis");
  };

  useEffect(() => {
    let isMounted = true;
    if (goalTier && upperGoalTier) {
      setEstimationProps(undefined);
      setLoading(true);
      api.estimation
        .getEstimationProps(goalTier, upperGoalTier)
        .then((response) => {
          if (isMounted) {
            setEstimationProps(response);
          }
          setLoading(false);
        })
        .catch((error) => {
          if (error.message === "string") {
            setError(error.message);
          } else {
            setError("Something went wrong, please try again later");
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [goalTier, upperGoalTier]);

  const displayError = useMemo(() => {
    if (error && goalTier && upperGoalTier) {
      if (error.includes(upperGoalTier.name)) {
        return (
          <EmptyState
            header={`${upperGoalTier.name} has no goals`}
            description="You can add goals by clicking the button below"
            headingLevel={2}
            primaryAction={
              <Button
                appearance="primary"
                onClick={() => navigate(`..//${upperGoalTier.id}/create-goal`)}
              >
                Add Goals
              </Button>
            }
          />
        );
      } else if (error.includes(goalTier.name)) {
        if (goalTier.scopeId === scope.id) {
          return (
            <EmptyState
              header={`${goalTier.name} has no goals`}
              description="You can add goals by clicking the button below"
              headingLevel={2}
              primaryAction={
                <Button
                  appearance="primary"
                  onClick={() => navigate(`../goal-structure`)}
                >
                  Add Goals
                </Button>
              }
            />
          );
        } else {
          return (
            <EmptyState
              header={`${goalTier.name} has no goals`}
              description="To evaluate this goal collection, you need to add goals to it"
            />
          );
        }
      }
    }
    return (
      <EmptyState header={`Something went wrong, or there are ny goals`} />
    );
  }, [error]);

  //Fortsetter Onboarding:
  useEffect(() => {
    // Sjekk om onboardingen er fullført
    api.onboarding.isOnboardingComplete().then((completed: boolean) => {
      if (!completed) {
        // Hvis IKKE fullført, start Estimation-spesifikke spotlights her
        setActiveSpotlight(0);
      }
    });
  }, [api]);

  const renderActiveSpotlight = () => {
    const spotlights = [
      <Spotlight
        actionsBeforeElement="10/120"
        headingAfterElement={
          <Button
            iconBefore={<CrossIcon size="small" label="end" />}
            appearance="subtle"
            onClick={() => end()}
          />
        }
        actions={[
          {
            onClick: () => next(),
            text: "Next",
          },
          {
            onClick: () => next(),
            text: "neste",
            appearance: "subtle",
          },
        ]}
        heading="Relasjon evaluering"
        target="relation"
        key="relation"
      >
        Her velger du hvilken relasjon du ønsker å evaluere for å legge til
        nyttepoeng.
      </Spotlight>,
      <Spotlight
        actionsBeforeElement="11/20"
        headingAfterElement={
          <Button
            iconBefore={<CrossIcon size="small" label="end" />}
            appearance="subtle"
            onClick={() => end()}
          />
        }
        actions={[
          {
            onClick: () => next(),
            text: "Next",
          },
          {
            onClick: () => next(),
            text: "neste",
            appearance: "subtle",
          },
        ]}
        heading="Fordel nyttepoeng"
        target="estimation-table"
        key="estimation-table"
      >
        I denne tabellen fordeler du nyttepoeng til hver oppgave for å vurdere
        hvor mye den bidrar til oppnåelsen av målene.
      </Spotlight>,
      <Spotlight
        actionsBeforeElement="12/20"
        headingAfterElement={
          <Button
            iconBefore={<CrossIcon size="small" label="end" />}
            appearance="subtle"
            onClick={() => end()}
          />
        }
        actions={[
          {
            onClick: () => navToAnalysis(),
            text: "Fortsett i periodisering ->",
          },
          {
            onClick: () => back(),
            text: "Back",
            appearance: "subtle",
          },
        ]}
        heading="Periodisering"
        target="analysis"
        key="analysis"
      >
        Videre har vi periodisering, som brukes til å fordele nyttepoengene over
        tid for å vise når verdien forventes realisert.
      </Spotlight>,
    ];

    if (activeSpotlight === null) {
      return null;
    }

    return spotlights[activeSpotlight];
  };

  return (
    <>
      {activeSpotlight !== null && (
        <SpotlightTransition>{renderActiveSpotlight()}</SpotlightTransition>
      )}
      <PageHeader
        bottomBar={
          <SelectGoalCollections
            isDisabled={isLoading}
            onChange={(value) => {
              const { goalTier, upperGoalTier } = value.value;
              setGoalTier(goalTier);
              setUpperGoalTier(upperGoalTier);
            }}
          />
        }
      >
        Estimering
      </PageHeader>
      {error ? (
        displayError
      ) : (
        <>
          {estimationProps && (
            <EstimationContextProvider estimationProps={estimationProps}>
              <EstimationContainer />
            </EstimationContextProvider>
          )}
          {isLoading && <Loading />}
        </>
      )}

      {/* <pre className="text-xs mt-4 bg-gray-100 p-2">
        {JSON.stringify(upperGoalTier, null, 3)}
      </pre>

      <pre className="text-xs mt-4 bg-gray-100 p-2">
        {JSON.stringify(goalTier, null, 3)}
      </pre> */}
    </>
  );
};
