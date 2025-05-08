import { ListResult, Result } from "@forge/api";
import { Method, storageAPI } from "../api/storageAPI";
import { getAllProjects, resetProject } from "./ProjectService";

export const resetApp = async () => {
  await getAllProjects().then(async (projects) => {
    for (const project of projects) {
      await resetProject(project.id);
    }
  }),
  await getEverything()
}  

const query = (key: string, cursor?: string) => {
  return storageAPI(Method.query, key, undefined, cursor) as Promise<ListResult<Object>>;
}


const queryEverything = async (key: string, cursor?: string): Promise<Result<Object>[]> => {
  const { results, nextCursor } = await query(key, cursor)
  .catch((error) => {
    console.error('queryEverything', error);
    return {results: [], nextCursor: undefined}
  });
  if (nextCursor) {
    return results.concat(await queryEverything(nextCursor));
  }
  return results;
}

const getEverything = async () => {
  console.log(`Getting Everything`)
  const promises = [
    ... await queryEverything('go'),
    ... await queryEverything('gc'),
    ... await queryEverything('portfolio')
  ]
  Promise.all(promises).then((response) => {
    console.log('Everything: ', response)
    const keys = response.map((element) => {
      return element.key
    })
    const promises = keys.map((key) => {
      storageAPI(Method.delete, key)
    })
    return Promise.all(promises)
  });
}