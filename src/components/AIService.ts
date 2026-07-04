import { SecurityService } from './SecurityService';

export type AIProvider = 'claude' | 'chatgpt' | 'gemini' | 'grok';

export const PROVIDER_STORAGE_KEY = 'devops90_active_ai_provider';
export const KEYS_STORAGE_KEYS: Record<AIProvider, string> = {
  claude: 'devops90_anthropic_api_key',
  chatgpt: 'devops90_openai_api_key',
  gemini: 'devops90_gemini_api_key',
  grok: 'devops90_grok_api_key'
};

export function getActiveProvider(): AIProvider {
  return (localStorage.getItem(PROVIDER_STORAGE_KEY) as AIProvider) || 'claude';
}

export function setActiveProvider(provider: AIProvider) {
  localStorage.setItem(PROVIDER_STORAGE_KEY, provider);
}

export async function getProviderKey(provider: AIProvider): Promise<string> {
  if (provider === 'claude' && import.meta.env.VITE_ANTHROPIC_API_KEY) {
    return import.meta.env.VITE_ANTHROPIC_API_KEY;
  }
  if (provider === 'chatgpt' && import.meta.env.VITE_OPENAI_API_KEY) {
    return import.meta.env.VITE_OPENAI_API_KEY;
  }
  if (provider === 'gemini' && import.meta.env.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  if (provider === 'grok' && import.meta.env.VITE_GROK_API_KEY) {
    return import.meta.env.VITE_GROK_API_KEY;
  }
  return SecurityService.getSecureCredential(KEYS_STORAGE_KEYS[provider]);
}

export async function saveProviderKey(provider: AIProvider, key: string) {
  await SecurityService.saveSecureCredential(KEYS_STORAGE_KEYS[provider], key.trim());
}

export async function clearAllKeys() {
  localStorage.removeItem(PROVIDER_STORAGE_KEY);
  await SecurityService.removeSecureCredential(KEYS_STORAGE_KEYS.claude);
  await SecurityService.removeSecureCredential(KEYS_STORAGE_KEYS.chatgpt);
  await SecurityService.removeSecureCredential(KEYS_STORAGE_KEYS.gemini);
  await SecurityService.removeSecureCredential(KEYS_STORAGE_KEYS.grok);
}

// Backward compatibility aliases
export const ANTHROPIC_KEY_STORAGE = KEYS_STORAGE_KEYS.claude;
export async function getApiKey(): Promise<string> {
  return getProviderKey('claude');
}
export async function saveApiKey(key: string) {
  await saveProviderKey('claude', key);
}

async function callAI(prompt: string, maxTokens: number = 1000): Promise<string> {
  const provider = getActiveProvider();
  const key = await getProviderKey(provider);

  // If user has a local API key, call the provider directly (no proxy needed)
  // If no local key, try the serverless backend proxy (which uses server-side env vars)
  if (!key) {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          prompt,
          maxTokens
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.text !== undefined) {
          return data.text;
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API key for ${provider.toUpperCase()} is not configured. Please open Settings to configure it.`);
      }
    } catch (err: any) {
      if (err.message?.includes('not configured') || err.message?.includes('API key')) {
        throw err;
      }
      throw new Error(`API key for ${provider.toUpperCase()} is not configured. Please open Settings to configure it.`);
    }
  }

  // Direct client-side call with user's own API key

  if (provider === 'claude') {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'dangerously-allow-browser': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Claude API call failed: ${response.status} - ${errorDetails}`);
    }

    const data = await response.json();
    return data.content && data.content[0] ? data.content[0].text : '';
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
      const errorDetails = await response.text();
      throw new Error(`ChatGPT API call failed: ${response.status} - ${errorDetails}`);
    }

    const data = await response.json();
    return data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : '';
  }

  if (provider === 'gemini') {
    // BUG-008 FIX: Use header instead of URL query parameter to prevent key leakage in logs
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
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
      const errorDetails = await response.text();
      throw new Error(`Gemini API call failed: ${response.status} - ${errorDetails}`);
    }

    const data = await response.json();
    return data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] ? data.candidates[0].content.parts[0].text : '';
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
      const errorDetails = await response.text();
      throw new Error(`Grok API call failed: ${response.status} - ${errorDetails}`);
    }

    const data = await response.json();
    return data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : '';
  }

  throw new Error(`Unknown AI provider: ${provider}`);
}

export const AIService = {
  async generateDailyBrief(day: string, label: string, phaseTitle: string, tasksText: string, note?: string): Promise<string> {
    const prompt = `You are a DevOps mentor helping an engineer study the 90 Days of DevOps curriculum.

Today's focus: ${day} — "${label}" (Phase: ${phaseTitle})
Tasks for today:
${tasksText}
${note ? 'Student notes: ' + note : ''}

Provide a concise, practical daily brief with exactly these sections (use these exact headings):

## 🎯 What You'll Learn Today
2-3 sentences explaining the core value of today's topics in plain English.

## ⚡ Key Concepts to Nail
3-4 bullet points with the most important concepts, each with a one-line explanation.

## 🛠 Hands-On Focus
The single most important practical exercise for today and why it matters.

## 🔗 How This Connects
One sentence connecting today's topic to the broader DevOps picture.

## ❓ Self-Check Question
One challenging question the student should be able to answer after completing today's tasks.

Keep it concise, actionable, and avoid generic advice. Be specific to the exact tools and concepts listed.`;

    return callAI(prompt, 1000);
  },

  async generateQuiz(dayLabel: string, tasksText: string): Promise<{ question: string; options: string[]; answer: number; explanation: string }> {
    const prompt = `You are a DevOps interview coach. Generate a single challenging, scenario-based quiz question for someone who just studied: "${dayLabel}" covering: ${tasksText}

Return ONLY valid JSON in this exact format (no markdown, no backticks, no comments):
{"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"answer":0,"explanation":"..."}

Where answer is the 0-based index of the correct option. Make the question realistic and the distractors plausible.`;

    const textResponse = await callAI(prompt, 600);
    const cleanText = textResponse.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText);
  },

  async gradeMockInterviewAnswer(question: string, modelAnswer: string, userAnswer: string): Promise<{
    score: number;
    correct: string[];
    missing: string[];
    wrong: string[];
    improvement: string;
  }> {
    const prompt = `You are a senior DevOps interviewer grading a candidate's answer.

Question: ${question}
Model answer: ${modelAnswer}
Candidate's answer: ${userAnswer || "(no answer given)"}

Grade this answer out of 100. Return ONLY valid JSON (no markdown, no backticks, no comments):
{"score":75,"correct":["point 1","point 2"],"missing":["concept A","concept B"],"wrong":["incorrect claim"],"improvement":"one sentence on how to improve"}

Score guide: 90+=excellent, 70-89=good, 50-69=partial, <50=needs work. Be strict — this is a real interview.`;

    const textResponse = await callAI(prompt, 600);
    const cleanText = textResponse.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText);
  },

  async generateLinkedInPost(context: string, tone: 'technical' | 'story' | 'insight'): Promise<string> {
    const toneInstructions = {
      technical: 'Write as a technical practitioner sharing real engineering insights. Include specific commands, configs, or architecture decisions. Avoid "excited to share" type fluff. Sound like a senior engineer, not a student.',
      story: 'Write as a short story: what you tried to do, what broke, what you figured out. First-person narrative. Vulnerable and honest. Engineers love this.',
      insight: 'Write one sharp, counterintuitive insight from today\'s work. Lead with the insight, then back it up with context. Short — under 300 words.'
    };

    const prompt = `Write a LinkedIn post for a DevOps engineer building in public.

Context: ${context}

Tone: ${toneInstructions[tone] || toneInstructions.technical}

CRITICAL RULES:
- NEVER start with "Excited to share" or "Today I learned" or "Thrilled to announce"
- DO start with something that makes someone stop scrolling — a counterintuitive claim, a specific number, or a question
- Write "what I built" not "what I learned" — engineers ship things
- Include 3-5 relevant hashtags at the end
- Optimal length: 800-1200 characters
- No bullet lists — LinkedIn favours short paragraphs with line breaks
- End with a question to drive comments`;

    return callAI(prompt, 600);
  }
};
