let metaCache: Record<string, number> | null = null;
let saveTimeout: any = null;

export const SyncMeta = {
  getMetaKey(user: string): string {
    return `devops90_meta_timestamps_${user.toLowerCase()}`;
  },

  getMeta(user: string): Record<string, number> {
    if (metaCache) return metaCache;
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
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      localStorage.setItem(this.getMetaKey(user), JSON.stringify(metaCache));
    }, 500);
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
