import {authenticate} from './auth.mjs';
import {purchase} from './service.mjs';
import {preview} from './preview.mjs';
export function route(kind,token,id,cache,repo){const principal=authenticate(token);return (kind==='purchase'?purchase:preview)(principal,id,cache,repo);}
