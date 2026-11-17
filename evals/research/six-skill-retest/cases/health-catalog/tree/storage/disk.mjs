import {canonicalKey} from '../apps/catalog.mjs';
export const readRows=ids=>ids.map(id=>({id:canonicalKey(id),hidden:id.startsWith('!')}));
