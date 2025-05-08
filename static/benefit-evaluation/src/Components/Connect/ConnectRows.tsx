import { RowType } from "@atlaskit/dynamic-table/dist/types/types";
import Lozenge from "@atlaskit/lozenge";
import Button from "@atlaskit/button";
import { ScopeTypeEnum } from "../../Contexts/AppContext";
import LinkIcon from '@atlaskit/icon/glyph/link'
import { Scope } from "../../Models/ScopeModel";

export const ConnectRows = (unconnected: Scope[], ConnectProjectPortfolio: (ConnectionId: Scope) => Promise<void>): RowType[] | undefined => {
  if (unconnected === undefined) return undefined;
  let rows: RowType[] = unconnected.map((item: Scope, index: number): RowType => ({
    key: `${item.id}`,
    isHighlighted: false,
    cells: [
      {
        key: item.name,
        content: (
          item.name
        ),
      },
      {
        key: item.description,
        content: (
          item.description
        ),
      },
      {
        key: item.description,
        content: (
          item.type === ScopeTypeEnum.PROJECT ? (
            <Lozenge appearance="inprogress">Project</Lozenge>
          ) : (
            <Lozenge appearance="new">Portfolio</Lozenge>
          )
        ),
      },
      {
        key: 'Add',
        content: (
          <Button iconBefore={<LinkIcon label="Connect"/>} appearance="primary" onClick={() => ConnectProjectPortfolio(item)}>Connect</Button>
        ),
      }
    ],
  }))
  return rows;
}