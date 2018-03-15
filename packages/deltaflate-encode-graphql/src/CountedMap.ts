interface Entry<V> {
  count: number;
  value: V;
}

// like a Map, but counts the number of .set() calls
export class CountedMap<K, V> {
  private map: Map<K, Entry<V>>;

  constructor() {
    this.map = new Map<K, Entry<V>>();
  }

  get(key: K): V {
    return this.map.has(key) ? this.map.get(key).value : null;
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  set(key: K, value: V): void {
    if (this.map.has(key)) {
      const entry = this.map.get(key);
      this.map.set(key, {
        count: entry.count + 1,
        value
      });
    } else {
      this.map.set(key, {
        count: 1,
        value
      });
    }
  }

  // only actually removes entry if it has been called for every .set() call
  delete(key: K): boolean {
    if (this.map.has(key)) {
      const entry = this.map.get(key);
      entry.count--;
      if (entry.count === 0) {
        this.map.delete(key);
      }
      return true;
    } else {
      return false;
    }
  }
}
export default CountedMap;
