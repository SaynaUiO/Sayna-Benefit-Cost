import { HeadType } from "@atlaskit/dynamic-table/dist/types/types";

export const ConnectHead = (): HeadType | undefined => {
  return {
    cells: [
      {
        key: 'name',
        content: 'Name',
        isSortable: false,
      },
      {
        key: 'description',
        content: 'Description',
        isSortable: false,
      },
      {
        key: 'type',
        content: 'Type',
        isSortable: true,
      },
      {
        key: 'action',
        content: 'Action',
        isSortable: false,
      }
    ]
  }
};