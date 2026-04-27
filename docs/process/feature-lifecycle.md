# Feature Lifecycle

## Intake
1. Read CLAUDE.md.
2. Read docs/product/vision.md.
3. Read relevant file under docs/product/.

## Planning
1. Run /office-hours when the request is still fuzzy.
2. If no relevant file under docs/product/ exists yet, create or update one before /autoplan.
3. Run /autoplan.
4. For architecture or risk-heavy changes, run /plan-eng-review before implementation.
5. Save the approved plan under docs/superpowers/plans/YYYY-MM-DD-<feature>.md.

## Execution
1. Implement on a feature branch.
2. Keep docs updated in the same branch.
3. Run /review before asking to merge.

## Validation
1. Run project tests.
2. Run /browse or /qa when UI exists.
3. Run /ship only after code and docs match.
