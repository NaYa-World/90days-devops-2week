import { showToast } from './Toast';

export interface FirewallViolation {
  reason: string;
  payload: string;
  severity: 'high' | 'critical';
}

export class SecurityFirewall {
  // Common signature matches for malicious payloads
  private static readonly SQL_INJECTION_PATTERN = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|OR)\b.*\b(FROM|INTO|TABLE|DATABASE)\b)|(--\s)|\b(OR|AND)\b\s+['"]?1['"]?\s*=\s*['"]?1['"]?/i;
  private static readonly XSS_PATTERN = /<(script|iframe|object|embed|svg|math|img|audio|video|a|form|input).*?(src|href|on\w+)\s*=/i;
  private static readonly PATH_TRAVERSAL_PATTERN = /(\.\.\/|\.\.\\|%2e%2e%2f)/i;

  // Rate Limiter
  private static requestCounts = new Map<string, { count: number; windowStart: number }>();
  private static readonly RATE_LIMIT_MAX = 50; // max 50 requests
  private static readonly RATE_LIMIT_WINDOW = 60 * 1000; // per minute

  public static scanPayload(payload: string): FirewallViolation | null {
    if (!payload) return null;

    if (this.SQL_INJECTION_PATTERN.test(payload)) {
      return { reason: 'SQL Injection Detected', payload, severity: 'critical' };
    }
    
    if (this.XSS_PATTERN.test(payload)) {
      return { reason: 'Cross-Site Scripting (XSS) Detected', payload, severity: 'critical' };
    }

    if (this.PATH_TRAVERSAL_PATTERN.test(payload)) {
      return { reason: 'Path Traversal Detected', payload, severity: 'high' };
    }

    return null;
  }

  public static enforceRateLimit(action: string): boolean {
    const now = Date.now();
    let record = this.requestCounts.get(action);

    if (!record || now - record.windowStart > this.RATE_LIMIT_WINDOW) {
      record = { count: 1, windowStart: now };
      this.requestCounts.set(action, record);
      return true;
    }

    if (record.count >= this.RATE_LIMIT_MAX) {
      this.triggerAlarm({ reason: 'Rate Limit Exceeded (DDoS Protection)', payload: action, severity: 'high' });
      return false; // Block request
    }

    record.count++;
    return true;
  }

  public static triggerAlarm(violation: FirewallViolation) {
    console.error(
      `\n%c🚨 RED HAT FIREWALL INTERVENTION 🚨\n` +
      `%cThreat: ${violation.reason}\n` +
      `Severity: ${violation.severity.toUpperCase()}\n` +
      `Payload Snippet: ${violation.payload.substring(0, 50)}...\n` +
      `Action: Request blocked to protect infrastructure.`,
      "color: red; font-size: 16px; font-weight: bold;",
      "color: white; background: black; padding: 4px;"
    );

    showToast(`🚨 FIREWALL: Malicious payload intercepted and dropped.`, 'var(--red)');
  }

  /**
   * Main entrypoint for sanitizing strings before they are sent to sensitive APIs.
   * Throws an error if malicious.
   */
  public static assertSafeString(input: string, context: string = 'General') {
    const violation = this.scanPayload(input);
    if (violation) {
      this.triggerAlarm(violation);
      throw new Error(`Firewall block triggered on context: ${context}`);
    }
  }
}
