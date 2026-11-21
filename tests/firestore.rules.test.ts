// @vitest-environment node
import fs from 'node:fs';
import path from 'node:path';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

const PROJECT_ID = 'demo-textify';
let testEnv: RulesTestEnvironment;

describe('Firestore Security Rules (Phase 4/6 Lean Path)', () => {
  beforeAll(async () => {
    const rules = fs.readFileSync(path.resolve(__dirname, '../firestore.rules'), 'utf8');
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules,
        host: '127.0.0.1',
        port: 8080,
      },
    });
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    if (testEnv) {
      await testEnv.clearFirestore();
    }
  });

  it('1. Denies unauthenticated read to documents collection', async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const docRef = unauthedDb.doc('users/alice/documents/doc1');
    await assertFails(docRef.get());
  });

  it('2. Denies unauthenticated write to documents collection', async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const docRef = unauthedDb.doc('users/alice/documents/doc1');
    await assertFails(
      docRef.set({
        title: 'Unauthorized Doc',
        timestamp: Date.now(),
        blocks: [],
      })
    );
  });

  it('3. Allows user to create valid document under their own uid', async () => {
    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    const docRef = aliceDb.doc('users/alice/documents/doc1');
    await assertSucceeds(
      docRef.set({
        title: 'Alice Document',
        timestamp: Date.now(),
        isPinned: false,
        pinnedAt: null,
        blocks: [
          {
            id: 'block-1',
            text: 'Extracted text sample',
            timestamp: Date.now(),
            order: 1000,
          },
        ],
      })
    );
  });

  it('4. Denies creating document with unauthorized/fictional fields', async () => {
    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    const docRef = aliceDb.doc('users/alice/documents/doc1');
    await assertFails(
      docRef.set({
        title: 'Alice Document',
        timestamp: Date.now(),
        role: 'admin',
        createdAt: Date.now(),
      })
    );
  });

  it('5. Denies creating document with title exceeding 200 characters', async () => {
    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    const docRef = aliceDb.doc('users/alice/documents/doc1');
    await assertFails(
      docRef.set({
        title: 'a'.repeat(201),
        timestamp: Date.now(),
        blocks: [],
      })
    );
  });

  it('6. Denies creating document with invalid block shape in blocks array', async () => {
    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    const docRef = aliceDb.doc('users/alice/documents/doc1');
    await assertFails(
      docRef.set({
        title: 'Invalid Blocks Doc',
        timestamp: Date.now(),
        blocks: [
          {
            id: 'b1',
            text: 'valid',
            timestamp: Date.now(),
            illegalField: true,
          },
        ],
      })
    );
  });

  it('7. Allows user to update permitted fields on their own document', async () => {
    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    const docRef = aliceDb.doc('users/alice/documents/doc1');
    await assertSucceeds(
      docRef.set({
        title: 'Initial Title',
        timestamp: Date.now(),
        isPinned: false,
        pinnedAt: null,
        blocks: [],
      })
    );
    await assertSucceeds(
      docRef.update({
        title: 'Updated Title',
        isPinned: true,
        pinnedAt: Date.now(),
      })
    );
  });

  it('8. Denies user B from reading user A documents', async () => {
    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    const docRefAlice = aliceDb.doc('users/alice/documents/doc1');
    await assertSucceeds(
      docRefAlice.set({
        title: 'Alice Private Doc',
        timestamp: Date.now(),
        blocks: [],
      })
    );

    const bobDb = testEnv.authenticatedContext('bob').firestore();
    const docRefBobViewingAlice = bobDb.doc('users/alice/documents/doc1');
    await assertFails(docRefBobViewingAlice.get());
  });

  it('9. Denies user B from updating or deleting user A documents', async () => {
    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    const docRefAlice = aliceDb.doc('users/alice/documents/doc1');
    await assertSucceeds(
      docRefAlice.set({
        title: 'Alice Private Doc',
        timestamp: Date.now(),
        blocks: [],
      })
    );

    const bobDb = testEnv.authenticatedContext('bob').firestore();
    const docRefBobViewingAlice = bobDb.doc('users/alice/documents/doc1');
    await assertFails(docRefBobViewingAlice.update({ title: 'Hacked by Bob' }));
    await assertFails(docRefBobViewingAlice.delete());
  });

  it('10. Allows user to read own usage document but denies client writes to usage', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().doc('users/alice/usage/2026-11-21').set({ count: 5 });
    });

    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    const usageRef = aliceDb.doc('users/alice/usage/2026-11-21');
    await assertSucceeds(usageRef.get());
    await assertFails(usageRef.set({ count: 10 }));
    await assertFails(usageRef.update({ count: 0 }));
  });
});
