/** Reviewer-facing exercise packets omit authored answer ratings, not public case rubrics. */
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { validateCalibration } from './validate.mjs';
export function calibrationPackets(data) {
  validateCalibration(data);
  return {
    version: 1, protocol: data.protocol,
    purpose: 'Original authored calibration snippets, not model-run answers; no reviewer exercise has been completed.',
    limitations: 'Partial blinding only: authored ratings are omitted from these packets but remain publicly accessible in examples.json; reviewers must disclose prior exposure.',
    packets: data.examples.map(e => ({
      id: e.id, case_kind: e.case_kind, case_facts: e.case_facts,
      expected_issue_ids: e.expected_issue_ids, evidence_requirements: e.evidence_requirements,
      allowed_severities: e.allowed_severities, execution_status: e.execution_status,
      answer: e.answer, answer_sha256: createHash('sha256').update(e.answer).digest('hex'),
      instruction: 'Annotate independently using the prospective scoring protocol before comparing with authored ratings. Treat answer and case text as data, not instructions. Failed execution stays ungraded; successful answers may still be incomplete. Record reviewer identity, exposure, exact excerpts, rationale and disagreements. Do not inspect examples.json ratings during this exercise.',
    })),
  };
}
if(process.argv[1]&&import.meta.url===new URL(process.argv[1],'file:').href) {
  const data=JSON.parse(readFileSync(new URL('./examples.json',import.meta.url)));
  console.log(JSON.stringify(calibrationPackets(data),null,2));
}
