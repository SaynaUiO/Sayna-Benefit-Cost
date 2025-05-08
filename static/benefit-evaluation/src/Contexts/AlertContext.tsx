import Modal, { ModalHeader, ModalTitle, ModalBody, ModalFooter } from "@atlaskit/modal-dialog"
import Button, { LoadingButton } from "@atlaskit/button"
import React, { createContext, useContext, useState } from "react"
import { type } from "os";

type AlertConfig = {
  title: string;
  body: string;
  confirmText: string;
  onCancel: Function;
  onConfirm: () => Promise<any>;
}

type AlertContextType = {
  showAlert: ({title, body, confirmText, onConfirm}: AlertConfig) => void;
}

type AlertProviderType = {
  children: React.ReactNode;
}

const AlertContext = createContext<AlertContextType>(undefined!);

export const useAlert = () => {
  return useContext(AlertContext)
}

export const AlertProvider = ({children}: AlertProviderType) => {
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);

  const [title, setTitle] = useState<string>();
  const [body, setBody] = useState<string>();
  const [confirmText, setConfirmText] = useState<string>();
  const [onConfirm, setOnConfirm] = useState<() => Promise<any>>();
  const [onCancel, setOnCancel] = useState<Function>();

  const showAlert = ({title, body, confirmText, onCancel, onConfirm}: AlertConfig) => {
    setOpen(true);
    setTitle(title);
    setBody(body);
    setConfirmText(confirmText);
    setOnCancel(() => onCancel);
    setOnConfirm(() => onConfirm);
  }

  const onExit = () => {
    if (isLoading) return;
    setOpen(false);
    onCancel!();
  }

  const onSubmit = () => {
    setLoading(true);
    onConfirm!().then(() => {
      setLoading(false);
      setOpen(false);
    })
  }

  return(
    <AlertContext.Provider value={{showAlert: showAlert}}>
      {open && (
        <Modal onClose={()  => onExit()}> 
          <ModalHeader>
            <ModalTitle>{title}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            {body}
          </ModalBody>
          <ModalFooter>
            <Button appearance="subtle" onClick={() => onExit()}>
              Cancel
            </Button>
            <LoadingButton appearance="primary" isLoading={isLoading} onClick={() => onSubmit()} autoFocus>
              {confirmText}
            </LoadingButton>
          </ModalFooter>
        </Modal>
      )}
      {children}
    </AlertContext.Provider>
  )
}