import Button from "@atlaskit/button";
import { Inline } from "@atlaskit/primitives";
import { useAlert } from "../../Contexts/AlertContext";
import { useAPI } from "../../Contexts/ApiContext";
import { useAppContext } from "../../Contexts/AppContext";

export const DisconnectProject = () => {

  const { showAlert } = useAlert();
  const [scope] = useAppContext();
  const api = useAPI();

  const disconnect = () => {
    showAlert({
      title: "Disconnect Project",
      body: `Are you sure you want to disconnect ${scope.name} from a portfolio?`,
      confirmText: "Disconnect",
      onConfirm: async () => {
        return api.project.disconnect(scope.id)
        .catch((error) => {
          console.error(error)
        })
      },
      onCancel: () => {}
    });
  }

  return(
    <Inline space="space.300" spread="space-between">
      <h4>Disconnect Project From Portfolio</h4>
      <Button onClick={() => disconnect()}>Disconnect</Button>
    </Inline>
  )
}