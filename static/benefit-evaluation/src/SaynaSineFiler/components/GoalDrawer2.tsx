import React, { useState } from "react";
import {
  Drawer,
  DrawerSidebar,
  DrawerContent,
  DrawerCloseButton,
} from "@atlaskit/drawer/compiled";
import TextField from "@atlaskit/textfield";
import { useAppContext } from "../../Contexts/AppContext";
import { useAPI } from "../../Contexts/ApiContext";
import Button from "@atlaskit/button";
import { useEffect } from "react";
import { Goal, GoalTypeEnum } from "../../Models";
import { v4 as uuidv4 } from "uuid";

//This component is a dynamic drawer for addinf tier, adding subtask, and editing a goal

const FORMAAL_ID = "root-formaal";
const EFFEKTMAAL_ID = "root-effektmaal"; // Brukes for "Benefit" goals
const EPIC_ID = "root-epic";
const ORGANISASJONSMAAL_ID = "root-organisasjonsmaal";
const SAMFUNNSMAAL_ID = "root-samfunnsmaal";

const getGoalCategoryDisplayName = (categoryId: string): string => {
  switch (categoryId) {
    case EFFEKTMAAL_ID:
      return "Effektmål";
    case ORGANISASJONSMAAL_ID:
      return "Organisasjonsmål";
    case SAMFUNNSMAAL_ID:
      return "Samfunnsmål";
    default:
      // Bruk ID som fallback, men fjern 'root-' prefikset og formater
      return categoryId
        .replace("root-", "")
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
  }
};

type Props = {
  title: string;
  goalType: "Objective" | "Benefit" | "Product" | string;
  goalCategory?: string; //samfunnsmål...
  isOpen: boolean;
  parentId?: string;
  onClose: (shouldRefresh?: boolean) => void;
  goalToEdit?: Goal | null;
};

// Initial state for all possible fields
interface FormData {
  description: string;
  timeEstimate?: number;
  costEstimate?: number;
  weight?: number;
}

// --- Component ---
const GoalDrawer = ({
  goalType,
  goalCategory,
  isOpen,
  parentId,
  onClose,
  goalToEdit,
}: Props) => {
  console.log("GoalDrawer Props:", { goalType, goalCategory, parentId });

  const [scope] = useAppContext();
  const api = useAPI();

  // Initialize all fields in a single state object
  const [formData, setFormData] = useState<FormData>({
    description: "",
    timeEstimate: undefined,
    costEstimate: undefined,
    weight: undefined,
  });

  // Reset form data when the drawer opens
  useEffect(() => {
    if (isOpen) {
      if (goalToEdit) {
        // Edit
        setFormData({
          description: goalToEdit.description || "",
          // MERK: Disse feltene MÅ være definert i din Goal-modell for å unngå 'as any'
          // Gjeninnfør disse linjene når `Goal` modellen er oppdatert:
          // timeEstimate: (goalToEdit as any).timeEstimate ?? undefined,
          // costEstimate: (goalToEdit as any).costEstimate ?? undefined,
          // weight: (goalToEdit as any).weight ?? undefined,
        });
      } else {
        //Create/Add
        setFormData({
          description: "",
          timeEstimate: undefined,
          costEstimate: undefined,
          weight: undefined,
        });
      }
    }
  }, [isOpen, goalToEdit]);

  const handleChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const isEditing = !!goalToEdit;
    if (!formData.description) {
      alert("Title and Description are required.");
      return;
    }

    let tierValue: string;
    switch (goalType) {
      case "Benefit":
        if (!goalCategory) {
          alert("Benefit goal is missing category ID.");
          return;
        }
        tierValue = goalCategory;
        break;
      case "Product":
        tierValue = EPIC_ID;
        break;
      case "Objective":
        tierValue = FORMAAL_ID;
        break;
      default:
        alert("Invalid goal type.");
        return;
    }

    try {
      if (isEditing) {
        // --- LOGIKK FOR REDIGERING ---
        // Veldig viktig: GoalData for UPDATE må inkludere alle feltene API-et forventer.
        // Hvis API-et forventer kun de redigerte feltene, er dette forenklet.

        const goalDataToUpdate: Goal = {
          ...goalToEdit!, // Beholder eksisterende id, key, goalCollectionId
          description: formData.description,
          // Gjeninnfør estimat-feltene herfra når de er i Goal-modellen
        };

        await api.goal.update(
          scope.id,
          goalDataToUpdate.goalCollectionId,
          goalDataToUpdate
        );
        console.log("Goal updated:", goalDataToUpdate);
      } else {
        await api.goal.create(
          scope.id,
          tierValue, // Bruker korrekt GoalCollection ID
          formData.description
        );
        console.log(
          `Goal created in ${tierValue} with description: ${formData.description}`
        );
      }

      onClose(true);
    } catch (err) {
      console.error("Error saving goal:", err);
      // Bruk alert for å gi feedback
      alert("There was an error saving the goal. Please try again.");
    }
  };

  // --- Conditional Field Renderer ---
  const renderEpicFields = () => (
    <>
      <TextField
        label="Time"
        type="number"
        value={
          formData.timeEstimate === undefined
            ? ""
            : String(formData.timeEstimate)
        }
        onChange={(e) =>
          handleChange(
            "timeEstimate",
            Number((e.target as HTMLInputElement).value)
          )
        }
        placeholder="Estimated time in hours"
      />
      <TextField
        label="Cost"
        type="number"
        value={
          formData.costEstimate === undefined
            ? ""
            : String(formData.costEstimate)
        }
        onChange={(e) =>
          handleChange(
            "costEstimate",
            Number((e.target as HTMLInputElement).value)
          )
        }
        placeholder="Estimated cost in currency"
      />
    </>
  );

  const categoryDisplayName = goalCategory
    ? getGoalCategoryDisplayName(goalCategory) // F.eks. "Effektmål"
    : goalType === "Benefit"
    ? "Nyttevirkning"
    : goalType; // Fikser visningen om category er null.

  // Konverterer "Product" -> "Epic", "Objective" -> "Formål" for bedre UI-navn
  const finalDisplayName = categoryDisplayName
    .replace("Product", "Epic")
    .replace("Objective", "Formål");

  // Dynamic Drawer Title
  const drawerTitle = goalToEdit
    ? `Endre ${goalToEdit.id}`
    : `Opprett nytt ${finalDisplayName}`; // Bruk det pene navnet her!

  //Update Button Text:
  const buttonText = goalToEdit
    ? "Lagre endringer"
    : `Create ${goalCategory || goalType}`;

  // --- Main Render Function ---
  return (
    <Drawer isOpen={isOpen} onClose={() => onClose(false)} label={drawerTitle}>
      <DrawerSidebar>
        <DrawerCloseButton />
      </DrawerSidebar>
      <DrawerContent>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            padding: "1rem",
          }}
        >
          <h2>{drawerTitle}</h2>

          {/* 2. DESCRIPTION FIELD */}
          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) =>
              handleChange("description", (e.target as HTMLInputElement).value)
            }
            placeholder="Detailed description"
            style={{ minHeight: 80 }}
            isRequired
          />

          {/* 3. Conditional Benefit Fields */}
          {(goalType === "Benefit" || goalToEdit?.id === "Benefit") && (
            <TextField
              label="weight (%)"
              type="number"
              value={
                formData.weight === undefined ? "" : String(formData.weight)
              }
              onChange={(e) =>
                handleChange(
                  "weight",
                  Number((e.target as HTMLInputElement).value)
                )
              }
              placeholder="0 til 100"
              min={0}
              max={100}
            ></TextField>
          )}

          {/* 3. Conditional Epic Fields */}
          {goalType === "Product" && renderEpicFields()}

          {/* 4. Placeholder for Status (using Select) and Date (DatePicker) - Removed for now, but ready to be added back */}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button appearance="primary" onClick={handleSave}>
              {buttonText} {/* <-- dynamic button */}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default GoalDrawer;
