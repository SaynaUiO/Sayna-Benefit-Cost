import Button from "@atlaskit/button";
import { Inline } from "@atlaskit/primitives";
import { useAlert } from "../../Contexts/AlertContext";
import { useAPI } from "../../Contexts/ApiContext";
import { useAppContext } from "../../Contexts/AppContext";
import { useNavigate } from "react-router-dom";

export const DeletePortfolio = () => {

  const { showAlert } = useAlert();
  const [scope] = useAppContext();
  const api = useAPI();
  const navigate = useNavigate();

  const deletePortfolio = () => {
    showAlert({
      title: `Delete ${scope.name}`,
      body: `Are you sure you want to delete ${scope.name}?`,
      confirmText: "Delete",
      onConfirm: async () => {
        return api.portfolio.delete(scope.id).then(() => (
          navigate(`/`)
        )).catch((error) => {
          console.error(error)
        });
      },
      onCancel: () => {}
    });
  }

  return(
    <Inline space="space.300" spread="space-between">
      <h4>Delete Portfolio</h4>
      <Button onClick={() => deletePortfolio()}>Delete</Button>
    </Inline>
  )
}