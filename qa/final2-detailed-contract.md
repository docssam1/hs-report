# Final2 detailed-solution integration contract

## Scope

- This independently reviewed set covers all questions `1` through `30` in Final round 2.
- Q5 uses the independently resolved source contract that “meeting” includes countries touching at the same point. Its answer remains the canonical `4가지`; the derived diagram must emphasize the existing point without inventing an A–B border segment.
- The package does not change canonical answers, scores, grades, population statistics, or learner records.
- The 23 previously released explanations keep their educational fields exactly. The seven newly eligible explanations are Q2, Q5, Q9, Q13, Q14, Q16, and Q17.

## Load and resolve

1. Load `mock-data-final.js` as the canonical question/answer source.
2. For Final round 2 only, load `final2-solution-diagrams.js` and then `final2-detailed-data.js`.
3. For each canonical round item, call `GFIELD_FINAL2_RESOLVE_SOLUTION(item)`.
4. A non-null result is answer-bound and includes Final1-style fields: `title`, `read`, `method`, `steps`, `check`, and `caution`. `comment` is a compatibility projection of those fields, not a separate source.
5. Q2, Q5, Q9, Q12, Q13, Q16, and Q28 require the exact registered diagram named by the item. A missing or mismatched renderer must fail closed for that question.

## Release gate

- The checked-in contract is independently reviewed and eligible: `independentReviewStatus: verified` and `releaseStatus: eligible`.
- The public resolver exposes the full 30-item set only after the existing post-attempt answer boundary. Demoting either approval status makes every item fail closed.
- All five new diagram renderers, the exact 30-item integration, and the actual mobile/A4/PDF surface passed their required reviews before this status transition.
- Detailed answers remain `post-attempt-only` behind the existing answer-visibility boundary.

## Verification

Run the isolated validators before page-level QA:

```text
node qa/final2-detailed-data-validate.js
node qa/final2-detail-math-validate.js
node qa/final2-detail-projection-validate.js
node qa/final2-detailed-renderer-validate.js
```

The data validator binds all 30 numbers, canonical answers, seven diagram IDs, known source pages, the approved Q5 public projection, and a SHA-256 projection of the previously released 23 educational explanations. Page integration must render exactly 30 ready cards, keep the existing reveal boundary, and display all required diagrams and tables. The reviewed output uses 36 detail pages and 50 package pages, with headed continuation pages for Q5, Q9, Q13, Q16, Q27, and Q28; the earlier 23-item and 29-item artifact generations remain separate evidence.

No validator result is a publication or deployment claim. `published: false` remains explicit in the public review record until the root integrator completes release.
