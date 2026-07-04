import type { VercelRequest, VercelResponse } from '@vercel/node';

// Allowlist of origins permitted to call this proxy.
// Add your production domain(s) here.
const ALLOWED_ORIGINS = [
  'https://90days-devops.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'capacitor://localhost',       // iOS Capacitor
  'http://localhost',            // Android Capacitor
];

function getCorsOrigin(req: VercelRequest): string {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  return '';  // reject unknown origins
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const corsOrigin = getCorsOrigin(req);

  // Set CORS headers — only for allowed origins
  if (corsOrigin) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', corsOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Accept, x-user-api-key'
    );
  }

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Reject requests from unknown origins
  if (!corsOrigin) {
    return res.status(403).json({ error: 'Forbidden: origin not allowed' });
  }

  try {
    const { provider, prompt, maxTokens = 1000 } = req.body;

    if (!provider || !prompt) {
      return res.status(400).json({ error: 'Missing provider or prompt' });
    }

    // Accept client-supplied keys if provided (to bypass CORS blocks for browser clients)
    // Otherwise fallback to server-side environment variables.
    const userApiKey = req.headers['x-user-api-key'] as string | undefined;
    let key = userApiKey || '';

    if (!key) {
      if (provider === 'claude') {
        key = process.env.ANTHROPIC_API_KEY || '';
      } else if (provider === 'chatgpt') {
        key = process.env.OPENAI_API_KEY || '';
      } else if (provider === 'gemini') {
        key = process.env.GEMINI_API_KEY || '';
      } else if (provider === 'grok') {
        key = process.env.GROK_API_KEY || '';
      }
    }

    if (!key) {
      return res.status(400).json({
        error: `API key for ${provider.toUpperCase()} is not configured on the server. Please set the environment variable.`
      });
    }

    if (provider === 'claude') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: maxTokens,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: `Claude API error: ${errorText}` });
      }

      const data = await response.json();
      const text = data.content && data.content[0] ? data.content[0].text : '';
      return res.status(200).json({ text });
    }

    if (provider === 'chatgpt') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: maxTokens,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: `ChatGPT API error: ${errorText}` });
      }

      const data = await response.json();
      const text = data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : '';
      return res.status(200).json({ text });
    }

    if (provider === 'gemini') {
      // BUG-008 FIX: Use x-goog-api-key header instead of URL query parameter
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': key
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: `Gemini API error: ${errorText}` });
      }

      const data = await response.json();
      const text = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] ? data.candidates[0].content.parts[0].text : '';
      return res.status(200).json({ text });
    }

    if (provider === 'grok') {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'grok-beta',
          max_tokens: maxTokens,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: `Grok API error: ${errorText}` });
      }

      const data = await response.json();
      const text = data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : '';
      return res.status(200).json({ text });
    }

    return res.status(400).json({ error: 'Unsupported AI provider' });

  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Internal server error' });
  }
}
