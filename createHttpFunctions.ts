// ---------------------------------------------------------------------------
// createResources
// ---------------------------------------------------------------------------

import type { CreateResourcesOptions, HttpMethod } from "./createHttpResources";

type QueryParamValue = string | number | boolean | null | undefined;

type QueryParams = Record<string, QueryParamValue>;

// Helper to build query string from params
const buildQueryString = (params?: QueryParams): string => {
    if (!params) return "";
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
        }
    }
    const query = searchParams.toString();
    return query ? `?${query}` : "";
};

// Helper to build URL with optional ID and query params
const buildUrl = (
    baseUrl: string,
    resource: string,
    id?: string | number,
    queryParams?: QueryParams
): string => {
    const base = `${baseUrl}/${resource}${id !== undefined ? `/${String(id)}` : ""}`;
    return `${base}${buildQueryString(queryParams)}`;
};

// Default fetch wrapper with error handling
const defaultFetch = async <T>(
    url: string,
    options: RequestInit,
    defaultHeaders?: Record<string, string>,
    signal?: AbortSignal
): Promise<T> => {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...defaultHeaders,
        ...(options.headers as Record<string, string>),
    };

    const response = await fetch(url, {
        ...options,
        headers,
        signal: signal ?? null,
    } as RequestInit);

    if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    // Handle 204 No Content (common for DELETE)
    if (response.status === 204) {
        return undefined as unknown as T;
    }

    return response.json() as T;
};

// Cancellable function wrapper
type CancellableFunction<TFn> = {
    fn: TFn;
    cancel: () => void;
};

// Method function generators
const createFetchFn = <TData>(
    baseUrl: string,
    resource: string,
    defaultHeaders?: Record<string, string>
): CancellableFunction<(queryParams?: QueryParams) => Promise<TData[]>> => {
    let abortController: AbortController | null = null;

    const fn = async (queryParams?: QueryParams) => {
        abortController = new AbortController();
        const url = buildUrl(baseUrl, resource, undefined, queryParams);
        return defaultFetch<TData[]>(url, { method: "GET" }, defaultHeaders, abortController.signal);
    };

    const cancel = () => {
        abortController?.abort();
        abortController = null;
    };

    return { fn, cancel };
};

const createPostFn = <TData>(
    baseUrl: string,
    resource: string,
    defaultHeaders?: Record<string, string>
): CancellableFunction<(body: TData, options?: { query?: QueryParams }) => Promise<TData>> => {
    let abortController: AbortController | null = null;

    const fn = async (body: TData, options?: { query?: QueryParams }) => {
        abortController = new AbortController();
        const url = buildUrl(baseUrl, resource, undefined, options?.query);
        return defaultFetch<TData>(url, {
            method: "POST",
            body: JSON.stringify(body),
        }, defaultHeaders, abortController.signal);
    };

    const cancel = () => {
        abortController?.abort();
        abortController = null;
    };

    return { fn, cancel };
};

const createPutFn = <TData>(
    baseUrl: string,
    resource: string,
    defaultHeaders?: Record<string, string>
): CancellableFunction<(
    id: string | number,
    body: TData,
    options?: { query?: QueryParams }
) => Promise<TData>> => {
    let abortController: AbortController | null = null;

    const fn = async (
        id: string | number,
        body: TData,
        options?: { query?: QueryParams }
    ) => {
        abortController = new AbortController();
        const url = buildUrl(baseUrl, resource, id, options?.query);
        return defaultFetch<TData>(url, {
            method: "PUT",
            body: JSON.stringify(body),
        }, defaultHeaders, abortController.signal);
    };

    const cancel = () => {
        abortController?.abort();
        abortController = null;
    };

    return { fn, cancel };
};

const createPatchFn = <TData>(
    baseUrl: string,
    resource: string,
    defaultHeaders?: Record<string, string>
): CancellableFunction<(
    id: string | number,
    body: Partial<TData>,
    options?: { query?: QueryParams }
) => Promise<TData>> => {
    let abortController: AbortController | null = null;

    const fn = async (
        id: string | number,
        body: Partial<TData>,
        options?: { query?: QueryParams }
    ) => {
        abortController = new AbortController();
        const url = buildUrl(baseUrl, resource, id, options?.query);
        return defaultFetch<TData>(url, {
            method: "PATCH",
            body: JSON.stringify(body),
        }, defaultHeaders, abortController.signal);
    };

    const cancel = () => {
        abortController?.abort();
        abortController = null;
    };

    return { fn, cancel };
};

const createDelFn = (
    baseUrl: string,
    resource: string,
    defaultHeaders?: Record<string, string>
): CancellableFunction<(id: string | number) => Promise<void>> => {
    let abortController: AbortController | null = null;

    const fn = async (id: string | number) => {
        abortController = new AbortController();
        const url = buildUrl(baseUrl, resource, id);
        await defaultFetch<void>(url, { method: "DELETE" }, defaultHeaders, abortController.signal);
    };

    const cancel = () => {
        abortController?.abort();
        abortController = null;
    };

    return { fn, cancel };
};

// Main createResources function
export function createHttpFunctions<
    TItem extends Record<string, unknown>,
>(
    resource: string,
    options?: CreateResourcesOptions
): {
    fetchFn?: (queryParams?: QueryParams) => Promise<TItem[]>;
    cancelFetch?: () => void;
    postFn?: (body: TItem, options?: { query?: QueryParams }) => Promise<TItem>;
    cancelPost?: () => void;
    putFn?: (
        id: string | number,
        body: TItem,
        options?: { query?: QueryParams }
    ) => Promise<TItem>;
    cancelPut?: () => void;
    patchFn?: (
        id: string | number,
        body: Partial<TItem>,
        options?: { query?: QueryParams }
    ) => Promise<TItem>;
    cancelPatch?: () => void;
    delFn?: (id: string | number) => Promise<void>;
    cancelDel?: () => void;
} {
    const baseUrl = options?.baseUrl ?? "";
    const include = options?.include ?? "all";
    const methods: Array<HttpMethod> =
        include === "all"
            ? ["fetch", "post", "put", "patch", "del"]
            : include;

    const result: Record<string, unknown> = {};

    if (methods.includes("fetch")) {
        const { fn, cancel } = createFetchFn<TItem>(baseUrl, resource, options?.fetchOptions?.headers);
        (result as any).fetchFn = fn;
        (result as any).cancelFetch = cancel;
    }

    if (methods.includes("post")) {
        const { fn, cancel } = createPostFn<TItem>(baseUrl, resource, options?.fetchOptions?.headers);
        (result as any).postFn = fn;
        (result as any).cancelPost = cancel;
    }

    if (methods.includes("put")) {
        const { fn, cancel } = createPutFn<TItem>(baseUrl, resource, options?.fetchOptions?.headers);
        (result as any).putFn = fn;
        (result as any).cancelPut = cancel;
    }

    if (methods.includes("patch")) {
        const { fn, cancel } = createPatchFn<TItem>(baseUrl, resource, options?.fetchOptions?.headers);
        (result as any).patchFn = fn;
        (result as any).cancelPatch = cancel;
    }

    if (methods.includes("del")) {
        const { fn, cancel } = createDelFn(baseUrl, resource, options?.fetchOptions?.headers);
        (result as any).delFn = fn;
        (result as any).cancelDel = cancel;
    }

    return result as {
        fetchFn?: (queryParams?: QueryParams) => Promise<TItem[]>;
        cancelFetch?: () => void;
        postFn?: (body: TItem, options?: { query?: QueryParams }) => Promise<TItem>;
        cancelPost?: () => void;
        putFn?: (
            id: string | number,
            body: TItem,
            options?: { query?: QueryParams }
        ) => Promise<TItem>;
        cancelPut?: () => void;
        patchFn?: (
            id: string | number,
            body: Partial<TItem>,
            options?: { query?: QueryParams }
        ) => Promise<TItem>;
        cancelPatch?: () => void;
        delFn?: (id: string | number) => Promise<void>;
        cancelDel?: () => void;
    };
}
