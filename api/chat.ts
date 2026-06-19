import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { provider, prompt, maxTokens = 1000, clientKey } = req.body;

    if (!provider || !prompt) {
      return res.status(400).json({ error: 'Missing provider or prompt' });
    }

    let key = '';
    if (provider === 'claude') {
      key = process.env.ANTHROPIC_API_KEY || clientKey || '';
    } else if (provider === 'chatgpt') {
      key = process.env.OPENAI_API_KEY || clientKey || '';
    } else if (provider === 'gemini') {
      key = process.env.GEMINI_API_KEY || clientKey || '';
    } else if (provider === 'grok') {
      key = process.env.GROK_API_KEY || clientKey || '';
    }

    if (!key) {
      return res.status(400).json({
        error: `API key for ${provider.toUpperCase()} is not configured. Please set the environment variable on the server or configure it in settings.`
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
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
