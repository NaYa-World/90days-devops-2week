export const SyncMeta = {
  getMetaKey(user: string): string {
    return `devops90_meta_timestamps_${user.toLowerCase()}`;
  },

  getMeta(user: string): Record<string, number> {
    try {
      return JSON.parse(localStorage.getItem(this.getMetaKey(user)) || '{}');
    } catch {
      return {};
    }
  },

  saveMeta(user: string, meta: Record<string, number>) {
    localStorage.setItem(this.getMetaKey(user), JSON.stringify(meta));
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
