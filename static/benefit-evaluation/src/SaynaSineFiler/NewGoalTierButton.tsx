import Button from "@atlaskit/button";
import DropdownMenu, {
  DropdownItem,
  DropdownItemGroup,
} from "@atlaskit/dropdown-menu";
import AddIcon from "@atlaskit/icon/glyph/add";
import React, { useState } from "react";
import GoalDrawer from "./CreateGoalDrawer";
import GoalTierTableTree from "./GoalTierTableTree";

// This component Adds a new goal tier, both a new root one and a subtier

type Props = {
  buttonLabel: string; // Label for the button
  dropdownItems: { label: string; value: string }[]; // Dropdown options
  onTypeSelectedForCreation: (selectedType: string, parentId?: string) => void; // CHANGED PROP NAME
  isPrimary?: boolean; // Optional: Make the button primary
  parentId?: string; // Optional: Parent ID for child rows
};

const NewGoalTierButton = ({
  buttonLabel,
  dropdownItems,
  onTypeSelectedForCreation, // Use the new prop name
  isPrimary = true,
  parentId,
}: Props) => {
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
              onClick={() => {
                onTypeSelectedForCreation(item.value, parentId); // Pass type and parentId UP
              }}
            >
              {item.label}
            </DropdownItem>
          ))}
        </DropdownItemGroup>
      </DropdownMenu>
    </>
  );
};

export default NewGoalTierButton;
