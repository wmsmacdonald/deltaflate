import { ApolloCache } from "apollo-cache";
import { Response, Request } from "node-fetch";
import * as hash from "object-hash";

import { CountedMap } from "./CountedMap";

export type ETag = string;

export class GraphQlEncoderDictionaryStore<
  TSerialized
> {
  private createCache: () => ApolloCache<TSerialized>;
  private eTagsToCaches: CountedMap<ETag, ApolloCache<TSerialized>>;
  createETag: (TSerialized) => string;

  constructor(
    createCache: () => ApolloCache<TSerialized>,
    createETag: (TSerialized) => string = hash
  ) {
    this.createCache = createCache;
    this.createETag = createETag;
    this.eTagsToCaches = new CountedMap<ETag, ApolloCache<TSerialized>>();
  }

  has(eTag: ETag): Boolean {
    return this.eTagsToCaches.has(eTag);
  }

  get(eTag: ETag): TSerialized | void {
    return this.eTagsToCaches.get(eTag).extract();
  }

  delete(eTag) {
    this.eTagsToCaches.delete(eTag);
  }

  // add support for graphql in GET
  async write(
    request: Request,
    response: Response,
    dictionary?: TSerialized
  ): Promise<void> {
    if (dictionary) {
      const eTag = this.createETag(dictionary);
      const cache = this.eTagsToCaches.has(eTag)
        ? this.eTagsToCaches.get(eTag)
        : this.createCache();
      const [query, result] = await Promise.all([
        await request.json(),
        await response.json()
      ]);
      cache.writeQuery({
        query,
        data: result.data
      });
      this.eTagsToCaches.set(eTag, cache);
    }
  }
}
export default GraphQlEncoderDictionaryStore;