import {diagnose as historicalDiagnosis} from '../capability-efficacy-v2-recovery2/diagnostics.mjs';

export function diagnose(raw) {
  const diagnostic = historicalDiagnosis(raw);
  return {
    ...diagnostic,
    accountRpc: raw.account_rpc ?? null,
    processGroupObservation: raw.cleanup?.observations ?? [],
    privateHomeRemoved: raw.cleanup?.private_home_removed ?? null,
  };
}
