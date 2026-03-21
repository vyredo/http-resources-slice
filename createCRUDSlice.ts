// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------



export type SetFn<T extends Record<string, unknown>> = (
    updater: Partial<T> | ((state: T) => T)
) => void;

export type GetFn<T extends Record<string, unknown>> = () => T;

type OperationState = {
    loading: boolean;
    error: Error | null;
};

type HttpMethod = "fetch" | "post" | "put" | "patch" | "del";

// ---------------------------------------------------------------------------
// Type helpers
// ---------------------------------------------------------------------------

type Suffix<As extends string | undefined> =
    As extends string ? Capitalize<As> : "";

type DataKey<As extends string | undefined> =
    As extends string ? As : "data";

type SetterKey<As extends string | undefined> =
    As extends string ? `set${Capitalize<As>}` : "setData";

type LoadingKey<M extends HttpMethod, As extends string | undefined> =
    `${M}${Suffix<As>}Loading`;

type ErrorKey<M extends HttpMethod, As extends string | undefined> =
    `${M}${Suffix<As>}Error`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const capitalize = <S extends string>(s: S): Capitalize<S> =>
    ((s[0]?.toUpperCase() ?? "") + s.slice(1)) as Capitalize<S>;

const getLoadingKey = <M extends HttpMethod, S extends string>(
    method: M,
    suffix: S
): `${M}${S}Loading` => `${method}${suffix}Loading` as `${M}${S}Loading`;

const getErrorKey = <M extends HttpMethod, S extends string>(
    method: M,
    suffix: S
): `${M}${S}Error` => `${method}${suffix}Error` as `${M}${S}Error`;

const updateOperation =
    <T extends Record<string, unknown>>(set: SetFn<T>, method: HttpMethod, suffix: string) =>
        (partial: Partial<OperationState>): void => {
            set((state) => ({
                ...state,
                ...(partial.loading !== undefined
                    ? { [getLoadingKey(method, suffix)]: partial.loading }
                    : {}),
                ...(partial.error !== undefined
                    ? { [getErrorKey(method, suffix)]: partial.error }
                    : {}),
            }));
        };

function asyncAction<
    T extends Record<string, unknown>,
    TArgs extends unknown[],
    TResult,
>(
    set: SetFn<T>,
    method: HttpMethod,
    suffix: string,
    fn: (...args: TArgs) => Promise<TResult>,
    onSuccess?: (result: TResult) => void,
    externalCancel?: () => void,
) {
    const update = updateOperation(set, method, suffix);
    let cancelled = false;



    const execute = async (...args: TArgs): Promise<TResult> => {
        cancelled = false;
        update({ loading: true, error: null });
        try {
            const result = await fn(...args);
            if (!cancelled) {
                onSuccess?.(result);
                update({ loading: false });
            }
            return result;
        } catch (err) {
            if (!cancelled) {
                const error = err instanceof Error ? err : new Error(String(err));
                update({ loading: false, error });
            }
            throw err;
        }
    };

    const cancel = (): void => {
        cancelled = true;
        externalCancel?.(); // Cancel the network request if available
    };

    return { execute, cancel };
}

// ---------------------------------------------------------------------------
// createCRUDSlice
// ---------------------------------------------------------------------------

// MethodSlice: pure shape, no conditional — TFn removed
type MethodSlice<
    M extends HttpMethod,
    As extends string | undefined,
    TArg extends unknown[],
    TResult,
> = { [K in `${M}${Suffix<As>}`]: (...args: TArg) => Promise<TResult> }
    & { [K in `cancel${Capitalize<M>}${Suffix<As>}`]: () => void }
    & { [K in LoadingKey<M, As>]: boolean }
    & { [K in ErrorKey<M, As>]: Error | null };

// ConditionalMethodSlice: guards on TFn, delegates to MethodSlice
type ConditionalMethodSlice<
    TFn extends ((...args: any[]) => Promise<any>) | undefined,
    M extends HttpMethod,
    As extends string | undefined,
> = [TFn] extends [undefined]
    ? {}
    : TFn extends (...args: infer TArg extends unknown[]) => Promise<infer TResult>
    ? MethodSlice<M, As, TArg, TResult>  // ← exact types, not any
    : {};



type DataSlice<TData, As extends string | undefined> = {
    [K in DataKey<As>]: TData | null;
} & {
    [K in SetterKey<As>]: (value: TData | null) => void;
};

export function createCRUDSlice<
    TData extends Record<string, unknown> | Array<Record<string, unknown>>,
    TFetchFn extends (() => Promise<TData>) | undefined = undefined,
    TPostFn extends ((...args: any[]) => Promise<any>) | undefined = undefined,
    TPutFn extends ((...args: any[]) => Promise<any>) | undefined = undefined,
    TPatchFn extends ((...args: any[]) => Promise<any>) | undefined = undefined,
    TDelFn extends ((...args: any[]) => Promise<any>) | undefined = undefined,
    As extends string | undefined = undefined,
>(
    params: {
        fetchFn?: TFetchFn,
        postFn?: TPostFn,
        putFn?: TPutFn,
        patchFn?: TPatchFn,
        delFn?: TDelFn,
        as?: As,
        isOptimist?: boolean,
        cancelFetch?: () => void,
        cancelPost?: () => void,
        cancelPut?: () => void,
        cancelPatch?: () => void,
        cancelDel?: () => void,
    }
) {
    type Slice =
        DataSlice<TData, As> &
        ConditionalMethodSlice<TFetchFn, "fetch", As> &
        ConditionalMethodSlice<TPostFn, "post", As> &
        ConditionalMethodSlice<TPutFn, "put", As> &
        ConditionalMethodSlice<TPatchFn, "patch", As> &
        ConditionalMethodSlice<TDelFn, "del", As>;

    return (set: SetFn<Slice>, _get: GetFn<Slice>): Slice => {
        const dataKey = (params.as ?? "data") as DataKey<As>;
        const suffix = params.as ? capitalize(params.as) : "";
        const setterKey = (params.as ? `set${capitalize(params.as)}` : "setData") as SetterKey<As>;

        const base: Record<string, unknown> = {
            [dataKey]: null,
            [setterKey]: (value: TData | null) =>
                set((state) => ({ ...state, [dataKey]: value })),
        };

        if (params.fetchFn) {
            const cancelFn = (params as any).cancelFetch;
            const { execute, cancel } = asyncAction(
                set, "fetch", suffix, params.fetchFn,
                (result) => set((state) => ({ ...state, [dataKey]: result })),
                cancelFn
            );
            base[`fetch${suffix}`] = execute;
            base[`cancelFetch${suffix}`] = cancel;
        }

        if (params.postFn) {
            const cancelFn = (params as any).cancelPost;
            const { execute, cancel } = asyncAction(set, "post", suffix, params.postFn, undefined, cancelFn);
            base[`post${suffix}`] = execute;
            base[`cancelPost${suffix}`] = cancel;
        }

        if (params.putFn) {
            const cancelFn = (params as any).cancelPut;
            const { execute, cancel } = asyncAction(set, "put", suffix, params.putFn, undefined, cancelFn);
            base[`put${suffix}`] = execute;
            base[`cancelPut${suffix}`] = cancel;
        }

        if (params.patchFn) {
            const cancelFn = (params as any).cancelPatch;
            const { execute, cancel } = asyncAction(set, "patch", suffix, params.patchFn, undefined, cancelFn);
            base[`patch${suffix}`] = execute;
            base[`cancelPatch${suffix}`] = cancel;
        }

        if (params.delFn) {
            const cancelFn = (params as any).cancelDel;
            const { execute, cancel } = asyncAction(set, "del", suffix, params.delFn, undefined, cancelFn);
            base[`del${suffix}`] = execute;
            base[`cancelDel${suffix}`] = cancel;
        }

        return base as Slice;
    };
}
