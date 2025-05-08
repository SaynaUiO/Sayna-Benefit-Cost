import Button from "@atlaskit/button";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../../Contexts/AlertContext";
import { useAPI } from "../../Contexts/ApiContext";
import { Inline } from "@atlaskit/primitives";
import { useAppContext } from "../../Contexts/AppContext";


export const ResetProject = () => {

  const { showAlert } = useAlert();

  const [scope] = useAppContext();

  const api = useAPI();
  const navigate = useNavigate();

  const reset = () => {
    showAlert({
      title: "Reset Project",
      body: `Are you sure you want to reset ${scope.name}?`,
      confirmText: "Reset",
      onConfirm: async () => {
        return api.project.reset(scope.id).then(() => {
          navigate("/");
        }).catch((error) => {
          console.error(error)
        });
      },
      onCancel: () => {}
    });
  }
  
  return(
    <Inline space="space.300" spread="space-between">
      <h4>Reset Project</h4>
      <Button onClick={() => reset()}>Reset</Button>
    </Inline>
  )
}