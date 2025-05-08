import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { ScopeTypeEnum } from "../../../Contexts/AppContext";
import { useAPI } from "../../../Contexts/ApiContext";
import { useAlert } from "../../../Contexts/AlertContext";
import { useFlags } from "@atlaskit/flag";
import SuccessIcon from '@atlaskit/icon/glyph/check-circle';
import ErrorIcon from '@atlaskit/icon/glyph/error';
import { R400 } from '@atlaskit/theme/colors';
import { G300 } from '@atlaskit/theme/colors';
import { token } from '@atlaskit/tokens';

export const Disconnect = () => {
  const api = useAPI();
  
  const { showAlert } = useAlert();
  const { showFlag } = useFlags();
  const { portfolio_item_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const connectionType = location.state?.connectionType
  const connectionName = location.state?.connectionName

  useEffect(() => {
    console.debug(portfolio_item_id, connectionType, connectionName)
    if (portfolio_item_id && connectionType !== undefined && connectionName) {
      showAlert({
        title: `Disconnect ${connectionName}`,
        body: `Are you sure you want to disconnect ${connectionName}?`,
        confirmText: "Disconnect",
        onCancel: () => navigate('..'),
        onConfirm: () => disconnectScope()
      })
    }else{
      navigate('../..')
    }
  }, [portfolio_item_id, connectionType, connectionName]);

  const disconnectScope = async () => {
    if (portfolio_item_id && connectionType !== undefined && connectionName) {
      if (connectionType === ScopeTypeEnum.PORTFOLIO) {
        await api.portfolio.disconnect(portfolio_item_id).then(() => {
          navigate('..', { state: { refresh: true } })
          showFlag({
            title: "Disconnected",
            description: `Successfully disconnected ${connectionName}`,
            isAutoDismiss: true,
            icon: (
              <SuccessIcon
                primaryColor={token('color.icon.success', G300)}
                label="Success"
              />
            )
          });
        }).catch(() => {
          navigate('..', { state: { refresh: true } })
          showFlag({
            title: "Error",
            description: `Could not disconnect ${connectionName}`,
            isAutoDismiss: true,
            icon: (
              <ErrorIcon
                primaryColor={token('color.icon.danger', R400)}
                label="Success"
              />
            )
          });
        });
      }else{
        await api.project.disconnect(portfolio_item_id).then(() => {
          navigate('..', { state: { refresh: true } })
          showFlag({
            title: "Disconnected",
            description: `Successfully disconnected ${connectionName}`,
            isAutoDismiss: true,
            icon: (
              <SuccessIcon
                primaryColor={token('color.icon.success', G300)}
                label="Success"
              />
            )
          });
        }).catch(() => {
          navigate('..', { state: { refresh: true } })
          showFlag({
            title: "Error",
            description: `Could not disconnect ${connectionName}`,
            isAutoDismiss: true,
            icon: (
              <ErrorIcon
                primaryColor={token('color.icon.danger', R400)}
                label="Success"
              />
            )
          });
        });
      }
    }
  }
  return(
    <div/>
  )
}
