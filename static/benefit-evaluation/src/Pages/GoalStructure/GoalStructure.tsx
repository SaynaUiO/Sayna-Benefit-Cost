import { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useAppContext } from "../../Contexts/AppContext";
import { useAPI } from "../../Contexts/ApiContext";
import PageHeader from "@atlaskit/page-header";
import { GoalTier } from "../../Models";
import Button from "@atlaskit/button";
import CrossIcon from "@atlaskit/icon/glyph/cross";

import {
  Spotlight,
  SpotlightTransition,
  SpotlightTarget,
} from "@atlaskit/onboarding";

import { GoalStructureContainer } from "../../NewGoalStructure/components/GoalStructureContainer";

export const GoalStructure = () => {
  const [items, setItems] = useState<GoalTier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRankable, setRankable] = useState<boolean>(false);
  const navigate = useNavigate();

  const [scope] = useAppContext();
  const api = useAPI();
  const location = useLocation();
  const refresh = location.state?.refresh;

  //onBorading:
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
  const [isSpotlightActive, setIsSpotlightActive] = useState(false);
  const [dialogPlacement, setDialogPlacement] = useState(0);
  const shiftPlacementOption = () => {
    if (dialogPlacement !== options.length - 1) {
      return setDialogPlacement(dialogPlacement + 1);
    }
    return setDialogPlacement(0);
  };
  const placement = options[dialogPlacement];

  const renderActiveSpotlight = () => {
    const spotlights = [
      <Spotlight
        actionsBeforeElement="1/20"
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
            onClick: () => end(),
            text: "Dismiss",
            appearance: "subtle",
          },
        ]}
        heading="BenefitOKR"
        target="project"
        key="project"
        dialogPlacement={placement as Placement}
      >
        Takk for at du bruker BenefitOKR – et verktøy for Benefits Management
        med OKR. Her får du en kort introduksjon til prosjektsiden.
      </Spotlight>,
      <Spotlight
        actionsBeforeElement="2/20"
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
            onClick: () => back(),
            text: "Back",
            appearance: "subtle",
          },
        ]}
        heading="Introduksjon og hjelp"
        target="introduction-and-help"
        key="introduction-and-help"
      >
        Mer informasjon om hvordan du bruker BenefitOKR finner du under
        Introduksjon.
      </Spotlight>,
      <Spotlight
        actionsBeforeElement="3/20"
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
            onClick: () => back(),
            text: "Back",
            appearance: "subtle",
          },
        ]}
        heading="Målstruktur"
        target="goal-structure"
        key="goal-structure"
        dialogPlacement={placement as Placement}
      >
        Denne siden lar deg vise og administrere alle målsamlinger. Strukturen
        følger OKR-rammeverket med tre tabeller: Formål (Objective), Planlagte
        nyttevirkninger (Key Results) og Produkt/Epic (Initiatives).
      </Spotlight>,
      <Spotlight
        actionsBeforeElement="4/20"
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
            onClick: () => back(),
            text: "Back",
            appearance: "subtle",
          },
        ]}
        heading="Formål"
        target="inline-text"
        key="inline-text"
        dialogPlacement={placement as Placement}
      >
        Skriv formålet med prosjektet direkte i feltet, og trykk på "✓" når du
        er ferdig.
      </Spotlight>,
      <Spotlight
        actionsBeforeElement="5/20"
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
            onClick: () => back(),
            text: "Back",
            appearance: "subtle",
          },
        ]}
        heading="Opprette mål"
        target="add-goal"
        key="add-goal"
        dialogPlacement={placement as Placement}
      >
        Under Handlinger finner du et pluss-tegn i hver av de tre tabellene. Ved
        å trykke på dette kan du opprette mål som hører til den aktuelle
        tabellen.
        <br></br>
        Test det ut nå, trykk på "+"
      </Spotlight>,
      <Spotlight
        actionsBeforeElement="6/20"
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
            onClick: () => back(),
            text: "Back",
            appearance: "subtle",
          },
        ]}
        heading="Rediger/slett"
        target="edit/delete-goal"
        key="edit/delete-goal"
        dialogPlacement={placement as Placement}
      >
        Her kan du redigere eller slette et mål du har opprettet.
      </Spotlight>,
      <Spotlight
        actionsBeforeElement="7/20"
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
            onClick: () => back(),
            text: "Back",
            appearance: "subtle",
          },
        ]}
        heading="Kostnad/tid"
        target="cost/time"
        key="cost/time"
        dialogPlacement={placement as Placement}
      >
        For hvert produkt (Epic) kan du fordele kostnader og legge til tidsbruk.
      </Spotlight>,
      <Spotlight
        actionsBeforeElement="8/20"
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
            onClick: () => back(),
            text: "Back",
            appearance: "subtle",
          },
        ]}
        heading="Vekt for Formål"
        target="formaal-weight"
        key="formaal-weight"
        dialogPlacement={placement as Placement}
      >
        Det samme ikonet er tilgjengelig for Formål, men her kan du fordele
        nyttepoeng direkte siden Formål representerer det øverste nivået i
        målstrukturen og dermed ikke har et overordnet hierarkisk nivå.
      </Spotlight>,
      <Spotlight
        actionsBeforeElement="9/20"
        headingAfterElement={
          <Button
            iconBefore={<CrossIcon size="small" label="end" />}
            appearance="subtle"
            onClick={() => end()}
          />
        }
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
        dialogPlacement={placement as Placement}
      >
        Resten av nyttepoengen fordeles i Estimerings fanen.
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
