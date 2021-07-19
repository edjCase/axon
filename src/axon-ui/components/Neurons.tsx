import { Principal } from "@dfinity/principal";
import { DateTime } from "luxon";
import React from "react";
import { CgSpinner } from "react-icons/cg";
import { GovernanceError, Neuron } from "../declarations/Axon/Axon.did";
import { subaccountToAccount } from "../lib/account";
import { useNeuronIds } from "../lib/hooks/useNeuronIds";
import { useNeurons } from "../lib/hooks/useNeurons";
import { governanceErrorToString } from "../lib/utils";
import IdentifierLabelWithButtons from "./Buttons/IdentifierLabelWithButtons";
import BalanceLabel from "./Labels/BalanceLabel";
import { DissolveStateLabel } from "./Labels/DissolveStateLabel";
import { TimestampLabel } from "./Labels/TimestampLabel";
import ManageNeuronModal from "./ManageNeuronModal";
import { useGlobalContext } from "./Store";
import SyncForm from "./SyncForm";

const governanceCanister = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");

function NeuronDisplay({ neuron }: { neuron: Neuron }) {
  const controller = neuron.controller[0];
  const account = subaccountToAccount(governanceCanister, neuron.account);
  console.log(neuron);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col md:flex-row leading-tight">
        <div className="w-32 font-bold">Account</div>
        <div>
          <IdentifierLabelWithButtons type="Account" id={account}>
            {account}
          </IdentifierLabelWithButtons>
        </div>
      </div>
      <div className="flex flex-col md:flex-row leading-tight">
        <div className="w-32 font-bold">Controller</div>
        <div>
          <IdentifierLabelWithButtons type="Principal" id={controller}>
            {controller.toText()}
          </IdentifierLabelWithButtons>
        </div>
      </div>
      <div className="flex flex-col md:flex-row leading-tight">
        <div className="w-32 font-bold">Hot Keys</div>
        <div>
          <ul>
            {neuron.hot_keys.map((hotkey) => (
              <li key={hotkey.toText()}>
                <IdentifierLabelWithButtons type="Principal" id={hotkey}>
                  {hotkey.toText()}
                </IdentifierLabelWithButtons>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex flex-col md:flex-row leading-tight">
        <div className="w-32 font-bold">Followees</div>
        <div>
          <ul>
            {neuron.followees.map(([topic, followee]) => (
              <li key={topic} className="divide-x divide-gray-400">
                <label className="pr-2">{topic}</label>
                <span className="pl-2">
                  {followee.followees.map((f) => f.id).join(", ")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex flex-col md:flex-row leading-tight">
        <div className="w-32 font-bold">Created</div>
        <div>
          <TimestampLabel
            dt={DateTime.fromSeconds(Number(neuron.created_timestamp_seconds))}
          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row leading-tight">
        <div className="w-32 font-bold">Aging Since</div>
        <div>
          <TimestampLabel
            dt={DateTime.fromSeconds(
              Number(neuron.aging_since_timestamp_seconds)
            )}
          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row leading-tight">
        <div className="w-32 font-bold">Stake</div>
        <div>
          <BalanceLabel value={neuron.cached_neuron_stake_e8s} />
        </div>
      </div>
      <div className="flex flex-col md:flex-row leading-tight">
        <div className="w-32 font-bold">Maturity</div>
        <div>
          <BalanceLabel value={neuron.maturity_e8s_equivalent} />
        </div>
      </div>
      <div className="flex flex-col md:flex-row leading-tight">
        <div className="w-32 font-bold">State</div>
        <div>
          {neuron.dissolve_state[0] ? (
            <DissolveStateLabel state={neuron.dissolve_state[0]} />
          ) : (
            "-"
          )}
        </div>
      </div>
    </div>
  );
}

export default function Neurons() {
  const {
    state: { isAuthed },
  } = useGlobalContext();

  const {
    data: neuronIds,
    isFetching: isFetchingNeuronIds,
    error: errorNeuronIds,
  } = useNeuronIds();
  const {
    data: neurons,
    isFetching: isFetchingNeurons,
    error: errorNeurons,
  } = useNeurons();

  return (
    <section className="p-4 bg-gray-50 rounded-lg shadow-lg">
      <div className="flex justify-between mb-2">
        <div className="flex gap-2 items-center">
          <h2 className="text-xl font-bold">Neurons</h2>
          {isFetchingNeuronIds && (
            <CgSpinner className="inline-block animate-spin" />
          )}
        </div>
        <ManageNeuronModal />
      </div>
      {neuronIds.length > 0 ? (
        <ul className="divide-y divide-gray-500">
          {neuronIds.map((n, i) => {
            let display = null;
            if (neurons[i]) {
              if ("id" in neurons[i]) {
                display = <NeuronDisplay neuron={neurons[i] as Neuron} />;
              } else {
                display = governanceErrorToString(
                  neurons[i] as GovernanceError
                );
              }
            }

            return (
              <li key={n.toString()}>
                <div className="flex items-center gap-2">
                  <IdentifierLabelWithButtons type="Neuron" id={n}>
                    <strong>{n.toString()}</strong>
                  </IdentifierLabelWithButtons>
                  {isFetchingNeurons && (
                    <CgSpinner className="block animate-spin" />
                  )}
                </div>
                {display}
              </li>
            );
          })}
        </ul>
      ) : (
        "None"
      )}
      {(errorNeuronIds || errorNeurons) && (
        <p className="px-2 py-1 rounded border border-red-500 bg-red-200 text-red-500 text-sm">
          {errorNeuronIds}
          {errorNeurons}
        </p>
      )}
      {isAuthed && <SyncForm />}
    </section>
  );
}
