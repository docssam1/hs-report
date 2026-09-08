# Final2 selected detailed-solution integration contract

## Scope

- This package covers only questions `1, 3, 4, 6, 7, 8, 10, 11, 12, 15, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30` in Final round 2.
- The other 7 questions remain pending. Do not render a placeholder as a verified solution and do not infer their content from short legacy comments.
- The package does not change canonical answers, scores, grades, population statistics, or learner records.

## Load and resolve

1. Load `mock-data-final.js` as the canonical question/answer source.
2. For Final round 2 only, load `final2-solution-diagrams.js` and then `final2-detailed-data.js`.
3. For each canonical round item, call `GFIELD_FINAL2_RESOLVE_SOLUTION(item)`.
4. A non-null result is answer-bound and includes Final1-style fields: `title`, `read`, `method`, `steps`, `check`, and `caution`. `comment` is a compatibility projection of those fields, not a separate source.
5. Questions 12 and 28 additionally require their registered renderers. Q12 is derived from the reviewed path topology, and its interior positions are representative rather than asserted midpoints. Q28 is derived from the reviewed 18-edge weighted graph and marks only AG, CH, and EI as repeated roads.

## Visibility and failure behavior

- Detailed answers are `post-attempt-only` and must stay behind the existing answer-visibility boundary.
- Independent second-pass review is complete for the selected 23 questions. Resolution still fails closed when the question number is outside that set, the canonical answer differs, the reviewed set is duplicated or incomplete, or a required Q12 or Q28 diagram renderer is unavailable.
- `evidenceStatus: verified` records that the source conditions, initial recomputation, learner fit, sequencing, representation, and answer boundary were checked and then independently reviewed.
- `independentReviewStatus: verified` and `releaseStatus: eligible` authorize these 23 details only for the existing post-attempt answer view. They do not certify the other 7 questions, population statistics, publication, or deployment.
- The independent review read all six rendered source pages directly, independently recomputed the 22 non-drawing answers and their lower bounds or constructions, and separately traced Q12 by dropping height without assuming that any unmarked point is a midpoint. The public review record is `qa/final2-detailed-review.json`.

## Integration check

Run these isolated validators before page-level QA:

```text
node qa/final2-detailed-data-validate.js
node qa/final2-detail-math-validate.js
node qa/final2-detail-projection-validate.js
```

Page integration must confirm that only the reviewed 23 resolve, the canonical answer text is unchanged, Q12 and Q28 each draw once, and the answer content is not exposed before the existing reveal boundary. Q27 and Q28 may use complete, clearly headed continuation pages rather than shrinking the 9.5pt body text. `published: false` in the review record means this approval is not a deployment claim.
