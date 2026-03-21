import { createCRUDSlice, GetFn, SetFn } from "./createCRUDSlice";
import { createHttpFunctions } from "./createHttpFunctions";

export type HttpMethod = "fetch" | "post" | "put" | "patch" | "del";

export type CreateResourcesOptions = {
    /**
     * HTTP methods to include in the generated resource
     * - "all": includes all CRUD methods (default)
     * - Array: specific methods to include
     * 
     * Note: "fetch" is used instead of "get" to align with createCRUDSlice convention
     * @default "all"
     */
    include?: "all" | Array<"fetch" | "post" | "put" | "patch" | "del">;
    /**
     * Base URL prefix for all requests (e.g., "/api")
     * @default ""
     */
    baseUrl?: string;
    /**
     * Default fetch options applied to all requests
     */
    fetchOptions?: Omit<RequestInit, "method" | "body" | "headers"> & {
        headers?: Record<string, string>;
    };
};


// ==================================================================================================================================================================================================================
export const createHttpResources = <N extends string>(name: N, opt?: {
    isOptimistic?: boolean
}) => (set: SetFn<any>, get: GetFn<any>) => {
    const { postFn, putFn, patchFn, ...rest } = createHttpFunctions(name)

    const isOptimistic = !!opt?.isOptimistic;

    // Optimistic wrapper for POST (body is first argument)
    const optimisPostFunc = <T,>(asyncFn: (body: T, options?: any) => Promise<T>) =>
        async (body: T, options?: any) => {
            const oldData = get()[name];
            set((data: any) => ({
                ...data,
                [name]: body
            }));
            try {
                return await asyncFn(body, options)
            } catch (error) {
                set((data: any) => ({
                    ...data,
                    [name]: oldData
                }));
                throw error;
            }
        }

    // Optimistic wrapper for PUT (body is second argument)
    const optimisPutFunc = <T,>(asyncFn: (id: string | number, body: T, options?: any) => Promise<T>) =>
        async (id: string | number, body: T, options?: any) => {
            const oldData = get()[name];
            set((data: any) => ({
                ...data,
                [name]: body
            }));
            try {
                return await asyncFn(id, body, options)
            } catch (error) {
                set((data: any) => ({
                    ...data,
                    [name]: oldData
                }));
                throw error;
            }
        }

    // Optimistic wrapper for PATCH (body is second argument, partial)
    const optimisPatchFunc = <T,>(asyncFn: (id: string | number, body: Partial<T>, options?: any) => Promise<T>) =>
        async (id: string | number, body: Partial<T>, options?: any) => {
            const oldData = get()[name];
            const currentData = oldData;
            
            // Merge patch with current data for optimistic update
            const newData = currentData && typeof currentData === 'object' 
                ? { ...currentData, ...body }
                : body;
                
            set((data: any) => ({
                ...data,
                [name]: newData
            }));
            try {
                return await asyncFn(id, body, options)
            } catch (error) {
                set((data: any) => ({
                    ...data,
                    [name]: oldData
                }));
                throw error;
            }
        }

    let wrapPostFn = postFn
    if (isOptimistic && postFn) {
        wrapPostFn = optimisPostFunc(postFn)
    }
    let wrapPutFn = putFn
    if (isOptimistic && putFn) {
        wrapPutFn = optimisPutFunc(putFn)
    }
    let wrapPatchFn = patchFn
    if (isOptimistic && patchFn) {
        wrapPatchFn = optimisPatchFunc(patchFn)
    }

    return createCRUDSlice({
        as: name,
        ...rest,
        postFn: wrapPostFn,
        putFn: wrapPutFn,
        patchFn: wrapPatchFn
    })(set, get);
}




