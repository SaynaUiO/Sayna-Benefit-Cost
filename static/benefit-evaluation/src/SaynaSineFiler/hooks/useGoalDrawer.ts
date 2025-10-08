//Denne filen hånderer formData state, initialiserigner og handleSave logikk til GoalDrawer

import { useCallback, useEffect, useState } from "react";
import { useAPI } from "../../Contexts/ApiContext";
import { useAppContext } from "../../Contexts/AppContext";
import { CostTime, Goal } from "../../Models";


//Typer og Konstanter: 
interface FormData {
  description: string;
}

type GoalType = "Objective" | "Benefit" | "Product" | string;

const EPIC_ID = "root-epic";
const FORMAAL_ID = "root-formaal";

interface GoalFormProps {
  goalType: GoalType;
  goalCategory?: string;
  goalToEdit?: Goal | null;
  onClose: (shouldRefresh?: boolean) => void;
}

export const useGoalForm = ({
  goalType,
  goalCategory,
  goalToEdit,
  onClose,
}: GoalFormProps) => {
  const [scope] = useAppContext();
  const api = useAPI();

   // Initialiser all skjema state i et enkelt objekt
  const [formData, setFormData] = useState<FormData>({
    description: "",
  });

  //Tilstand for å unngå dobbelklikk: 
  const [isSubmitting, setIsSubmitting] = useState(false);

  //Initialisering: 

  useEffect(() => {
    if (goalToEdit) {
      // Edit
      setFormData({
        description: goalToEdit.description || "",
      });
    } else {
      // Create/Add
      setFormData({
        description: "",
      });
    }
  }, [goalToEdit]);

  //Håndtering av endring: 
   const handleChange = useCallback(
  (field: keyof FormData, value: string) => { 
    setFormData((prev) => ({ ...prev, [field]: value }));
  },
  []
);

  //Lagring: 

  const handleSave = async () => {
    const isEditing = !!goalToEdit;
    if (!formData.description) {
      alert("Tittel/Beskrivelse er påkrevd.");
      return;
    }

    setIsSubmitting(true);

    let goalCollectionId: string;
    switch (goalType) {
      case "Benefit":
        if (!goalCategory) {
          alert("Benefit goal is missing category ID.");
          setIsSubmitting(false);
          return;
        }
        goalCollectionId = goalCategory;
        break;
      case "Product":
        goalCollectionId = EPIC_ID;
        break;
      case "Objective":
        goalCollectionId = FORMAAL_ID;
        break;
      default:
        alert("Ugyldig måltype.");
        setIsSubmitting(false);
        return;
    }

   try {
      if (isEditing) {

        const goalDataToUpdate: Goal = {
          ...goalToEdit!,
          description: formData.description,
          issueCost: goalToEdit!.issueCost, 
          balancedPoints: goalToEdit?.balancedPoints, 
          distributedPoints: goalToEdit?.distributedPoints,
        };

        await api.goal.update(
          scope.id,
          goalCollectionId, 
          goalDataToUpdate
        );
        console.log("Goal updated:", goalDataToUpdate);

      } else {
        // Opprettelse
        await api.goal.create(
          scope.id,
          goalCollectionId,
          formData.description
        );
        console.log(
          `Goal created in ${goalCollectionId} with description: ${formData.description}`
        );
      }

      onClose(true); // Lukk og be om refresh
    } catch (err) {
      console.error("Error saving goal:", err);
      alert("Feil ved lagring av mål. Prøv igjen.");
    } finally {
      setIsSubmitting(false);
    }
  };

    return {
    formData,
    isSubmitting,
    handleChange,
    handleSave,
    // Fjerner unødvendig eksport av selve typen: FormData
    // FormData, 
  };
};