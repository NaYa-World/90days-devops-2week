import { callAI, getProviderKey, getActiveProvider } from './AIService';

export interface VerificationResult {
  isValid: boolean;
  message: string;
}

export class ArtifactVerificationService {
  /**
   * Fetches raw code/patch from a GitHub URL
   */
  private static async fetchGithubData(url: string): Promise<{ code: string; isTooSmall: boolean }> {
    try {
      const parsed = new URL(url);
      const pathParts = parsed.pathname.split('/').filter(Boolean);
      
      if (pathParts.length < 2) throw new Error('Invalid GitHub URL');
      const [owner, repo, type, ...rest] = pathParts;

      // 1. Commit URL
      if (type === 'commit' && rest.length > 0) {
        const sha = rest[0];
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/${sha}`);
        if (!res.ok) throw new Error('Failed to fetch commit');
        const data = await res.json();
        
        let totalAdditions = 0;
        let combinedPatch = '';
        if (data.files && Array.isArray(data.files)) {
          data.files.forEach((f: any) => {
            totalAdditions += (f.additions || 0);
            if (f.patch) combinedPatch += `\n--- ${f.filename} ---\n${f.patch}\n`;
          });
        }
        
        return { code: combinedPatch, isTooSmall: totalAdditions === 0 };
      }

      // 2. Pull Request URL
      if (type === 'pull' && rest.length > 0) {
        const prId = rest[0];
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prId}/files`);
        if (!res.ok) throw new Error('Failed to fetch PR');
        const data = await res.json();
        
        let totalAdditions = 0;
        let combinedPatch = '';
        if (Array.isArray(data)) {
          data.forEach((f: any) => {
            totalAdditions += (f.additions || 0);
            if (f.patch) combinedPatch += `\n--- ${f.filename} ---\n${f.patch}\n`;
          });
        }
        return { code: combinedPatch, isTooSmall: totalAdditions === 0 };
      }

      // 3. Blob / File URL
      if (type === 'blob' && rest.length >= 2) {
        const branch = rest[0];
        const filePath = rest.slice(1).join('/');
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`);
        if (!res.ok) throw new Error('Failed to fetch file');
        const data = await res.json();
        
        if (data.content) {
          const decoded = atob(data.content);
          return { code: decoded, isTooSmall: decoded.trim().length < 15 };
        }
      }

      throw new Error('Unsupported GitHub URL type. Please provide a Commit, PR, or File link.');
    } catch (err: any) {
      throw new Error(`GitHub fetch error: ${err.message}`);
    }
  }

  /**
   * Verifies the artifact URL semantically using AI
   */
  public static async verifyArtifact(url: string, instruction: string, scenario: string): Promise<VerificationResult> {
    try {
      // 1. Fetch code
      const { code, isTooSmall } = await this.fetchGithubData(url);

      if (isTooSmall || !code.trim()) {
        return { isValid: false, message: 'Rejected: No meaningful code changes found (0 additions or empty file).' };
      }

      // Ensure API key exists before attempting AI validation
      const provider = getActiveProvider();
      const key = await getProviderKey(provider);
      if (!key) {
        return { isValid: false, message: 'AI_KEY_REQUIRED' }; // Signal UI to open modal
      }

      // 2. AI Semantic Verification
      const prompt = `You are a strict Senior Staff Cloud Architect grading a Junior DevOps Engineer's artifact submission.
Verify if the submitted code satisfies the given Task Instruction and Scenario.

Scenario: ${scenario}
Instruction: ${instruction}

Submitted Code/Diff:
\`\`\`
${code.substring(0, 3000)} // Truncated to prevent context limit
\`\`\`

Evaluate if the code represents a genuine attempt to fulfill the task requirements. 
Respond ONLY with a JSON object in this format:
{
  "isValid": true/false,
  "reason": "1 sentence explaining why it passed or failed (be harsh if they uploaded irrelevant code like python scripts for a docker task)"
}`;

      const aiResponse = await callAI(prompt, 500);
      
      // Parse JSON
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          isValid: result.isValid === true,
          message: result.reason || 'Verification complete'
        };
      }

      return { isValid: false, message: 'Failed to parse AI verification response.' };

    } catch (err: any) {
      if (err.message === 'AI_KEY_REQUIRED') {
        return { isValid: false, message: 'AI_KEY_REQUIRED' };
      }
      return { isValid: false, message: err.message };
    }
  }
}
