import { startStagedRequest } from '../shared/deadline-stages.mjs';

export function startLeaf({ clock, signal }) {
  return startStagedRequest({ clock, signal, setupDuration: 0, workDuration: 60, timeout: 60 });
}
