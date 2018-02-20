# deltaflate
Delta compression over HTTP with extended support for GraphQL (WIP)

## Apollo client

```javascript
import { createFetch } from 'deltaflate-decode-graphql';

import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

const cache = new InMemoryCache();

const fetch = createFetch(cache);

const link = new HttpLink({ uri: 'http://api.githunt.com/graphql', fetch });

const client = new ApolloClient({
  link,
  cache
});
```

## Express GraphQL server
```javascript
const { deltaflateExpress } = require('deltaflate-graphql-express');
const { InMemoryCache } = 'apollo-cache-inmemory';

const express = require('express');
const { graphqlExpress } = require('apollo-server-express');
const express = require('express');

const app = express();

app.use('/graphql', deltaflateExpress(InMemoryCache), graphqlExpress({ schema }));
```
