import { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useAppContext } from "../../Contexts/AppContext";
import { useAPI } from "../../Contexts/ApiContext";
import PageHeader from "@atlaskit/page-header";
import { GoalTier } from "../../Models";

import {
  Spotlight,
  SpotlightTransition,
  SpotlightTarget,
} from "@atlaskit/onboarding";

import { GoalStructureContainer } from "../../SaynaSineFiler/components/GoalStructureContainer";

export const GoalStructure = () => {
  const [items, setItems] = useState<GoalTier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRankable, setRankable] = useState<boolean>(false);
  const navigate = useNavigate();

  const [scope] = useAppContext();
  const api = useAPI();
  const location = useLocation();
  const refresh = location.state?.refresh;

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
  const navToEstimation = () => {
    // Hvis dette er siste spotlight
    navigate("../estimation");
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
        heading="BenefitOKR"
        target="project"
        key="project"
      >
        Takk for at du bruker Benefit Management med OKR (BenefitOKR). En kort
        introduksjon av prosjektsiden vil nå presenteres.
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
        heading=""
        target="add-goal"
        key="add-goal"
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
      >
        For et produkt kan du fordele kostnader og legge til tid.
      </Spotlight>,

      <Spotlight
        actions={[
          {
            onClick: () => {
              navToEstimation();
            },
            text: "Fortsett i estimering ->",
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
      <PageHeader>Målstruktur</PageHeader>
      <GoalStructureContainer />
    </>
  );
};
