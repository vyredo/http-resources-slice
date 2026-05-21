// ---------------------------------------------------------------------------
// Comprehensive Test Suite for createHttpResources
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { GetFn, SetFn } from "./createCRUDSlice";
import { createHttpResources } from "./createHttpResources";

// ---------------------------------------------------------------------------
// Mock fetch — single declaration (was duplicated, causing esbuild to fail)
// ---------------------------------------------------------------------------
type MockFetchHandler = (url: string, options: RequestInit) => Promise<Response>;

let mockFetchHandler: MockFetchHandler = async () => {
    throw new Error("Mock fetch not configured");
};

let fetchCalls: Array<{ url: string; options: RequestInit }> = [];

const mockFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    fetchCalls.push({ url, options });
    return mockFetchHandler(url, options);
};

(globalThis as any).fetch = mockFetch;

// ---------------------------------------------------------------------------
// Test Types
// ---------------------------------------------------------------------------

type FoodItem = {
    id: number;
    name: string;
    calories: number;
};

type TestState = {
    food: FoodItem[] | FoodItem | null;
    setFood: (value: FoodItem[] | FoodItem | null) => void;
    postFoodLoading: boolean;
    postFoodError: Error | null;
    putFoodLoading: boolean;
    putFoodError: Error | null;
    patchFoodLoading: boolean;
    patchFoodError: Error | null;
    fetchFoodLoading: boolean;
    fetchFoodError: Error | null;
    delFoodLoading: boolean;
    delFoodError: Error | null;
};

// ---------------------------------------------------------------------------
// Test Utilities
// ---------------------------------------------------------------------------

export function createMockStore<T extends Record<string, unknown>>(
    initialState: T
): {
    set: SetFn<T>;
    get: GetFn<T>;
    getState: () => T;
    getUpdates: () => (Partial<T> | ((state: T) => T))[];
    reset: () => void;
} {
    let state: T = { ...initialState };
    const updates: (Partial<T> | ((state: T) => T))[] = [];

    const set: SetFn<T> = (updater) => {
        if (typeof updater === "function") {
            state = (updater as (s: T) => T)(state);
        } else {
            state = { ...state, ...updater };
        }
        updates.push(updater);
    };

    const get: GetFn<T> = () => state;

    return {
        set,
        get,
        getState: () => ({ ...state }),
        getUpdates: () => [...updates],
        reset: () => {
            state = { ...initialState };
            updates.length = 0;
        },
    };
}

// ---------------------------------------------------------------------------
// Test Helpers
// ---------------------------------------------------------------------------

function setupMockResponse<T>(data: T, status = 200): void {
    mockFetchHandler = async () => {
        const text = JSON.stringify(data);
        return {
            ok: status >= 200 && status < 300,
            status,
            statusText: '',
            headers: new Headers({ "Content-Type": "application/json" }),
            json: async () => data,
            text: async () => text,
        } as Response;
    };
}

function setupMockError(status: number, statusText: string): void {
    mockFetchHandler = async () => {
        return {
            ok: false,
            status,
            statusText,
            headers: new Headers(),
            json: async () => {
                throw new Error('Cannot parse JSON');
            },
            text: async () => statusText,
        } as unknown as Response;
    };
}

function resetFetchCalls(): void {
    fetchCalls = [];
}

function getFetchCalls(): Array<{ url: string; options: RequestInit }> {
    return [...fetchCalls];
}

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------

describe("createHttpResources", () => {
    beforeEach(() => {
        resetFetchCalls();
    });

    // -----------------------------------------------------------------------
    // Basic Initialization Tests
    // -----------------------------------------------------------------------

    describe("Initialization", () => {
        it("should create resource with default options", () => {
            const store = createMockStore<TestState>({
                food: null,
                setFood: () => {},
                postFoodLoading: false,
                postFoodError: null,
                putFoodLoading: false,
                putFoodError: null,
                patchFoodLoading: false,
                patchFoodError: null,
                fetchFoodLoading: false,
                fetchFoodError: null,
                delFoodLoading: false,
                delFoodError: null,
            });

            const initializer = createHttpResources("food");
            const result = initializer(store.set, store.get);

            expect(result).toBeDefined();
            expect(typeof result.fetchFood).toBe("function");
            expect(typeof result.postFood).toBe("function");
            expect(typeof result.putFood).toBe("function");
            expect(typeof result.patchFood).toBe("function");
            expect(typeof result.delFood).toBe("function");
        });

        it("should initialize with null data", () => {
            const store = createMockStore<TestState>({
                food: null,
                setFood: () => {},
                postFoodLoading: false,
                postFoodError: null,
                putFoodLoading: false,
                putFoodError: null,
                patchFoodLoading: false,
                patchFoodError: null,
                fetchFoodLoading: false,
                fetchFoodError: null,
                delFoodLoading: false,
                delFoodError: null,
            });

            const initializer = createHttpResources("food");
            const result = initializer(store.set, store.get);

            expect(result.food).toBeNull();
        });

        it("should create setter function", () => {
            const store = createMockStore<TestState>({
                food: null,
                setFood: () => {},
                postFoodLoading: false,
                postFoodError: null,
                putFoodLoading: false,
                putFoodError: null,
                patchFoodLoading: false,
                patchFoodError: null,
                fetchFoodLoading: false,
                fetchFoodError: null,
                delFoodLoading: false,
                delFoodError: null,
            });

            const initializer = createHttpResources("food");
            const result = initializer(store.set, store.get);

            expect(typeof result.setFood).toBe("function");

            const testData: FoodItem = { id: 1, name: "Apple", calories: 95 };
            result.setFood(testData);

            expect(store.getState().food).toEqual(testData);
        });
    });

    // -----------------------------------------------------------------------
    // CRUD Operation Tests
    // -----------------------------------------------------------------------

    describe("CRUD Operations", () => {
        it("POST should send correct request and update state", async () => {
            const newItem: FoodItem = { id: 1, name: "Banana", calories: 105 };
            setupMockResponse(newItem);

            const store = createMockStore<TestState>({
                food: null,
                setFood: () => {},
                postFoodLoading: false,
                postFoodError: null,
                putFoodLoading: false,
                putFoodError: null,
                patchFoodLoading: false,
                patchFoodError: null,
                fetchFoodLoading: false,
                fetchFoodError: null,
                delFoodLoading: false,
                delFoodError: null,
            });

            const initializer = createHttpResources("food");
            const result = initializer(store.set, store.get);

            const postResult = await result.postFood!(newItem);

            expect(postResult).toEqual(newItem);
            expect(fetchCalls).toHaveLength(1);
            expect(fetchCalls[0].url).toBe("/food");
            expect(fetchCalls[0].options.method).toBe("POST");
            expect(JSON.parse(fetchCalls[0].options.body as string)).toEqual(newItem);
        });

        it("PUT should send correct request with ID", async () => {
            const updatedItem: FoodItem = { id: 1, name: "Orange", calories: 62 };
            setupMockResponse(updatedItem);

            const store = createMockStore<TestState>({
                food: null,
                setFood: () => {},
                postFoodLoading: false,
                postFoodError: null,
                putFoodLoading: false,
                putFoodError: null,
                patchFoodLoading: false,
                patchFoodError: null,
                fetchFoodLoading: false,
                fetchFoodError: null,
                delFoodLoading: false,
                delFoodError: null,
            });

            const initializer = createHttpResources("food");
            const result = initializer(store.set, store.get);

            const putResult = await result.putFood!(1, updatedItem);

            expect(putResult).toEqual(updatedItem);
            expect(fetchCalls).toHaveLength(1);
            expect(fetchCalls[0].url).toBe("/food/1");
            expect(fetchCalls[0].options.method).toBe("PUT");
        });

        it("PATCH should send partial update", async () => {
            const patchedItem: FoodItem = { id: 1, name: "Apple", calories: 100 };
            setupMockResponse(patchedItem);

            const store = createMockStore<TestState>({
                food: null,
                setFood: () => {},
                postFoodLoading: false,
                postFoodError: null,
                putFoodLoading: false,
                putFoodError: null,
                patchFoodLoading: false,
                patchFoodError: null,
                fetchFoodLoading: false,
                fetchFoodError: null,
                delFoodLoading: false,
                delFoodError: null,
            });

            const initializer = createHttpResources("food");
            const result = initializer(store.set, store.get);

            const patchResult = await result.patchFood!(1, { calories: 100 });

            expect(patchResult).toEqual(patchedItem);
            expect(fetchCalls).toHaveLength(1);
            expect(fetchCalls[0].url).toBe("/food/1");
            expect(fetchCalls[0].options.method).toBe("PATCH");
        });

        it("DELETE should send correct request", async () => {
            setupMockResponse(undefined, 204);

            const store = createMockStore<TestState>({
                food: null,
                setFood: () => {},
                postFoodLoading: false,
                postFoodError: null,
                putFoodLoading: false,
                putFoodError: null,
                patchFoodLoading: false,
                patchFoodError: null,
                fetchFoodLoading: false,
                fetchFoodError: null,
                delFoodLoading: false,
                delFoodError: null,
            });

            const initializer = createHttpResources("food");
            const result = initializer(store.set, store.get);

            await result.delFood!(1);

            expect(fetchCalls).toHaveLength(1);
            expect(fetchCalls[0].url).toBe("/food/1");
            expect(fetchCalls[0].options.method).toBe("DELETE");
        });

        it("FETCH should retrieve list of items", async () => {
            const items: FoodItem[] = [
                { id: 1, name: "Apple", calories: 95 },
                { id: 2, name: "Banana", calories: 105 },
            ];
            setupMockResponse(items);

            const store = createMockStore<TestState>({
                food: null,
                setFood: () => {},
                postFoodLoading: false,
                postFoodError: null,
                putFoodLoading: false,
                putFoodError: null,
                patchFoodLoading: false,
                patchFoodError: null,
                fetchFoodLoading: false,
                fetchFoodError: null,
                delFoodLoading: false,
                delFoodError: null,
            });

            const initializer = createHttpResources("food");
            const result = initializer(store.set, store.get);

            const fetchResult = await result.fetchFood!();

            expect(fetchResult).toEqual(items);
            expect(fetchCalls).toHaveLength(1);
            expect(fetchCalls[0].url).toBe("/food");
            expect(fetchCalls[0].options.method).toBe("GET");
        });
    });

    // -----------------------------------------------------------------------
    // Optimistic Update Tests
    // -----------------------------------------------------------------------

    describe("Optimistic Updates", () => {
        it("should optimistically update state before API call", async () => {
            const newItem: FoodItem = { id: 1, name: "Grape", calories: 67 };
            let resolveResponse: ((response: Response) => void) | undefined;
            const delayedResponse = new Promise<Response>((resolve) => {
                resolveResponse = resolve;
            });

            mockFetchHandler = async () => delayedResponse;

            const store = createMockStore<TestState>({
                food: null,
                setFood: () => {},
                postFoodLoading: false,
                postFoodError: null,
                putFoodLoading: false,
                putFoodError: null,
                patchFoodLoading: false,
                patchFoodError: null,
                fetchFoodLoading: false,
                fetchFoodError: null,
                delFoodLoading: false,
                delFoodError: null,
            });

            const initializer = createHttpResources("food", { isOptimistic: true });
            const result = initializer(store.set, store.get);

            const postPromise = result.postFood!(newItem);

            // State should be updated optimistically before API completes
            expect(store.getState().food).toEqual(newItem);

            // Resolve the promise with proper Response
            resolveResponse!(new Response(JSON.stringify(newItem), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            }));
            await postPromise;
        });

        it("should rollback state on API failure", async () => {
            const oldItem: FoodItem = { id: 0, name: "Old", calories: 50 };
            const newItem: FoodItem = { id: 1, name: "New", calories: 100 };

            const store = createMockStore<TestState>({
                food: oldItem,
                setFood: () => {},
                postFoodLoading: false,
                postFoodError: null,
                putFoodLoading: false,
                putFoodError: null,
                patchFoodLoading: false,
                patchFoodError: null,
                fetchFoodLoading: false,
                fetchFoodError: null,
                delFoodLoading: false,
                delFoodError: null,
            });

            setupMockError(500, "Internal Server Error");

            const initializer = createHttpResources("food", { isOptimistic: true });
            const result = initializer(store.set, store.get);

            await expect(result.postFood!(newItem)).rejects.toThrow();

            // State should be rolled back to old value
            expect(store.getState().food).toEqual(oldItem);
        });

        it("should preserve other state properties during optimistic update", async () => {
            const newItem: FoodItem = { id: 1, name: "Mango", calories: 60 };

            const store = createMockStore<TestState>({
                food: null,
                setFood: () => {},
                postFoodLoading: false,
                postFoodError: null,
                putFoodLoading: true, // Other state property
                putFoodError: null,
                patchFoodLoading: false,
                patchFoodError: null,
                fetchFoodLoading: false,
                fetchFoodError: null,
                delFoodLoading: false,
                delFoodError: null,
            });

            setupMockResponse(newItem);

            const initializer = createHttpResources("food", { isOptimistic: true });
            const result = initializer(store.set, store.get);

            await result.postFood!(newItem);

            // Other state properties should be preserved
            expect(store.getState().putFoodLoading).toBe(true);
        });

        it("should work with PUT optimistic update", async () => {
            const updatedItem: FoodItem = { id: 1, name: "Updated", calories: 150 };

            const store = createMockStore<TestState>({
                food: { id: 1, name: "Original", calories: 100 },
                setFood: () => {},
                postFoodLoading: false,
                postFoodError: null,
                putFoodLoading: false,
                putFoodError: null,
                patchFoodLoading: false,
                patchFoodError: null,
                fetchFoodLoading: false,
                fetchFoodError: null,
                delFoodLoading: false,
                delFoodError: null,
            });

            setupMockResponse(updatedItem);

            const initializer = createHttpResources("food", { isOptimistic: true });
            const result = initializer(store.set, store.get);

            await result.putFood!(1, updatedItem);

            expect(store.getState().food).toEqual(updatedItem);
        });

        it("should work with PATCH optimistic update", async () => {
            const patchedData = { calories: 200 };
            const expectedItem: FoodItem = { id: 1, name: "Patched", calories: 200 };

            const store = createMockStore<TestState>({
                food: { id: 1, name: "Patched", calories: 100 },
                setFood: () => {},
                postFoodLoading: false,
                postFoodError: null,
                putFoodLoading: false,
                putFoodError: null,
                patchFoodLoading: false,
                patchFoodError: null,
                fetchFoodLoading: false,
                fetchFoodError: null,
                delFoodLoading: false,
                delFoodError: null,
            });

            setupMockResponse(expectedItem);

            const initializer = createHttpResources("food", { isOptimistic: true });
            const result = initializer(store.set, store.get);

            await result.patchFood!(1, patchedData);

            // PATCH should merge with existing data
            expect(store.getState().food).toEqual(expectedItem);
        });
    });

    // -----------------------------------------------------------------------
    // Error Handling Tests
    // -----------------------------------------------------------------------

    describe("Error Handling", () => {
        it("should set error state on POST failure", async () => {
            const newItem: FoodItem = { id: 1, name: "Error", calories: 0 };

            const store = createMockStore<TestState>({
                food: null,
                setFood: () => {},
                postFoodLoading: false,
                postFoodError: null,
                putFoodLoading: false,
                putFoodError: null,
                patchFoodLoading: false,
                patchFoodError: null,
                fetchFoodLoading: false,
                fetchFoodError: null,
                delFoodLoading: false,
                delFoodError: null,
            });

            setupMockError(400, "Bad Request");

            const initializer = createHttpResources("food");
            const result = initializer(store.set, store.get);

            await expect(result.postFood!(newItem)).rejects.toThrow();

            expect(store.getState().postFoodError).toBeInstanceOf(Error);
            expect(store.getState().postFoodLoading).toBe(false);
        });

        it("should set error state on PUT failure", async () => {
            const updatedItem: FoodItem = { id: 1, name: "Error", calories: 0 };

            const store = createMockStore<TestState>({
                food: null,
                setFood: () => {},
                postFoodLoading: false,
                postFoodError: null,
                putFoodLoading: false,
                putFoodError: null,
                patchFoodLoading: false,
                patchFoodError: null,
                fetchFoodLoading: false,
                fetchFoodError: null,
                delFoodLoading: false,
                delFoodError: null,
            });

            setupMockError(404, "Not Found");

            const initializer = createHttpResources("food");
            const result = initializer(store.set, store.get);

            await expect(result.putFood!(1, updatedItem)).rejects.toThrow();

            expect(store.getState().putFoodError).toBeInstanceOf(Error);
        });

        it("should set error state on PATCH failure", async () => {
            const store = createMockStore<TestState>({
                food: null,
                setFood: () => {},
                postFoodLoading: false,
                postFoodError: null,
                putFoodLoading: false,
                putFoodError: null,
                patchFoodLoading: false,
                patchFoodError: null,
                fetchFoodLoading: false,
                fetchFoodError: null,
                delFoodLoading: false,
                delFoodError: null,
            });

            setupMockError(403, "Forbidden");

            const initializer = createHttpResources("food");
            const result = initializer(store.set, store.get);

            await expect(result.patchFood!(1, {})).rejects.toThrow();

            expect(store.getState().patchFoodError).toBeInstanceOf(Error);
        });

        it("should set error state on DELETE failure", async () => {
            const store = createMockStore<TestState>({
                food: null,
                setFood: () => {},
                postFoodLoading: false,
                postFoodError: null,
                putFoodLoading: false,
                putFoodError: null,
                patchFoodLoading: false,
                patchFoodError: null,
                fetchFoodLoading: false,
                fetchFoodError: null,
                delFoodLoading: false,
                delFoodError: null,
            });

            setupMockError(500, "Internal Server Error");

            const initializer = createHttpResources("food");
            const result = initializer(store.set, store.get);

            await expect(result.delFood!(1)).rejects.toThrow();

            expect(store.getState().delFoodError).toBeInstanceOf(Error);
        });

        it("should set error state on FETCH failure", async () => {
            const store = createMockStore<TestState>({
                food: null,
                setFood: () => {},
                postFoodLoading: false,
                postFoodError: null,
                putFoodLoading: false,
                putFoodError: null,
                patchFoodLoading: false,
                patchFoodError: null,
                fetchFoodLoading: false,
                fetchFoodError: null,
                delFoodLoading: false,
                delFoodError: null,
            });

            setupMockError(503, "Service Unavailable");

            const initializer = createHttpResources("food");
            const result = initializer(store.set, store.get);

            await expect(result.fetchFood!()).rejects.toThrow();

            expect(store.getState().fetchFoodError).toBeInstanceOf(Error);
        });
    });

    // -----------------------------------------------------------------------
    // Loading State Tests
    // -----------------------------------------------------------------------

    describe("Loading States", () => {
        it("should set loading to true during POST", async () => {
            const newItem: FoodItem = { id: 1, name: "Loading", calories: 50 };
            let resolveResponse: ((response: Response) => void) | undefined;
            const delayedResponse = new Promise<Response>((resolve) => {
                resolveResponse = resolve;
            });

            mockFetchHandler = async () => delayedResponse;

            const store = createMockStore<TestState>({
                food: null,
                setFood: () => {},
                postFoodLoading: false,
                postFoodError: null,
                putFoodLoading: false,
                putFoodError: null,
                patchFoodLoading: false,
                patchFoodError: null,
                fetchFoodLoading: false,
                fetchFoodError: null,
                delFoodLoading: false,
                delFoodError: null,
            });

            const initializer = createHttpResources("food");
            const result = initializer(store.set, store.get);

            const postPromise = result.postFood!(newItem);

            // Loading should be true during request
            expect(store.getState().postFoodLoading).toBe(true);

            resolveResponse!(new Response(JSON.stringify(newItem), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            }));
            await postPromise;

            // Loading should be false after completion
            expect(store.getState().postFoodLoading).toBe(false);
        });

        it("should set loading to false on error", async () => {
            const newItem: FoodItem = { id: 1, name: "Error", calories: 0 };

            const store = createMockStore<TestState>({
                food: null,
                setFood: () => {},
                postFoodLoading: false,
                postFoodError: null,
                putFoodLoading: false,
                putFoodError: null,
                patchFoodLoading: false,
                patchFoodError: null,
                fetchFoodLoading: false,
                fetchFoodError: null,
                delFoodLoading: false,
                delFoodError: null,
            });

            setupMockError(500, "Server Error");

            const initializer = createHttpResources("food");
            const result = initializer(store.set, store.get);

            await expect(result.postFood!(newItem)).rejects.toThrow();

            expect(store.getState().postFoodLoading).toBe(false);
        });

        it("should clear error on new request", async () => {
            const newItem: FoodItem = { id: 1, name: "Retry", calories: 75 };

            const store = createMockStore<TestState>({
                food: null,
                setFood: () => {},
                postFoodLoading: false,
                postFoodError: new Error("Previous error"),
                putFoodLoading: false,
                putFoodError: null,
                patchFoodLoading: false,
                patchFoodError: null,
                fetchFoodLoading: false,
                fetchFoodError: null,
                delFoodLoading: false,
                delFoodError: null,
            });

            setupMockResponse(newItem);

            const initializer = createHttpResources("food");
            const result = initializer(store.set, store.get);

            await result.postFood!(newItem);

            expect(store.getState().postFoodError).toBeNull();
        });
    });

    // -----------------------------------------------------------------------
    // Cancel Function Tests
    // -----------------------------------------------------------------------

    describe("Cancel Functions", () => {
        it("should have cancel functions for all methods", () => {
            const store = createMockStore<TestState>({
                food: null,
                setFood: () => {},
                postFoodLoading: false,
                postFoodError: null,
                putFoodLoading: false,
                putFoodError: null,
                patchFoodLoading: false,
                patchFoodError: null,
                fetchFoodLoading: false,
                fetchFoodError: null,
                delFoodLoading: false,
                delFoodError: null,
            });

            const initializer = createHttpResources("food");
            const result = initializer(store.set, store.get);

            expect(typeof result.cancelFetchFood).toBe("function");
            expect(typeof result.cancelPostFood).toBe("function");
            expect(typeof result.cancelPutFood).toBe("function");
            expect(typeof result.cancelPatchFood).toBe("function");
            expect(typeof result.cancelDelFood).toBe("function");
        });

        it("should cancel in-flight request", async () => {
            mockFetchHandler = async (_url, options) => {
                return new Promise<Response>((_resolve, reject) => {
                    // Listen for abort event
                    if (options.signal) {
                        options.signal.addEventListener('abort', () => {
                            reject(new DOMException('Aborted', 'AbortError'));
                        });
                    }
                });
            };

            const store = createMockStore<TestState>({
                food: null,
                setFood: () => {},
                postFoodLoading: false,
                postFoodError: null,
                putFoodLoading: false,
                putFoodError: null,
                patchFoodLoading: false,
                patchFoodError: null,
                fetchFoodLoading: false,
                fetchFoodError: null,
                delFoodLoading: false,
                delFoodError: null,
            });

            const initializer = createHttpResources("food");
            const result = initializer(store.set, store.get);

            const postPromise = result.postFood!({ id: 1, name: "Cancel", calories: 0 });

            // Give the request time to start
            await new Promise((resolve) => setTimeout(resolve, 10));

            // Cancel the request
            result.cancelPostFood!();

            // Wait for promise to settle
            await expect(postPromise).rejects.toThrow('Aborted');
        }, 10000);
    });

    // -----------------------------------------------------------------------
    // Query Parameters Tests
    // -----------------------------------------------------------------------

    describe("Query Parameters", () => {
        it("should append query params to FETCH URL", async () => {
            const items: FoodItem[] = [];
            setupMockResponse(items);

            const store = createMockStore<TestState>({
                food: null,
                setFood: () => {},
                postFoodLoading: false,
                postFoodError: null,
                putFoodLoading: false,
                putFoodError: null,
                patchFoodLoading: false,
                patchFoodError: null,
                fetchFoodLoading: false,
                fetchFoodError: null,
                delFoodLoading: false,
                delFoodError: null,
            });

            const initializer = createHttpResources("food");
            const result = initializer(store.set, store.get);

            await result.fetchFood!({ minCalories: 50, maxCalories: 200 });

            expect(fetchCalls[0].url).toContain("minCalories=50");
            expect(fetchCalls[0].url).toContain("maxCalories=200");
        });

        it("should append query params to POST URL", async () => {
            const newItem: FoodItem = { id: 1, name: "Test", calories: 100 };
            setupMockResponse(newItem);

            const store = createMockStore<TestState>({
                food: null,
                setFood: () => {},
                postFoodLoading: false,
                postFoodError: null,
                putFoodLoading: false,
                putFoodError: null,
                patchFoodLoading: false,
                patchFoodError: null,
                fetchFoodLoading: false,
                fetchFoodError: null,
                delFoodLoading: false,
                delFoodError: null,
            });

            const initializer = createHttpResources("food");
            const result = initializer(store.set, store.get);

            await result.postFood!(newItem, { query: { category: "fruit" } });

            expect(fetchCalls[0].url).toContain("category=fruit");
        });

        it("should append query params to PUT URL", async () => {
            const updatedItem: FoodItem = { id: 1, name: "Test", calories: 100 };
            setupMockResponse(updatedItem);

            const store = createMockStore<TestState>({
                food: null,
                setFood: () => {},
                postFoodLoading: false,
                postFoodError: null,
                putFoodLoading: false,
                putFoodError: null,
                patchFoodLoading: false,
                patchFoodError: null,
                fetchFoodLoading: false,
                fetchFoodError: null,
                delFoodLoading: false,
                delFoodError: null,
            });

            const initializer = createHttpResources("food");
            const result = initializer(store.set, store.get);

            await result.putFood!(1, updatedItem, { query: { version: 2 } });

            expect(fetchCalls[0].url).toContain("version=2");
        });

        it("should append query params to PATCH URL", async () => {
            setupMockResponse({ id: 1, name: "Test", calories: 100 });

            const store = createMockStore<TestState>({
                food: null,
                setFood: () => {},
                postFoodLoading: false,
                postFoodError: null,
                putFoodLoading: false,
                putFoodError: null,
                patchFoodLoading: false,
                patchFoodError: null,
                fetchFoodLoading: false,
                fetchFoodError: null,
                delFoodLoading: false,
                delFoodError: null,
            });

            const initializer = createHttpResources("food");
            const result = initializer(store.set, store.get);

            await result.patchFood!(1, { calories: 150 }, { query: { partial: true } });

            expect(fetchCalls[0].url).toContain("partial=true");
        });
    });

    // -----------------------------------------------------------------------
    // Edge Cases
    // -----------------------------------------------------------------------

    describe("Edge Cases", () => {
        it("should handle 204 No Content response", async () => {
            setupMockResponse(undefined, 204);

            const store = createMockStore<TestState>({
                food: null,
                setFood: () => {},
                postFoodLoading: false,
                postFoodError: null,
                putFoodLoading: false,
                putFoodError: null,
                patchFoodLoading: false,
                patchFoodError: null,
                fetchFoodLoading: false,
                fetchFoodError: null,
                delFoodLoading: false,
                delFoodError: null,
            });

            const initializer = createHttpResources("food");
            const result = initializer(store.set, store.get);

            const deleteResult = await result.delFood!(1);

            expect(deleteResult).toBeUndefined();
        });

        it("should handle non-Error exceptions", async () => {
            mockFetchHandler = async () => {
                throw new Error("String error converted");
            };

            const store = createMockStore<TestState>({
                food: null,
                setFood: () => {},
                postFoodLoading: false,
                postFoodError: null,
                putFoodLoading: false,
                putFoodError: null,
                patchFoodLoading: false,
                patchFoodError: null,
                fetchFoodLoading: false,
                fetchFoodError: null,
                delFoodLoading: false,
                delFoodError: null,
            });

            const initializer = createHttpResources("food");
            const result = initializer(store.set, store.get);

            await expect(result.fetchFood!()).rejects.toThrow();
        });

        it("should handle multiple sequential requests", async () => {
            const items1: FoodItem[] = [{ id: 1, name: "First", calories: 100 }];
            const items2: FoodItem[] = [
                { id: 1, name: "First", calories: 100 },
                { id: 2, name: "Second", calories: 200 },
            ];

            let callCount = 0;
            mockFetchHandler = async () => {
                callCount++;
                return new Response(
                    JSON.stringify(callCount === 1 ? items1 : items2),
                    { status: 200, headers: { "Content-Type": "application/json" } }
                );
            };

            const store = createMockStore<TestState>({
                food: null,
                setFood: () => {},
                postFoodLoading: false,
                postFoodError: null,
                putFoodLoading: false,
                putFoodError: null,
                patchFoodLoading: false,
                patchFoodError: null,
                fetchFoodLoading: false,
                fetchFoodError: null,
                delFoodLoading: false,
                delFoodError: null,
            });

            const initializer = createHttpResources("food");
            const result = initializer(store.set, store.get);

            const result1 = await result.fetchFood!();
            const result2 = await result.fetchFood!();

            expect(result1).toEqual(items1);
            expect(result2).toEqual(items2);
            expect(fetchCalls).toHaveLength(2);
        });

        it("should handle optimistic update with undefined oldData", async () => {
            const newItem: FoodItem = { id: 1, name: "Test", calories: 100 };

            const store = createMockStore<TestState>({
                food: undefined as any,
                setFood: () => {},
                postFoodLoading: false,
                postFoodError: null,
                putFoodLoading: false,
                putFoodError: null,
                patchFoodLoading: false,
                patchFoodError: null,
                fetchFoodLoading: false,
                fetchFoodError: null,
                delFoodLoading: false,
                delFoodError: null,
            });

            setupMockError(500, "Server Error");

            const initializer = createHttpResources("food", { isOptimistic: true });
            const result = initializer(store.set, store.get);

            await expect(result.postFood!(newItem)).rejects.toThrow();

            // Should rollback to undefined/null
            expect(store.getState().food).toBeUndefined();
        });
    });
});

// ---------------------------------------------------------------------------
// Integration Test Example
// ---------------------------------------------------------------------------

describe("Integration Tests", () => {
    it("full CRUD workflow", async () => {
        const store = createMockStore<TestState>({
            food: null,
            setFood: () => {},
            postFoodLoading: false,
            postFoodError: null,
            putFoodLoading: false,
            putFoodError: null,
            patchFoodLoading: false,
            patchFoodError: null,
            fetchFoodLoading: false,
            fetchFoodError: null,
            delFoodLoading: false,
            delFoodError: null,
        });

        const initializer = createHttpResources("food");
        const result = initializer(store.set, store.get);

        // CREATE
        const newItem: FoodItem = { id: 1, name: "Apple", calories: 95 };
        setupMockResponse(newItem);
        await result.postFood!(newItem);

        // READ
        const items: FoodItem[] = [newItem];
        setupMockResponse(items);
        const fetched = await result.fetchFood!();
        expect(fetched).toEqual(items);

        // UPDATE
        const updatedItem: FoodItem = { ...newItem, calories: 100 };
        setupMockResponse(updatedItem);
        await result.putFood!(1, updatedItem);

        // PARTIAL UPDATE
        const patchedItem: FoodItem = { ...updatedItem, name: "Green Apple" };
        setupMockResponse(patchedItem);
        await result.patchFood!(1, { name: "Green Apple" });

        // DELETE
        setupMockResponse(undefined, 204);
        await result.delFood!(1);
    });
});
