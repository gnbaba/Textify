import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // 1. Method Guard: Reject non-POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  // 2. Pre-Quota Server Configuration Check
  const apiKey = process.env.GEMINI_API_KEY;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!apiKey || !projectId || !clientEmail || !privateKey) {
    res.status(503).json({
      error: 'Server AI service is currently unconfigured or unavailable.',
    });
    return;
  }

  // 3. Authorization Header Extraction
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or malformed authorization header.' });
    return;
  }
  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Token is missing.' });
    return;
  }

  // 4. Pre-Quota Payload Validation (Reject bad requests before touching Firestore)
  const body = req.body as { imageBase64?: unknown; mimeType?: unknown; mode?: unknown } | null;
  if (!body || typeof body !== 'object') {
    res.status(400).json({ error: 'Invalid request body.' });
    return;
  }

  const { imageBase64, mimeType, mode } = body;
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    res.status(400).json({ error: 'Missing or invalid imageBase64 payload.' });
    return;
  }

  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!mimeType || typeof mimeType !== 'string' || !allowedMimeTypes.includes(mimeType)) {
    res
      .status(400)
      .json({ error: 'Invalid mimeType. Allowed types: image/jpeg, image/png, image/webp.' });
    return;
  }

  const base64Data = imageBase64.replace(/^data:image\/[^;]+;base64,/, '').trim();
  const byteLength = Buffer.byteLength(base64Data, 'base64');
  if (byteLength > 2.5 * 1024 * 1024) {
    res.status(413).json({ error: 'Payload Too Large: image exceeds 2.5MB cap.' });
    return;
  }

  // 5. Firebase Admin Singleton Initialization & Token Verification
  let app: ReturnType<typeof getApp>;
  if (getApps().length > 0) {
    app = getApp();
  } else {
    app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  const auth = getAuth(app);
  const adminDb = getFirestore(app);

  let decoded: { uid: string };
  try {
    decoded = await auth.verifyIdToken(token);
  } catch (authErr) {
    console.error('Firebase ID token verification failed:', authErr);
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token.' });
    return;
  }

  // 6. Atomic Daily Quota Increment (20 Scans/Day per user)
  const today = new Date().toISOString().split('T')[0];
  const usageRef = adminDb.doc(`users/${decoded.uid}/usage/${today}`);
  try {
    await adminDb.runTransaction(async (t) => {
      const snap = await t.get(usageRef);
      const count = (snap.data()?.count || 0) + 1;
      if (count > 20) {
        throw new Error('DAILY_QUOTA_EXCEEDED');
      }
      t.set(usageRef, { count }, { merge: true });
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg === 'DAILY_QUOTA_EXCEEDED') {
      res.status(429).json({ error: 'Daily Cloud AI quota exceeded (20/day).' });
      return;
    }
    console.error('Usage quota transaction error:', err);
    res.status(500).json({ error: 'Failed to record quota transaction.' });
    return;
  }

  // 7. Gemini API Request with 15s Deadline
  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  const prompt =
    mode === 'graphic'
      ? 'Extract text from this image. It contains a single block of text or logotype. Return only the extracted text as-is, with no introductory text, no comments, and no markdown wrapping.'
      : 'Perform OCR on this image. Extract all text exactly as written, preserving layouts, paragraphs, tables (as markdown), and lists. Return only the extracted text with no conversational intro/outro and no wrapper.';

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  try {
    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      res.status(geminiRes.status).json({
        error: `Gemini API error (HTTP ${geminiRes.status}): ${errText}`,
      });
      return;
    }

    const resJson = (await geminiRes.json()) as {
      promptFeedback?: { blockReason?: string };
      candidates?: Array<{
        finishReason?: string;
        content?: {
          parts?: Array<{ thought?: boolean; text?: string }>;
        };
      }>;
    };

    if (resJson.promptFeedback?.blockReason) {
      res.status(422).json({
        error: `Content generation blocked: ${resJson.promptFeedback.blockReason}`,
      });
      return;
    }

    if (!resJson.candidates || resJson.candidates.length === 0) {
      res.status(422).json({
        error: 'No text candidates returned by Gemini Vision.',
      });
      return;
    }

    const candidate = resJson.candidates[0];
    const rawParts = candidate.content?.parts || [];
    const textParts = rawParts
      .filter((part) => !part.thought && typeof part.text === 'string')
      .map((part) => part.text as string);

    const extractedText = textParts.join('').trim();
    if (!extractedText) {
      res.status(422).json({
        error: 'No readable text recognized in image.',
      });
      return;
    }

    res.status(200).json({ text: extractedText });
  } catch (err: unknown) {
    if (err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError')) {
      res.status(504).json({ error: 'Gemini Vision API timed out (15s deadline exceeded).' });
      return;
    }
    console.error('Gemini proxy error:', err);
    res.status(500).json({ error: 'Internal OCR server error.' });
  }
}
