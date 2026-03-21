/**
 * create-http-resources-slice
 * 
 * Zero-dependency, framework-agnostic HTTP resource management
 * with optimistic updates and type-safe CRUD operations.
 * 
 * @packageDocumentation
 */

export { createHttpResources } from './createHttpResources';
export { createHttpFunctions } from './createHttpFunctions';
export { createCRUDSlice } from './createCRUDSlice';
export type { 
  CreateResourcesOptions, 
  HttpMethod 
} from './createHttpResources';
export type { 
  SetFn, 
  GetFn 
} from './createCRUDSlice';
