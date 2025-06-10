import Button from "@atlaskit/button";
import DropdownMenu, {
  DropdownItem,
  DropdownItemGroup,
} from "@atlaskit/dropdown-menu";
import AddIcon from "@atlaskit/icon/glyph/add";
import React, { useState } from "react";
import GoalDrawer from "./GoalDrawer";
import GoalTierTableTree from "./GoalTierTableTree";

// This component Adds a new goal tier, both a new root one and a subtier

type Props = {
  buttonLabel: string; // Label for the button
  dropdownItems: { label: string; value: string }[]; // Dropdown options
  onSave: (type: string, parentId?: string) => void; // Callback for saving
  isPrimary?: boolean; // Optional: Make the button primary
  parentId?: string; // Optional: Parent ID for child rows
};

const NewGoalTierButton = ({
  buttonLabel,
  dropdownItems,
  onSave,
  isPrimary = true,
  parentId,
}: Props) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleSelect = (type: string) => {
    setSelectedType(type);
    setDrawerOpen(true);
  };

  const handleSave = () => {
    if (selectedType) {
      onSave(selectedType, parentId); // Pass the selected type and parent ID
      setDrawerOpen(false);
      setSelectedType(null);
    }
  };

  return (
    <>
      <DropdownMenu
        trigger={({ triggerRef, ...triggerProps }) => (
          <Button
            {...triggerProps}
            appearance={isPrimary ? "primary" : "subtle-link"}
            iconBefore={
              isPrimary ? <AddIcon size="small" label="" /> : undefined
            }
            ref={triggerRef}
          >
            {buttonLabel}
          </Button>
        )}
        shouldRenderToParent
      >
        <DropdownItemGroup>
          {dropdownItems.map((item) => (
            <DropdownItem
              key={item.value}
              onClick={() => handleSelect(item.value)}
            >
              {item.label}
            </DropdownItem>
          ))}
        </DropdownItemGroup>
      </DropdownMenu>

      {/* Drawer */}
      {selectedType && (
        <GoalDrawer
          title={`Add ${selectedType}`}
          goalType={selectedType}
          parentId={parentId} // Pass parentId for child rows
          isOpen={drawerOpen}
          onClose={(shouldRefresh) => {
            if (shouldRefresh) {
              handleSave(); //Save new goal tier
            } else {
              setDrawerOpen(false);
              setSelectedType(null);
            }
          }}
        />
      )}
    </>
  );
};

export default NewGoalTierButton;
