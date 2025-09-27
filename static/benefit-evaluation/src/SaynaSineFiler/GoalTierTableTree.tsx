import React, { useState, useEffect, useCallback } from "react";
import TableTree, {
  Headers,
  Header,
  Rows,
  Row,
  Cell,
} from "@atlaskit/table-tree";
import Button from "@atlaskit/button";
import DropdownMenu, {
  DropdownItem,
  DropdownItemGroup,
} from "@atlaskit/dropdown-menu";
import MoreIcon from "@atlaskit/icon/glyph/more";

// Import shared types
import { Tier, GoalCollection } from "./types/goal"; // <--- NEW IMPORT: Import Tier and GoalCollection
// Import shared enums and mapping functions
import { GoalTierTypeEnum, mapEnumToGoalTypeString } from "./enums/goal"; // <--- NEW IMPORT

// Import other components and contexts
import { useAppContext } from "../Contexts/AppContext";
import { useAPI } from "../Contexts/ApiContext";
import GoalDrawer from "./CreateGoalDrawer";
import NewGoalTierButton from "./NewGoalTierButton";
import { GOAL_TYPE_DROPDOWN_ITEMS } from "./goalDropdownItems";
import Lozenge from "@atlaskit/lozenge";
import { statusAppearanceMap } from "./utils/statusMapping"; // Import the status mapping
import { ProductTableTree } from "./components/ProductTableTree";
import { BenefitTableTree } from "./components/BenefitTableTree";
import { ObjectiveTableTree } from "./components/ObjectiveTableTree";
import { GoalStructureView } from "./components/GoalStructureView";

// Import shared types
// Import shared enums and mapping functions

// Define props for GoalTierTableTree to accept refreshTrigger
type GoalTierTableTreeProps = {
  refreshTrigger: boolean;
};

const GoalTierTableTree = ({ refreshTrigger }: GoalTierTableTreeProps) => {
  const [items, setItems] = useState<Tier[]>([]);
  const [scope] = useAppContext();
  const api = useAPI();

  // State variables for managing the unified GoalDrawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editGoalData, setEditGoalData] = useState<Tier | null>(null); // Stores goal data if editing
  const [newSubtaskParentId, setNewSubtaskParentId] = useState<string | null>(
    null
  ); // Stores parentId if adding a subtask
  const [createGoalType, setCreateGoalType] = useState<string | null>(null); // String type for new goal creation

  // Centralized data fetching and tree building logic
  const fetchData = useCallback(async () => {
    try {
      const allGoals = await api.goalCollection.getAll(scope.id);
      const goalMap: Map<string, Tier> = new Map();

      // Step 1: Map all raw GoalCollection objects into frontend Tier objects
      allGoals.forEach((goal: any) => {
        const parsedType: GoalTierTypeEnum =
          typeof goal.type === "number"
            ? goal.type
            : GoalTierTypeEnum.GOAL_COLLECTION; // Default if not a number

        // Determine the display title for the frontend 'Tier' object.
        // Backend's 'tier' field is expected to be the string.
        // Fallback to the mapped 'type' enum if 'tier' is missing or empty, then fallback to name.
        const displayTitle: string =
          goal.tier && goal.tier.length > 0 // If backend 'tier' string exists
            ? goal.tier // Use it directly
            : goal.name && goal.name.length > 0 // Else, if backend 'name' exists
            ? goal.name // Use the name
            : mapEnumToGoalTypeString(parsedType); // Else, use the mapped type enum string

        goalMap.set(goal.id, {
          id: goal.id,
          title: displayTitle, // The human-readable title for display
          name: goal.name,
          description: goal.description,
          status: goal.status || "To Do", // Default status
          type: parsedType, // Store the numeric enum value for 'type'
          parentId: goal.parentId,
          subtask: [], // Initialize subtask array
          tierString: goal.tier, // Store the backend 'tier' string for referenc
          dueDate: goal.dueDate || "", // Store the due date, default to empty string if not set
        });
      });

      const rootItems: Tier[] = [];

      // Step 2: Organize into parent-child hierarchy
      allGoals.forEach((goal: any) => {
        const parentId = goal.parentId;
        const currentGoalAsTier = goalMap.get(goal.id);

        if (!currentGoalAsTier) {
          console.warn(
            `Goal with ID ${goal.id} not found in map during hierarchy organization.`
          );
          return;
        }

        if (parentId && goalMap.has(parentId)) {
          // This is a child, add it to the parent's subtask
          const parent = goalMap.get(parentId)!;
          if (!parent.subtask) {
            parent.subtask = []; // Initialize if null/undefined
          }
          parent.subtask.push(currentGoalAsTier);
        } else {
          // This is a top-level item
          rootItems.push(currentGoalAsTier);
        }
      });

      setItems(rootItems);
    } catch (error) {
      console.error("Error fetching data:", error);
      setItems([]); // Clear items on error
    }
  }, [scope.id, api.goalCollection]);

  // Effect to fetch data on component mount and when scope.id changes
  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]); // Dependency array: fetchData itself

  // Helper for opening drawer in edit mode
  const handleEditClick = (goal: Tier) => {
    setEditGoalData(goal);
    setNewSubtaskParentId(goal.parentId || null); //<- legger til goal.parentID istedet for null
    setCreateGoalType(null); // Ensure creation mode is off
    setIsDrawerOpen(true);
  };

  // Handler when a type is selected for new goal/subtask creation
  const handleAddGoalTypeSelected = (
    selectedType: string,
    parentId?: string
  ) => {
    setEditGoalData(null); // Ensure edit mode is off
    setNewSubtaskParentId(parentId || null); // Set parentId if it's a subtask
    setCreateGoalType(selectedType); // Set the string type for the new goal/subtask
    setIsDrawerOpen(true);
  };

  // Helper for closing drawer and refreshing data
  const handleDrawerClose = useCallback(
    (shouldRefresh?: boolean) => {
      setIsDrawerOpen(false);
      setEditGoalData(null);
      setNewSubtaskParentId(null);
      setCreateGoalType(null);
      if (shouldRefresh) {
        fetchData(); // Re-fetch data if a refresh was requested
      }
    },
    [fetchData]
  );

  // Helper for deleting a goal
  const handleDeleteClick = async (id: string, title: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${title}"? This action cannot be undone.`
      )
    ) {
      try {
        await api.goalCollection.delete(scope.id, id);
        fetchData(); // Refresh data after deletion
      } catch (error) {
        console.error("Error deleting goal:", error);
      }
    }
  };

  return (
    <div>
      <TableTree label="Målstruktur">
        <Headers>
          <Header width={600}>Mål</Header>
          <Header width={150}>Beskrivelse</Header>
          <Header width={150}>Nytte poeng</Header>
          <Header width={150}>Status</Header>
          <Header width={150}>Frist</Header>
          <Header width={150}>Handling</Header>
        </Headers>
        <Rows
          items={items}
          render={({
            id,
            title, // This `title` is now the human-readable string
            description,
            subtask = [],
            status,
            type, // This `type` is the numeric enum
            name,
            parentId,
            tierString,
            dueDate,
          }: Tier) => (
            <Row itemId={id} items={subtask} hasChildren={subtask.length > 0}>
              <Cell>{title}</Cell>
              <Cell>{description}</Cell>
              <Cell>0</Cell>
              <Cell>
                <Lozenge
                  appearance={statusAppearanceMap[status || "To Do"]}
                  isBold
                >
                  {status || "Unknown"}
                </Lozenge>
              </Cell>
              <Cell>{dueDate || "Ikke satt"}</Cell>

              <Cell>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {/* New Goal Tier Button for Subtasks */}
                  <NewGoalTierButton
                    buttonLabel="+"
                    dropdownItems={GOAL_TYPE_DROPDOWN_ITEMS}
                    onTypeSelectedForCreation={handleAddGoalTypeSelected} // USE NEW PROP HERE
                    isPrimary={false}
                    parentId={id} // Pass the parent ID dynamically
                  />

                  {/*DropdownMenu for Edit/Delete: */}
                  <DropdownMenu
                    trigger={({ triggerRef, ...triggerProps }) => (
                      <Button
                        {...triggerProps}
                        iconBefore={<MoreIcon label="more" />}
                        ref={triggerRef}
                        aria-label="More actions"
                      />
                    )}
                    shouldRenderToParent
                  >
                    <DropdownItemGroup>
                      <DropdownItem
                        onClick={() => {
                          handleEditClick({
                            id,
                            title, // title is the display string, so no need to map here
                            name,
                            description,
                            status,
                            type, // Pass the numeric enum type
                            parentId,
                            subtask: subtask || [],
                            tierString,
                            dueDate,
                          });
                        }}
                      >
                        Edit
                      </DropdownItem>

                      <DropdownItem
                        onClick={() => {
                          console.log("Deleting tier:", id);
                          handleDeleteClick(id, title);
                        }}
                      >
                        Delete
                      </DropdownItem>
                    </DropdownItemGroup>
                  </DropdownMenu>
                </div>
              </Cell>
            </Row>
          )}
        />

        {/* UNIFIED GoalDrawer for both Add Subtask, Create Top-Level Goal, and Edit */}
        {isDrawerOpen && (
          <GoalDrawer
            goalId={editGoalData?.id}
            // IMPORTANT: initialName should be the actual editable name, not the display type title
            initialName={editGoalData?.name}
            initialDescription={editGoalData?.description}
            initialTierString={editGoalData?.tierString || ""}
            initialDueDate={editGoalData?.dueDate || ""}
            goalType={
              editGoalData?.type !== undefined
                ? mapEnumToGoalTypeString(editGoalData.type) // Convert numeric enum to string for drawer
                : createGoalType || "Unknown" // createGoalType is already a string
            }
            parentId={newSubtaskParentId ?? undefined}
            title={
              editGoalData
                ? `Edit ${editGoalData.title}` // use the already mapped title
                : createGoalType
                ? `Create New ${createGoalType}`
                : "Goal Details"
            }
            isOpen={isDrawerOpen}
            onClose={handleDrawerClose}
          />
        )}
      </TableTree>

      {/* Viser til storage Json kode på siden  */}
      <pre className="text-xs mt-4 bg-gray-100 p-2">
        {JSON.stringify(items, null, 3)}
      </pre>

      <GoalStructureView />
    </div>
  );
};

export default GoalTierTableTree;
