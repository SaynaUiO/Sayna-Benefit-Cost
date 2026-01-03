import Modal, {
  ModalTransition,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from "@atlaskit/modal-dialog";
import Button, { LoadingButton } from "@atlaskit/button";
import React, { useState, useCallback } from "react";

// Import the translation hook
import { useTranslation } from "@forge/react";

interface DeleteConfirmationModalProps {
  itemName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const DeleteConfirmationModal: React.FC<
  DeleteConfirmationModalProps
> = ({ itemName, onClose, onConfirm }) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initialize translation
  const { t } = useTranslation();

  const handleConfirm = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [onConfirm]);

  return (
    <ModalTransition>
      <Modal onClose={onClose}>
        <ModalHeader>
          <ModalTitle appearance="danger">
            {`${t("delete_modal.title_prefix")} ${itemName}`}
          </ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p>
            {`${t("delete_modal.warning_start")} '${itemName}' ${t(
              "delete_modal.warning_end"
            )}`}
          </p>
          <ul>
            <li>{t("delete_modal.impact_notice")}</li>
          </ul>
        </ModalBody>
        <ModalFooter>
          <Button
            appearance="subtle"
            onClick={onClose}
            isDisabled={isSubmitting}
          >
            {t("delete_modal.cancel")}
          </Button>
          <LoadingButton
            appearance="danger"
            onClick={handleConfirm}
            isLoading={isSubmitting}
            autoFocus
          >
            {t("delete_modal.confirm")}
          </LoadingButton>
        </ModalFooter>
      </Modal>
    </ModalTransition>
  );
};
