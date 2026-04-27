# Diary Entry MVP

## User Story

As the user, I want to write today's entry, see previous entries, and update or remove an entry later.

## Required Capabilities

1. Create a diary entry with `title`, `content`, and `entryDate`.
2. View saved diary entries in reverse chronological order.
3. Open an existing entry, edit its `title`, `content`, or `entryDate`, and save the updated version.
4. Delete an existing entry only after an explicit confirmation step.

## Acceptance Criteria

- Empty title is rejected.
- Empty content is rejected.
- A saved entry appears without a manual refresh.
- Saved entries are shown in reverse-chronological order by `entryDate`.
- Editing an entry persists the updated values.
- Deleting an entry requires an explicit confirmation step before removal.
- Deleting an entry removes it from the diary.

## Open Questions

These questions are currently resolved to `no` for v1 and are recorded here to prevent scope creep.

- Draft autosave for v1: no
- Tags for v1: no
- Mood metadata for v1: no
