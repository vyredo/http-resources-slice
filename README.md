# http-resources-slice

[![npm version](https://img.shields.io/npm/v/http-resources-slice.svg)](https://www.npmjs.com/package/http-resources-slice)
[![npm downloads](https://img.shields.io/npm/dm/http-resources-slice.svg)](https://www.npmjs.com/package/http-resources-slice)
[![bundle size](https://img.shields.io/bundlephobia/min/http-resources-slice)](https://bundlephobia.com/package/http-resources-slice)
[![license](https://img.shields.io/github/license/vyredo/http-resources-slice)](https://github.com/vyredo/http-resources-slice/blob/main/LICENSE)

> **Zero-dependency, framework-agnostic HTTP resource management with optimistic updates**

A lightweight TypeScript library that generates type-safe CRUD operations with built-in loading states, error handling, and optimistic UI updates. Works with any state management solution that follows the Zustand pattern.

## ✨ Features

- 🚀 **Zero Dependencies** - No runtime dependencies, just pure TypeScript
- 🔌 **Framework Agnostic** - Works with Zustand, Valtio, or any state manager using `(set, get)` pattern
- 🤖 **AI Agent Ready** - Simple, predictable API perfect for AI code generation and autonomous agents
- ⚡ **Optimistic Updates** - Built-in support for optimistic UI with automatic rollback on failure
- 🎯 **Type Safe** - Full TypeScript support with inferred types
- 🔄 **CRUD Operations** - Auto-generated fetch, create, update, patch, and delete functions
- 📡 **Request Cancellation** - Cancel in-flight requests to prevent memory leaks
- 🔍 **Query Parameters** - Easy query parameter support for filtering and pagination
- 🛡️ **Error Handling** - Comprehensive error states per operation
- 📊 **Loading States** - Individual loading states for each operation

## 📦 Installation

```bash
npm install http-resources-slice
# or
yarn add http-resources-slice
# or
pnpm add http-resources-slice
```

## 🚀 Quick Start

### Basic Usage with Zustand

```typescript
import { create } from 'zustand';
import { createHttpResources } from 'http-resources-slice';

type User = {
  id: number;
  name: string;
  email: string;
};

const useStore = create((set, get) => ({
  ...createHttpResources('user')(set, get),
}));

// Usage in components
function UserProfile() {
  const { user, fetchUser, postUser, putUser, delUser, userLoading, userError } = useStore();
  
  // Fetch all users
  await fetchUser();
  
  // Create a new user
  await postUser({ name: 'John', email: 'john@example.com' });
  
  // Update a user
  await putUser(1, { name: 'John Doe', email: 'john.doe@example.com' });
  
  // Delete a user
  await delUser(1);
}
```

### With Optimistic Updates

```typescript
const useStore = create((set, get) => ({
  ...createHttpResources('user', { isOptimistic: true })(set, get),
}));

// Optimistic updates automatically update state before API confirms
// and rollback on error
await postUser({ name: 'John', email: 'john@example.com' });
```

### With Base URL and Options

```typescript
const useStore = create((set, get) => ({
  ...createHttpResources('user', {
    baseUrl: '/api/v1',
    include: ['fetch', 'post', 'del'], // Only include specific methods
    fetchOptions: {
      headers: {
        'Authorization': 'Bearer token',
      },
    },
  })(set, get),
}));
```

## 📖 API Reference

### `createHttpResources(name, options?)`

Creates a resource slice with CRUD operations.

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| `name` | `string` | Resource name (e.g., 'user', 'product') |
| `options` | `CreateResourcesOptions` | Optional configuration |

#### Options

```typescript
type CreateResourcesOptions = {
  /**
   * HTTP methods to include
   * - "all": includes all CRUD methods (default)
   * - Array: specific methods to include
   */
  include?: "all" | Array<"fetch" | "post" | "put" | "patch" | "del">;
  
  /**
   * Base URL prefix for all requests (e.g., "/api")
   * @default ""
   */
  baseUrl?: string;
  
  /**
   * Enable optimistic updates for POST, PUT, PATCH
   * @default false
   */
  isOptimistic?: boolean;
  
  /**
   * Default fetch options applied to all requests
   */
  fetchOptions?: Omit<RequestInit, "method" | "body" | "headers"> & {
    headers?: Record<string, string>;
  };
};
```

#### Returns

An object with the following properties (using 'user' as example name):

| Property | Type | Description |
|----------|------|-------------|
| `user` | `TData \| null` | Current data |
| `setUser` | `(data) => void` | Manual data setter |
| `fetchUser` | `(params?) => Promise<TData[]>` | Fetch all items |
| `postUser` | `(body, options?) => Promise<TData>` | Create new item |
| `putUser` | `(id, body, options?) => Promise<TData>` | Replace item |
| `patchUser` | `(id, body, options?) => Promise<TData>` | Partial update |
| `delUser` | `(id) => Promise<void>` | Delete item |
| `cancelFetchUser` | `() => void` | Cancel fetch request |
| `cancelPostUser` | `() => void` | Cancel post request |
| `cancelPutUser` | `() => void` | Cancel put request |
| `cancelPatchUser` | `() => void` | Cancel patch request |
| `cancelDelUser` | `() => void` | Cancel delete request |
| `fetchUserLoading` | `boolean` | Fetch loading state |
| `fetchUserError` | `Error \| null` | Fetch error state |
| `postUserLoading` | `boolean` | Post loading state |
| `postUserError` | `Error \| null` | Post error state |
| ... | ... | Similar for put, patch, del |

## 🤖 AI Agent Integration

This library is designed with AI agents in mind:

### Why It's AI-Friendly

1. **Predictable Naming** - Consistent pattern: `{method}{ResourceName}`
2. **Self-Documenting** - Function names describe their purpose
3. **Type Inference** - AI can infer types from minimal context
4. **No Hidden State** - All state is explicit and accessible
5. **Standard HTTP** - Uses familiar REST conventions

### Example: AI-Generated Code

```typescript
// AI can easily generate this pattern:
const { 
  products, 
  fetchProducts, 
  postProducts, 
  productsLoading, 
  productsError 
} = useStore();

// Clear, predictable, no surprises
```

## 🔧 Advanced Usage

### Query Parameters

```typescript
// Fetch with filters
await fetchProducts({ category: 'electronics', minPrice: 100 });

// POST with query params
await postProduct(data, { query: { source: 'import' } });

// PUT with query params
await putProduct(id, data, { query: { version: 2 } });
```

### Multiple Resources

```typescript
const useStore = create((set, get) => ({
  ...createHttpResources('user')(set, get),
  ...createHttpResources('product')(set, get),
  ...createHttpResources('order')(set, get),
}));
```

### Custom State Management

Works with any state manager following the `(set, get)` pattern:

```typescript
// Custom store implementation
function createCustomStore() {
  let state = {};
  const listeners = new Set();
  
  const set = (updater) => {
    state = typeof updater === 'function' ? updater(state) : { ...state, ...updater };
    listeners.forEach(fn => fn(state));
  };
  
  const get = () => state;
  
  return { set, get, subscribe: (fn) => listeners.add(fn) };
}

const { set, get } = createCustomStore();
const userResource = createHttpResources('user')(set, get);
```

### Error Handling

```typescript
try {
  await postUser({ name: 'John' });
} catch (error) {
  console.error('Failed to create user:', error);
}

// Or use error state
const { userError } = useStore();
if (userError) {
  console.error(userError.message);
}
```

### Request Cancellation

```typescript
// Start a request
fetchUsers();

// Cancel it if needed (e.g., component unmount)
cancelFetchUsers();
```

## 📊 Comparison

| Feature | create-http-resources-slice | React Query | SWR | RTK Query |
|---------|----------------------------|-------------|-----|-----------|
| **Dependencies** | 0 | ~13kb | ~6kb | ~20kb |
| **Framework** | Any | React | React | Redux |
| **Bundle Size** | ~2kb | Large | Medium | Large |
| **Learning Curve** | Minutes | Hours | Hours | Days |
| **AI-Friendly** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |

## 🎯 Use Cases

### ✅ Perfect For

- Micro-frontends needing lightweight HTTP management
- AI-generated code and autonomous agents
- Projects prioritizing minimal dependencies
- Custom state management solutions
- Server-side rendering (SSR) applications
- Non-React frameworks (Vue, Svelte, Solid, etc.)

### ❌ Not For

- Applications needing advanced caching strategies
- Projects requiring offline-first architecture
- Complex data synchronization scenarios
- GraphQL APIs (use GraphQL-specific solutions)

## 📝 Examples

### E-commerce Product Management

```typescript
type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
};

const useProductStore = create((set, get) => ({
  ...createHttpResources<Product>('product', {
    baseUrl: '/api/shop',
    isOptimistic: true,
  })(set, get),
}));

// Usage
const { 
  products, 
  fetchProducts, 
  postProducts, 
  patchProducts,
  productsLoading 
} = useProductStore();

await fetchProducts({ category: 'electronics' });
await postProducts({ name: 'New Product', price: 99.99, stock: 100 });
await patchProducts(1, { stock: 95 }); // Optimistic update
```

### User Authentication

```typescript
type Session = {
  user: { id: number; name: string };
  token: string;
};

const useAuthStore = create((set, get) => ({
  ...createHttpResources<Session>('session', {
    baseUrl: '/api/auth',
    fetchOptions: {
      credentials: 'include',
    },
  })(set, get),
}));

// Login
const { postSession } = useAuthStore();
await postSession({ email, password });

// Logout
const { delSession } = useAuthStore();
await delSession(currentSession.id);
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build
npm run build

# Lint
npm run lint

# Format
npm run format
```

## 📄 License

MIT License - feel free to use in personal and commercial projects.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📦 Package Size

- **Minified**: ~2kb
- **Gzipped**: ~1kb
- **Dependencies**: 0

## 🔗 Related Resources

- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Fetch API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

---

**Built with ❤️ for the JavaScript community**
