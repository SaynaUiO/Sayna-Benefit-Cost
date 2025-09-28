import Button from "@atlaskit/button";
import DropdownMenu, {
  DropdownItem,
  DropdownItemGroup,
} from "@atlaskit/dropdown-menu";
import AddIcon from "@atlaskit/icon/glyph/add";

type Props = {
  buttonLabel: string;
  dropdownItems: { label: string; value: string }[];
  onTypeSelectedForCreation: (selectedType: string, parentId?: string) => void;
  isPrimary?: boolean;
  parentId?: string;
};

const AddBenefitGoalDropdownButton = ({
  buttonLabel,
  dropdownItems,
  onTypeSelectedForCreation,
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
                onTypeSelectedForCreation(item.value, parentId);
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
export default AddBenefitGoalDropdownButton;
