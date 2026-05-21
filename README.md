# http-resources-slice

Zero-dependency, framework-agnostic HTTP resource management with CRUD operations, loading states, error handling, and optimistic updates. Works with any state manager following the Zustand `(set, get)` pattern.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-green.svg)](https://www.npmjs.com/package/http-resources-slice)

## Quick Start

```ts
import { create } from 'zustand';
import { createHttpResources } from 'http-resources-slice';

type User = { id: number; name: string; email: string };

const useStore = create((set, get) => ({
  ...createHttpResources('user')(set, get),
}));

const { user, fetchUser, postUser, putUser, delUser, userLoading } = useStore();

await fetchUser();
await postUser({ name: 'John', email: 'john@example.com' });
await putUser(1, { name: 'John Doe', email: 'john.doe@example.com' });
await delUser(1);
```

## With Optimistic Updates

```ts
...createHttpResources('user', { isOptimistic: true })(set, get)

// State updates immediately, rolls back on failure
await postUser({ name: 'John', email: 'john@example.com' });
```

## Generated API

For a resource named `'user'`, you get:

| Property | Type |
|---|---|
| `user` | `T \| null` |
| `setUser` | `(data: T) => void` |
| `fetchUser` | `(params?) => Promise<T[]>` |
| `postUser` | `(body, options?) => Promise<T>` |
| `putUser` | `(id, body, options?) => Promise<T>` |
| `patchUser` | `(id, body, options?) => Promise<T>` |
| `delUser` | `(id) => Promise<void>` |
| `cancelFetchUser` | `() => void` |
| `postUserLoading` | `boolean` |
| `postUserError` | `Error \| null` |

(Loading/error states generated per method. Cancel functions per method.)

## Options

```ts
type CreateResourcesOptions = {
  include?: "all" | Array<"fetch" | "post" | "put" | "patch" | "del">;
  baseUrl?: string;
  isOptimistic?: boolean;
  fetchOptions?: { headers?: Record<string, string> };
};
```

## Development

```bash
npm install
npm test         # vitest
npm run typecheck
npm run build    # tsc
```

## License

MIT © [Vidy Alfredo](https://github.com/vyredo)
