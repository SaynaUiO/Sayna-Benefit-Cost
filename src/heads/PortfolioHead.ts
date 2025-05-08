import { PfHeadDA } from "../dataAccess/PortfolioDA";

export const getNextId = async (): Promise<string> => {
  return PfHeadDA.get().then((head) => {
    const id = head ? head.nextId : 0;
    const portfolioIds = head ? head.portfolioIds : [];
    portfolioIds.push(`pf${id}`);
    PfHeadDA.set({ nextId: id + 1, portfolioIds: portfolioIds })
    return `pf${id}`;
  });
}

export const deleteIdFromHead = async (id: string) => {
  PfHeadDA.get().then((response) => {
    if (!response) {
      return;
    }
    const portfolioIds = response.portfolioIds;
    const index = portfolioIds.indexOf(id);
    if (index > -1) {
      portfolioIds.splice(index, 1);
    }
    PfHeadDA.set({ nextId: response.nextId, portfolioIds: portfolioIds });
  })
}

export const getAllIds = async (): Promise<string[]> => {
  console.log(`Get All Portfolio ids`)
  return PfHeadDA.get().then((PFHead) => {
    if (!PFHead) {
      return [];
    }
    return PFHead.portfolioIds
  });
}