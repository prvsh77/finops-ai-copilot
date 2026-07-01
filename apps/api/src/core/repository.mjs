import { store } from "../store.mjs";

export class BaseRepository {
  constructor(collection) {
    this.collection = collection;
  }

  async find(predicate) {
    await store.load();
    return store.find(this.collection, predicate);
  }

  async list(predicate = () => true) {
    await store.load();
    return store.list(this.collection).filter(predicate);
  }

  async insert(record) {
    await store.load();
    const inserted = store.insert(this.collection, record);
    await store.save();
    return inserted;
  }

  async update(predicate, updater) {
    await store.load();
    const updated = store.update(this.collection, predicate, updater);
    await store.save();
    return updated;
  }

  async delete(predicate) {
    await store.load();
    // Support soft-delete if record supports it, otherwise fallback
    const item = store.find(this.collection, predicate);
    if (!item) return false;

    if ("deleted_at" in item || "status" in item) {
      store.update(this.collection, predicate, (x) => {
        if ("deleted_at" in x) x.deleted_at = new Date().toISOString();
        if ("status" in x) x.status = "deleted";
      });
    } else {
      // Hard delete from list
      const list = store.list(this.collection);
      const index = list.findIndex(predicate);
      if (index !== -1) {
        list.splice(index, 1);
      }
    }
    await store.save();
    return true;
  }
}
