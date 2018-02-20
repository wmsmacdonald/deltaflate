import { DecoderDictionaryStore } from '../../deltaflate-decode/src'
import { ApolloCache } from 'apollo-cache';
import { decode } from 'punycode';

export class GraphQLDecoderDictionaryStore<TSerialized> implements DecoderDictionaryStore<TSerialized> {
  cache: ApolloCache<TSerialized>;

  constructor(cache: ApolloCache<TSerialized>) {
    this.cache = cache;
  }

  read(request: Request): Promise<Array<TSerialized>> {
    return Promise.resolve([this.cache.extract()]);
  }

  // add GET query support
  async write(decodedResponse: Response): Promise<void> {
    const decodedBody = await decodedResponse.json();
    this.cache.restore(decodedBody);
  }
}