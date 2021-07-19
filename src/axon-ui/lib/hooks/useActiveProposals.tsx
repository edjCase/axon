import { useQuery } from "react-query";
import { useAxon } from "../../components/Store";
import { errorToString } from "../utils";

export const useActiveProposals = () => {
  const axon = useAxon();
  return useQuery(
    "activeProposals",
    async () => {
      const result = await axon.getActiveProposals();
      if ("ok" in result) {
        return result.ok;
      } else {
        throw errorToString(result.err);
      }
    },
    {
      placeholderData: [],
    }
  );
};