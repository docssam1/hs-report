# Final 2–4 protected baseline source audit

Date: 2026-09-09

Status: extraction verified; private candidates remain unapproved

## Scope and selection contract

- Each round is reconstructed only from its own provided 2024 workbook snapshot.
- The canonical answer sheet is `{round}회답안`.
- Question headers are `M3:AP3` (1–30), weights are `M2:AP2`, marks are
  `M:AP`, and the recorded score is `BK`.
- A source record is eligible only when its identity cell is nonblank and `BK`
  contains a recorded numeric score. No absent or entirely unmarked record is
  converted into a zero-score participant.
- The source sheets encode correct answers as `1` and incorrect answers as
  blank. Every selected row contains an explicit mark, and every `BK` score
  exactly equals the weighted sum of its correct marks.
- Row records are preserved independently. They are not merged or removed by
  identity text.

The private candidate contract is:

`{schemaVersion, exam, scope: "provided-original-records", approved: false, version, rows: [{id, ox, score}]}`

The version is a digest of the derived baseline content. It is not a workbook
file hash or a source-path fingerprint.

## Verified results

| Round | Derived mean (1 decimal) | Public mean/rates | Item type binding | Independent source binding |
| --- | ---: | --- | --- | --- |
| Final 2 | 28.4 | all 30 rates match at published precision | all 30 labels match | pass |
| Final 3 | 28.0 | all 30 rates match at published precision | all 30 labels match | pass |
| Final 4 | 25.2 | all 30 rates match at published precision | all 30 labels match | pass |

The complete private score distribution is reconstructible from the verified
row-bound candidates. Synthetic zero-score padding is not part of the source
population.

An independent raw-OOXML reader, separate from the OpenPyXL extractor, verified
all three candidates for:

- source-row binding;
- 30-item O/X reconstruction;
- integer-tenths weighted scoring;
- complete eligible-row inclusion; and
- unchanged source files.

## Manual summary reconciliation

The question-summary cells `G3:G32` use manual `H` counts divided by a fixed
denominator. They do not recompute from the canonical answer-sheet rows and were
therefore not selected as the population-rate source.

Differences between those manual summary rates and the row-derived rates:

- Final 2: questions 1–6, 8–20, 22–23, 25–30; maximum absolute difference
  0.080645.
- Final 3: questions 1–24, 26, 28–30; maximum absolute difference 0.038961.
- Final 4: questions 1–21, 23–25, 27–30; maximum absolute difference 0.105220.

The summary-sheet item numbers and type labels do match the corresponding public
round items, so the disagreement is cohort/aggregation provenance rather than a
question-order mismatch.

## Grade-cut boundary

Existing grade-cut values are preserved as product policy. Observed minimum
scores inside the source `BO` categories are not treated as threshold cells:
the lowest observed qualifying score can legitimately be above a decision
threshold. This audit does not infer, replace, or re-label any grade cut from
category minima.

## Approval and privacy boundary

- The ignored extraction candidates retain `approved: false`.
- Runtime approval is a separate reviewed copy step.
- No original workbook or student database was edited.
- This record contains no student identities, raw rows, participant totals,
  private source paths, or workbook hashes.
