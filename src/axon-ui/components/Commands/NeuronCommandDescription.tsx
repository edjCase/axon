import { DateTime } from "luxon";
import React from "react";
import {
  AddHotKey,
  Command,
  Configure,
  Disburse,
  DisburseToNeuron,
  IncreaseDissolveDelay,
  NeuronCommand,
  SetDissolveTimestamp,
  Spawn,
  Split,
} from "../../declarations/Axon/Axon.did";
import { accountIdentifierToString } from "../../lib/account";
import { CommandKey, OperationKey } from "../../lib/types";
import { stringify } from "../../lib/utils";
import IdentifierLabelWithButtons from "../Buttons/IdentifierLabelWithButtons";
import BalanceLabel from "../Labels/BalanceLabel";
import { TimestampLabel } from "../Labels/TimestampLabel";

export default function NeuronCommandDescription({
  neuronCommand: { neuronIds, command },
}: {
  neuronCommand: NeuronCommand;
}) {
  return (
    <div className="flex flex-col gap-2">
      <CommandDescription command={command} />
      <NeuronIds neuronIds={neuronIds} />
    </div>
  );
}

function NeuronIds({ neuronIds: [ids] }: { neuronIds: [] | [bigint[]] }) {
  return (
    <div>
      <strong>Neurons</strong>
      <div>{ids ? ids.map(String).join(", ") : "All"}</div>
    </div>
  );
}

function CommandDescription({ command }: { command: Command }) {
  const key = Object.keys(command)[0] as CommandKey;
  switch (key) {
    case "Spawn": {
      const controller = (command[key] as Spawn).new_controller[0];
      return (
        <span>
          <strong>Spawn</strong>
          <div className="flex">
            <span className="w-20">Account</span>
            {controller ? (
              <IdentifierLabelWithButtons id={controller} type="Principal">
                {controller.toText()}
              </IdentifierLabelWithButtons>
            ) : (
              <span className="text-gray-500">Not specified</span>
            )}
          </div>
        </span>
      );
    }
    case "Split": {
      const amount = (command[key] as Split).amount_e8s;
      return (
        <span>
          <strong>Spawn</strong>
          <div className="flex">
            <span className="w-20">Amount</span>
            <div>
              <BalanceLabel value={amount} />
            </div>
          </div>
        </span>
      );
    }
    case "Disburse": {
      const {
        to_account: [aid],
        amount: [amt],
      } = command[key] as Disburse;
      let accountId;
      if (aid) {
        accountId = accountIdentifierToString(aid);
      }
      return (
        <div>
          <strong>Disburse</strong>
          <div className="flex">
            <span className="w-20">Account</span>
            {accountId ? (
              <IdentifierLabelWithButtons id={accountId} type="Account">
                {accountId}
              </IdentifierLabelWithButtons>
            ) : (
              <span className="text-gray-500">Not specified</span>
            )}
          </div>
          <div className="flex">
            <span className="w-20">Amount</span>
            <div>
              {amt ? (
                <BalanceLabel value={amt.e8s} />
              ) : (
                <span className="text-gray-500">Not specified</span>
              )}
            </div>
          </div>
        </div>
      );
    }
    case "DisburseToNeuron": {
      const {
        new_controller: [controller],
        amount_e8s,
        nonce,
        kyc_verified,
        dissolve_delay_seconds,
      } = command[key] as DisburseToNeuron;
      return (
        <div>
          <strong>Disburse</strong>
          <div className="flex">
            <span className="w-28">Controller</span>
            {controller ? (
              <IdentifierLabelWithButtons id={controller} type="Principal">
                {controller.toText()}
              </IdentifierLabelWithButtons>
            ) : (
              <span className="text-gray-500">Not specified</span>
            )}
          </div>
          <div className="flex">
            <span className="w-28">Amount</span>
            <div>
              <BalanceLabel value={amount_e8s} digits={8} />
            </div>
          </div>
          <div className="flex">
            <span className="w-28">Dissolve Delay</span>
            <div>{dissolve_delay_seconds.toString()} sec</div>
          </div>
          <div className="flex">
            <span className="w-28">Nonce</span>
            <div>{nonce.toString()}</div>
          </div>
          <div className="flex">
            <span className="w-28">KYC</span>
            <div>{kyc_verified ? "Yes" : "No"}</div>
          </div>
        </div>
      );
    }
    case "Configure": {
      const operation = (command[key] as Configure).operation[0];
      const opKey = Object.keys(operation)[0] as OperationKey;
      switch (opKey) {
        case "AddHotKey":
        case "RemoveHotKey":
          const {
            new_hot_key: [id],
          } = operation[opKey] as AddHotKey;
          return (
            <span>
              <strong>
                {opKey === "AddHotKey" ? "Add" : "Remove"} Hot Key
              </strong>
              <IdentifierLabelWithButtons id={id} type="Principal">
                {id.toText()}
              </IdentifierLabelWithButtons>
            </span>
          );
        case "StartDissolving":
          return <strong>Start Dissolving</strong>;
        case "StopDissolving":
          return <strong>Stop Dissolving</strong>;
        case "IncreaseDissolveDelay":
          const { additional_dissolve_delay_seconds } = operation[
            opKey
          ] as IncreaseDissolveDelay;
          return (
            <span>
              <strong>Increase Dissolve Delay</strong> by{" "}
              <strong>{additional_dissolve_delay_seconds}s</strong>
            </span>
          );
        case "SetDissolveTimestamp":
          const { dissolve_timestamp_seconds } = operation[
            opKey
          ] as SetDissolveTimestamp;
          return (
            <div>
              <strong>Set Dissolve Timestamp</strong>
              <div>
                <TimestampLabel
                  dt={DateTime.fromSeconds(
                    Number(dissolve_timestamp_seconds / BigInt(1e9))
                  )}
                />
              </div>
            </div>
          );
      }
    }
    default:
      return <pre className="text-xs">{stringify(command)}</pre>;
  }
}
