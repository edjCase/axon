import { DateTime, Duration } from "luxon";
import { DissolveState, Neuron } from "../declarations/Axon/Axon.did";
import { formatDuration, secondsToDuration } from "./datetime";

export const parseDissolveState = (dissolveState: DissolveState) => {
  let state: string, duration: Duration, seconds: number;
  if ("DissolveDelaySeconds" in dissolveState) {
    seconds = Number(dissolveState.DissolveDelaySeconds);
    if (dissolveState.DissolveDelaySeconds === BigInt(0)) {
      state = "Dissolved";
    } else {
      state = "Locked";
      duration = secondsToDuration(seconds);
    }
  } else {
    state = "Dissolving";
    duration = DateTime.fromSeconds(
      Number(dissolveState.WhenDissolvedTimestampSeconds)
    ).diffNow(["years", "months", "days", "hours", "minutes"]);
    seconds = duration.toMillis() / 1000;
  }
  return {
    state,
    duration,
    seconds,
    dissolveDelay: duration ? formatDuration(duration) : null,
  };
};

export const calculateVotingPower = (neuron: Neuron) => {
  const { seconds } = parseDissolveState(neuron.dissolve_state[0]);
  if (seconds < 180 * 24 * 60 * 60) {
    return 0;
  } else {
    const delayMultiplier = 1 + Math.min(seconds, 252460800) / 252460800;
    const ageMultiplier =
      neuron.aging_since_timestamp_seconds < BigInt("2000000000")
        ? 1 +
          Math.min(
            DateTime.fromSeconds(Number(neuron.aging_since_timestamp_seconds))
              .diffNow()
              .toMillis() / 1000,
            126230400
          ) /
            126230400
        : 1;
    return (
      Number(neuron.cached_neuron_stake_e8s) * delayMultiplier * ageMultiplier
    );
  }
};