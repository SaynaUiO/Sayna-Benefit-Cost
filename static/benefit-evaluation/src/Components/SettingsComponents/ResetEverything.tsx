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
      title: "Reset Everything",
      body: "Are you sure you want to reset the entire app? This includes ALL PROJECTS and ALL DATA. This action cannot be undone.",
      confirmText: "Reset",
      onConfirm: async () => {
        return api.app.reset().then(() => {
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
      <h4>Reset Everything</h4>
      <Button appearance='danger' onClick={() => reset()}>Reset</Button>
    </Inline>
  )
}