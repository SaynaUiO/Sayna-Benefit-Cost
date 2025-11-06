import Button from "@atlaskit/button";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../../Contexts/AlertContext";
import { useAPI } from "../../Contexts/ApiContext";
import { Inline } from "@atlaskit/primitives";
import { useAppContext } from "../../Contexts/AppContext";

export const ResetEverything = () => {
  const { showAlert } = useAlert();

  const api = useAPI();
  const navigate = useNavigate();

  const reset = () => {
    showAlert({
      title: "Nullstill alt",
      body: "Er du sikker på at du vil tilbakestille hele appen? Dette vil slette ALLE PROSJEKTER og ALL DATA. Denne handlingen kan ikke angres.",
      confirmText: "Nullstill",
      onConfirm: async () => {
        return api.app
          .reset()
          .then(() => {
            navigate("/");
          })
          .catch((error) => {
            console.error(error);
          });
      },
      onCancel: () => {},
    });
  };

  return (
    <Inline space="space.300" spread="space-between">
      <h4>Nullstill alt</h4>
      <Button appearance="danger" onClick={() => reset()}>
        Nullstill
      </Button>
    </Inline>
  );
};
