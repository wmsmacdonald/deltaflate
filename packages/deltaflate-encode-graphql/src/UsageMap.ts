
interface Entry<V> {
  count: number,
  value: V
}

export class UsageMap<K, V> {
  private map: Map<K, Entry<V>>
  get(key: K): V {
    return this.map.get(key).value;
  }
  has(key: K): boolean {
    return this.map.has(key);
  }
  add(key: K, value: V): void {
    if (this.map.has(key)) {
      const entry = this.map.get(key);
      entry.count++;
    }
    else {
      const entry = {
        count: 0,
        value
      }
      this.map.set(key, entry);
    }
  }
  remove(key: K): boolean {
    if (this.map.has(key)) {
      const entry = this.map.get(key);
      entry.count--;
      if (entry.count === 0) {
        this.map.delete(key);
      }
      return true;
    }
    else {
      return false;
    }
  }
}