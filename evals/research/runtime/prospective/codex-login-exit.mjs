/** Process status for the offline probe; never treats unconfirmed cleanup as success. */
export function probeExitCode(record) {
  return record && !record.error && record.cleanup?.phase === 'complete' &&
    record.cleanup.absence_confirmed === true ? 0 : 1;
}

/** Preserve spawn failures in evidence and prevent uncaught child error events. */
export function trackChildErrors(child, record, name) {
  child.on('error', error => {
    (record.child_errors ??= []).push({name, code: error.code ?? 'UNKNOWN'});
    record.error ??= `${name} spawn failed: ${error.code ?? 'UNKNOWN'}`;
  });
  return child;
}
