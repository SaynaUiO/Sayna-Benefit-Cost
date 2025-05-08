import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import DynamicTable from "@atlaskit/dynamic-table";
import EmptyState from "@atlaskit/empty-state";
import { useAppContext, ScopeTypeEnum } from "../../../Contexts/AppContext";
import { useAPI } from "../../../Contexts/ApiContext";
import { ConnectHead } from "../../../Components/Connect/ConnectHead";
import { ConnectRows } from "../../../Components/Connect/ConnectRows";
import { Scope } from "../../../Models/ScopeModel";
import Modal, { ModalHeader, ModalTitle, ModalBody, ModalFooter } from "@atlaskit/modal-dialog";

class Item {
  id: number;
  name: string;
  description: string;

  constructor(id: number, name: string, description: string) {
    this.id = id;
    this.name = name;
    this.description = description;
  }
}


export const AddPortfolioItems = () => {
  const [unconnected, setUnconnected] = useState<Scope[]>([ ]);
  const [loading, setLoading] = useState<boolean>(false);
  
  const [scope] = useAppContext();
  const api = useAPI();
  const navigation = useNavigate();

  const onExit = () => {
    navigation('..')
  }
  
  useEffect(() => {
    setLoading(true);
    if (scope.type === ScopeTypeEnum.PORTFOLIO) {
      fetchData().then((unconnected) => {
        setUnconnected(unconnected);
        setLoading(false);
      });
    }else{
      onExit()
    }
  }, []);

  const fetchData = async() => {
    setLoading(true);
    return await api.scope.getAllUnconnected().then((unconnected) => {
      return unconnected.filter((item) => item.id !== scope.id);
    }).catch((error) => {
      console.error(error)
      return []
    });
  }

  const head = () => {
    return ConnectHead();
  };
  
  const rows = useCallback(() => {
    return ConnectRows(unconnected, ConnectProjectPortfolio);
  }, [unconnected]);

  const ConnectProjectPortfolio = async (connection: Scope) => {
    setLoading(true);
    if (connection.type === ScopeTypeEnum.PROJECT) {
      await api.project.connect(connection.id, scope.id)
      .then(() => {
        return
      }).catch((error) => {
        console.error(error)
      })
    } else {
      await api.portfolio.connect(connection.id, scope.id)
      .then(() => {
        return
      }).catch((error) => {
        console.error(error)
      })
    }
    fetchData().then((unconnected) => {
      setUnconnected(unconnected);
      setLoading(false);
    });
  }

  return(
    <Modal onClose={() => onExit()}> 
      <ModalHeader>
        <ModalTitle>Add Portfolio Items</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <DynamicTable
          head={head()}
          rows={rows()}
          page={1}
          isRankable={false}
          loadingSpinnerSize="large"
          isLoading={loading}
          emptyView={
            <EmptyState
              header="No Projects or Portfolios available"
              description="There are no projects or portfolios available to connect to this portfolio."
              headingLevel={2}
            />
          }
        />
      </ModalBody>
    </Modal>
  );
};