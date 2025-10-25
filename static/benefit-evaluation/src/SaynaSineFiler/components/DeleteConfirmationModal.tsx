import Modal, {
  ModalTransition,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from "@atlaskit/modal-dialog";
import Button, { LoadingButton } from "@atlaskit/button";
import React, { useState, useCallback } from "react";

interface DeleteConfirmationModalProps {
  itemName: string; // F.eks. "Målet G-123"
  onClose: () => void; // Funksjon for å lukke (tilknyttet "Avbryt")
  onConfirm: () => Promise<void>; // Funksjonen som utfører slettingen (asynkron)
}

export const DeleteConfirmationModal: React.FC<
  DeleteConfirmationModalProps
> = ({ itemName, onClose, onConfirm }) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleConfirm = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [onConfirm, onClose]);

  return (
    <ModalTransition>
      <Modal onClose={onClose}>
        <ModalHeader>
          <ModalTitle appearance="danger">Slett Målet: {itemName}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p>
            Er du sikker på at du vil slette målet `{itemName}` permanent? Denne
            handlingen kan ikke angres.
          </p>
          <ul>
            <li>Sletting vil påvirke relaterte estimeringer og hierarki.</li>
          </ul>
        </ModalBody>
        <ModalFooter>
          <Button
            appearance="subtle"
            onClick={onClose}
            isDisabled={isSubmitting}
          >
            Avbryt
          </Button>
          <LoadingButton
            appearance="danger"
            onClick={handleConfirm} // Bruker den lokale bekreftelsesfunksjonen
            isLoading={isSubmitting}
            autoFocus
          >
            Slett permanent
          </LoadingButton>
        </ModalFooter>
      </Modal>
    </ModalTransition>
  );
};
