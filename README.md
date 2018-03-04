# deltaflate
Delta compression over HTTP with extended support for GraphQL (WIP)

## Apollo client

```javascript
import { createFetch } from 'deltaflate-decode-graphql';
import jsondiffpatchImDecoder from 'deltaflate-decode/jsondiffpatchImDecoder';
import hash from 'object-hash';

import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

const cache = new InMemoryCache();

const detlaflateFetch = createFetch(cache, [jsondiffpatchImDecoder], hash, window.fetch);

const link = new HttpLink({ uri: 'http://api.githunt.com/graphql', fetch: detlaflateFetch });

const client = new ApolloClient({
  link,
  cache
});
```

## Express GraphQL server
```javascript
const { deltaflateExpress } = require('deltaflate-express');
const { GraphQLEncoderDictionaryStore } = require('deltaflate-decode-graphql');

const express = require('express');
const { graphqlExpress } = require('apollo-server-express');
const express = require('express');
const { InMemoryCache } = require('apollo-cache-inmemory');

const app = express();

const dictionaryStore = new GraphQLEncoderDictionaryStore(() => new InMemoryCache());

app.use('/graphql', deltaflateExpress(dictionaryStore), graphqlExpress({ schema }));
```
