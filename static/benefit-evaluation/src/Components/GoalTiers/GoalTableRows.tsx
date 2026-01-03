import Button from "@atlaskit/button";
import DropdownMenu, {
  DropdownItemGroup,
  DropdownItem,
} from "@atlaskit/dropdown-menu";
import { RowType } from "@atlaskit/dynamic-table/dist/types/types";
import Lozenge from "@atlaskit/lozenge";
import { ScopeTypeEnum } from "../../Contexts/AppContext";
import MoreIcon from "@atlaskit/icon/glyph/more";
import { useNavigate } from "react-router-dom";
import Tooltip from "@atlaskit/tooltip";
import {
  balancedPointsEnum,
  GoalTier,
  GoalTierTypeEnum,
  GoalTableItem,
} from "../../Models";

export const GoalTableRows = (
  goalTier: GoalTier,
  items: GoalTableItem[],
  setGoalButtonOpen: (open: boolean) => void,
  setGoalType: (goalType: "create" | "edit") => void,
  setItemId: (itemId: string) => void,
  setDeletePaneOpen: (open: boolean) => void
): RowType[] => {
  const navigation = useNavigate();

  let rows: RowType[] = items.map(
    (item, _): RowType => ({
      key: `${item.id}`,
      isHighlighted: false,
      cells: [
        {
          key: item.key,
          content: item.key,
        },
        {
          key: item.description,
          content: item.description,
        },
        {
          key: item.balancedPoints?.value || 0,
          content: item.balancedPoints ? (
            goalTier.type === GoalTierTypeEnum.ISSUE_TYPE ? (
              <Tooltip content={"Benefit points"}>
                <Lozenge appearance="new">{`${
                  item.balancedPoints.type !== balancedPointsEnum.WEIGHT
                    ? item.balancedPoints.value * 100
                    : item.balancedPoints.value > 1000
                    ? Math.round(
                        Number(item.balancedPoints.value)
                      ).toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })
                    : (
                        Math.round(item.balancedPoints.value * 100) / 100
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                } ${
                  item.balancedPoints.type === balancedPointsEnum.MONETARY
                    ? item.balancedPoints.postFix
                    : ""
                }`}</Lozenge>
              </Tooltip>
            ) : goalTier.type === GoalTierTypeEnum.PORTFOLIO_ITEM ? (
              <Tooltip content={"Weight"}>
                <Lozenge appearance="new">{`${item.balancedPoints.value} ${item.balancedPoints.postFix}`}</Lozenge>
              </Tooltip>
            ) : (
              <Tooltip
                content={
                  item.balancedPoints.type === balancedPointsEnum.MONETARY
                    ? "Monetary value"
                    : "Weight"
                }
              >
                <Lozenge appearance="new">{`${item.balancedPoints.value.toLocaleString(
                  "en-US"
                )} ${item.balancedPoints.postFix}`}</Lozenge>
              </Tooltip>
            )
          ) : (
            <Lozenge appearance="default">NO ESTIMATES</Lozenge>
          ),
        },
        ...(goalTier.type === GoalTierTypeEnum.ISSUE_TYPE
          ? [
              {
                key: `${item.issueCost?.cost || 0}-cost`,
                content: (
                  <Tooltip content={"Cost"}>
                    <Lozenge appearance="removed">{`${
                      item.issueCost?.cost || 0
                    }`}</Lozenge>
                  </Tooltip>
                ),
              },
              {
                key: `${item.issueCost?.time || 0}-time`,
                content: (
                  <Tooltip content={"Time"}>
                    <Lozenge appearance="inprogress">{`${
                      item.issueCost?.time || 0
                    }`}</Lozenge>
                  </Tooltip>
                ),
              },
              {
                key: `${item.id}-status`,
                content: (
                  <Lozenge appearance="inprogress">{item.status!.name}</Lozenge>
                ),
              },
            ]
          : []),
        ...(goalTier.type === GoalTierTypeEnum.PORTFOLIO_ITEM
          ? [
              {
                key: `${item.id}-type`,
                content:
                  item.scopeType === ScopeTypeEnum.PROJECT ? (
                    <Lozenge appearance="inprogress">Project</Lozenge>
                  ) : (
                    <Lozenge appearance="new">Portfolio</Lozenge>
                  ),
              },
            ]
          : []),
        ...(goalTier.type !== GoalTierTypeEnum.ISSUE_TYPE
          ? [
              {
                key: "MoreDropdown",
                content: (
                  <DropdownMenu
                    trigger={({ triggerRef, ...props }) => (
                      <Button
                        {...props}
                        iconBefore={<MoreIcon label="more" />}
                        ref={triggerRef}
                      />
                    )}
                  >
                    <DropdownItemGroup>
                      {goalTier.type === GoalTierTypeEnum.PORTFOLIO_ITEM ? (
                        <DropdownItem
                          onClick={() =>
                            navigation(`${item.id}/remove`, {
                              state: {
                                connectionName: item.key,
                                connectionType: item.scopeType,
                              },
                            })
                          }
                        >
                          Remove
                        </DropdownItem>
                      ) : (
                        <>
                          <DropdownItem
                            onClick={() => {
                              setGoalType("edit");
                              setItemId(item.id);
                              setGoalButtonOpen(true);
                            }}
                          >
                            Edit
                          </DropdownItem>
                          <DropdownItem
                            onClick={() => {
                              setItemId(item.id);
                              setDeletePaneOpen(true);
                            }}
                          >
                            Delete
                          </DropdownItem>
                        </>
                      )}
                    </DropdownItemGroup>
                  </DropdownMenu>
                ),
              },
            ]
          : []),
      ],
    })
  );
  return rows;
};
