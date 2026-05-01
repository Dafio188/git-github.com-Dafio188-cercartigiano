# Firebase Security Specification

## Data Invariants
1. A user profile (`users/{userId}`) can only be modified by its owner or an admin.
2. An admin is a user whose email is `fio.davide@gmail.com` or `admin@cercartigiano.it`.
3. Worker profiles (`workerProfiles/{userId}`) are associated with the user UID.
4. Jobs (`jobs/{jobId}`) are created by clients, updated by their clients or an admin.
5. Conversations (`conversations/{convId}`) must have the user's ID in the `participants` array to read/write.
6. Messages (`messages/{msgId}`) must be associated with a valid conversation.
7. Proposals (`proposals/{proposalId}`) can only be created by workers.

## The Dirty Dozen Payloads
1. User Profile Spoof: `{"id": "otherId"}` payload sent to `users/myId`.
2. Admin Privilege Escalation: `{"role": "admin"}` sent by a client to their own profile.
3. Job Override: Random user updating a job's status to `completed`.
4. Job Deletion: non-admin attempting to delete a job.
5. Reading Private Conversation: User requesting a conversation they are not in.
6. Worker Profile Impersonation: Creating a `workerProfiles/otherUser` data.

## Test Runner
Defined in `firestore.rules.test.ts`.
