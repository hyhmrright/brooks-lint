import {service} from './domain.mjs';
import {repo} from './storage.mjs';
export const run = service(repo);
