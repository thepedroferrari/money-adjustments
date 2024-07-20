import { defer, LoaderFunctionArgs } from "react-router-dom";
import { syncData } from "../utils/firebaseFunctions";
import { useStore } from "../hooks/useStore";

export const expensesLoader = async ({ params }: LoaderFunctionArgs) => {
  const { groupId, expenseName } = params;

  if (!groupId || !expenseName) {
    throw new Error("Missing groupId or expenseName");
  }

  const store = useStore.getState();

  if (store.data.length === 0) {
    const result = await syncData(groupId, expenseName);

    store.setData(result.expenses);

    return defer({ expenses: result.expenses });
  }

  return defer({});
};
