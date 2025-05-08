export const GoalTierHead = () => {
  return {
    cells: [
      {
        key: 'rank',
        content: 'Rank',
        isSortable: false,
      },
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
        key: 'action',
        content: 'Action',
        isSortable: false,
        shouldTruncate: true,
      },
    ],
  }
};