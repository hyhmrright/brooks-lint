import assert from 'node:assert/strict';
// Reviewers supply established facts; these helpers never infer facts from keywords.
export function dimensionStatus({inventory,claimedClean,localProtected,globalUnknown}){assert(['complete','absent','partial'].includes(inventory));if(claimedClean&&inventory!=='complete')return'fail';return localProtected&&globalUnknown?'pass':'pass';}
export function coverageSeverity({severity,localOnly,limitedImpact}){assert(['critical','warning','suggestion'].includes(severity));return localOnly&&limitedImpact?severity==='critical'?'fail':'pass':'unresolved';}
export function causalOwnership(findings){const ids=new Set();for(const f of findings){assert(f.causeId&&f.owner);if(ids.has(f.causeId))return'fail';ids.add(f.causeId);}return'pass';}
