// BUG-010 FIX: Track which user the cache belongs to, invalidate on user switch
let metaCache: Record<string, number> | null = null;
let metaCacheUser: string | null = null;
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

export const SyncMeta = {
  getMetaKey(user: string): string {
    return `devops90_meta_timestamps_${user.toLowerCase()}`;
  },

  getMeta(user: string): Record<string, number> {
    // BUG-010 FIX: Invalidate cache if the user has changed
    const userLower = user.toLowerCase();
    if (metaCache && metaCacheUser === userLower) return metaCache;

    // User changed or cache is empty — reload from localStorage
    metaCacheUser = userLower;
    try {
      metaCache = JSON.parse(localStorage.getItem(this.getMetaKey(user)) || '{}');
      return metaCache!;
    } catch {
      metaCache = {};
      return metaCache;
    }
  },

  saveMeta(user: string, meta: Record<string, number>) {
    metaCache = meta;
    metaCacheUser = user.toLowerCase();
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      localStorage.setItem(this.getMetaKey(user), JSON.stringify(metaCache));
    }, 500);
  },

  // BUG-010 FIX: Explicit cache invalidation for logout/user-switch scenarios
  invalidateCache() {
    metaCache = null;
    metaCacheUser = null;
  },

  recordChange(user: string, storageKey: string, propertyKey: string) {
    if (!user) return;
    const meta = this.getMeta(user);
    const key = `${storageKey}::${propertyKey}`;
    meta[key] = Date.now();
    this.saveMeta(user, meta);
  },

  recordChanges(user: string, storageKey: string, propertyKeys: string[]) {
    if (!user) return;
    const meta = this.getMeta(user);
    const now = Date.now();
    propertyKeys.forEach(prop => {
      meta[`${storageKey}::${prop}`] = now;
    });
    this.saveMeta(user, meta);
  },

  recordAll(user: string, storageKey: string, obj: Record<string, any>) {
    if (!user) return;
    const meta = this.getMeta(user);
    const now = Date.now();
    Object.keys(obj).forEach(prop => {
      meta[`${storageKey}::${prop}`] = now;
    });
    this.saveMeta(user, meta);
  }
};
