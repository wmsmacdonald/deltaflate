import { ApolloCache } from 'apollo-cache';
import { Response, Request } from 'node-fetch';

import { UsageMap } from './UsageMap';

type ETag = string;

interface CacheEntry<TSerialized> {
  clientCount: number,
  cache: ApolloCache<TSerialized>
};

class GraphQLEncoderDictionaryStore<TSerialized> {
  private createCache: () => ApolloCache<TSerialized>; 
  private eTagsToCaches: UsageMap<ETag, ApolloCache<TSerialized>>;
  createETag: (TSerialized) => string;

  constructor(createCache: () => ApolloCache<TSerialized>, createETag: (TSerialized) => string) {
    this.createCache = createCache;
    this.createETag = createETag;
    this.eTagsToCaches = new UsageMap<ETag, ApolloCache<TSerialized>>();
  }

  has(eTag: ETag): Boolean {
    return this.eTagsToCaches.has(eTag);
  }

  get(eTag: ETag): TSerialized | void {
    return this.eTagsToCaches.get(eTag).extract();
  }

  remove(eTag) {
    this.eTagsToCaches.remove(eTag);
  }

  // add support for graphql in GET
  async write(request: Request, response: Response, dictionary?: TSerialized): Promise<void> {
    if (dictionary) {
      const eTag = this.createETag(dictionary);
      const cache = this.eTagsToCaches.has(eTag) ? this.createCache() : this.eTagsToCaches.get(eTag);
      const [query, data] = await Promise.all([await request.json(), await response.json()]);
      cache.writeQuery({
        query,
        data
      });
      this.eTagsToCaches.add(eTag, cache);
    }
  }
}