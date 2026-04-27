# Diary Entry MVP

## User Story

As the user, I want to write an entry for a chosen date, see previous entries, and update or remove an entry later.

## Required Capabilities

1. Create a diary entry with `title`, `content`, and `entryDate`.
2. View saved diary entries in reverse chronological order.
3. Open an existing entry, edit its `title`, `content`, or `entryDate`, and save the updated version.
4. Delete an existing entry only after an explicit confirmation step.

For v1, `entryDate` is a user-chosen calendar date, not a stored timestamp. It should be represented as `YYYY-MM-DD` using the user's local timezone. Lists are sorted by `entryDate` descending, and if two entries share the same `entryDate`, the most recently saved entry appears first.

## Acceptance Criteria

- Empty title is rejected.
- Empty content is rejected.
- A saved entry appears without a manual refresh.
- `entryDate` is handled as a user-chosen calendar date in `YYYY-MM-DD` format using the user's local timezone for v1.
- Saved entries are shown in reverse-chronological order by `entryDate`.
- When two entries share the same `entryDate`, the most recently saved entry appears first.
- Editing an entry persists the updated values.
- Deleting an entry requires an explicit confirmation step before removal.
- Deleting an entry removes it from the diary.

## Open Questions

These questions are currently resolved to `no` for v1 and are recorded here to prevent scope creep.

- Draft autosave for v1: no
- Tags for v1: no
- Mood metadata for v1: no
