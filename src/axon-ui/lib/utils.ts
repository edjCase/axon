import { Principal } from "@dfinity/principal";
import { Error, GovernanceError } from "../declarations/Axon/Axon.did";

enum GovernanceErrorType {
  "Unspecified" = 0,
  "Ok" = 1,
  "Unavailable" = 2,
  "Not Authorized" = 3,
  "Not Found" = 4,
  "Invalid Command" = 5,
  "Requires Locked" = 6,
  "Requires Dissolving" = 7,
  "Requires Dissolved" = 8,
  "Hot Key" = 9,
  "Resource Exhausted" = 10,
  "Precondition Failed" = 11,
  "External" = 12,
  "Ledger Update Ongoing" = 13,
  "Insufficient Funds" = 14,
  "Invalid Principal" = 15,
  "Invalid Proposal" = 16,
}

export const governanceErrorToString = (error: GovernanceError) =>
  GovernanceErrorType[error.error_type] +
  (error.error_message ? ` (${error.error_message})` : "");

export const errorToString = (error: Error) => {
  if ("GovernanceError" in error) {
    return governanceErrorToString(error.GovernanceError);
  } else if ("Error" in error) {
    return (
      `[${error.Error.error_type}]` +
      (error.Error.error_message ? ` (${error.Error.error_message})` : "")
    );
  } else {
    return Object.keys(error)[0];
  }
};

export const formatNumber = (number: any, digits?: number) => {
  let n = number;
  if (typeof number !== "number") {
    n = Number(n);
  }
  const maximumFractionDigits =
    typeof digits === "undefined" ? (number < 1 ? 8 : 4) : digits;
  return Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(n);
};

export const shortPrincipal = (principal: string | Principal) => {
  const parts = (
    typeof principal === "string" ? principal : principal.toText()
  ).split("-");
  return `${parts[0]}...${parts.slice(-1)[0]}`;
};
