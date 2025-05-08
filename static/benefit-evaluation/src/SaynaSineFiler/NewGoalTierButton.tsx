import Button from "@atlaskit/button";
import DropdownMenu, {
  DropdownItem,
  DropdownItemGroup,
} from "@atlaskit/dropdown-menu";
import AddIcon from "@atlaskit/icon/glyph/add";
import React, { useState } from "react";
import GoalDrawer from "./CreateGoalDrawer";
import GoalTierTableTree from "./GoalTierTableTree";

type Props = {
  onSelect: (type: string) => void;
};

const NewGoalTierDropdown = ({ onSelect }: Props) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleSelect = (type: string) => {
    setSelectedType(type);
    setDrawerOpen(true);
  };

  return (
    <>
      <DropdownMenu
        trigger={({ triggerRef, ...triggerProps }) => (
          <Button
            {...triggerProps}
            appearance="primary"
            iconBefore={<AddIcon size="small" label="" />}
            ref={triggerRef}
          >
            Nytt mål nivå
          </Button>
        )}
        shouldRenderToParent
      >
        <DropdownItemGroup>
          <DropdownItem onClick={() => handleSelect("Formål")}>
            Formål
          </DropdownItem>
          <DropdownItem
            onClick={() => handleSelect("Prosjektets Nyttevirkning")}
          >
            Prosjektets Nyttevirkning
          </DropdownItem>
          <DropdownItem onClick={() => handleSelect("Prosjektets Produkt")}>
            Prosjektets Produkt
          </DropdownItem>
          <DropdownItem onClick={() => handleSelect("Epic")}>Epic</DropdownItem>
        </DropdownItemGroup>
      </DropdownMenu>

      {/* Drawer:  */}
      {selectedType && (
        <GoalDrawer
          title="Et av Tiersene"
          goalType={selectedType}
          isOpen={drawerOpen}
          onClose={(shouldRefresh) => {
            setDrawerOpen(false);
            setSelectedType(null);
            if (shouldRefresh) {
              // Optionally refresh goal structure
            }
          }}
        />
      )}

      <GoalTierTableTree></GoalTierTableTree>
    </>
  );
};

export default NewGoalTierDropdown;
