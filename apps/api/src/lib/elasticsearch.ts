import { Client } from '@elastic/elasticsearch';
import { env } from '../config/env.js';

export const es = new Client({
  node: env.ELASTICSEARCH_URL,
  ...(env.ELASTICSEARCH_API_KEY
    ? { auth: { apiKey: env.ELASTICSEARCH_API_KEY } }
    : {}),
  requestTimeout: 5000,
});
