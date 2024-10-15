/**
Copyright 2024 Palantir Technologies, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

/**
 * Final composite 'async' loading types. 
 */
export type IAsyncStatus<V, E = unknown> = 
    | IAsyncStatus_NotStarted
    | IAsyncStatus_Loading
    | IAsyncStatus_Loaded<V>
    | IAsyncStatus_Reloading<V>
    | IAsyncStatus_Failed<E>;

interface IAsyncStatus_NotStarted {
    status: "NOT_STARTED" | undefined; 
}

interface IAsyncStatus_Loading {
    status: "LOADING"; 
}

interface IAsyncStatus_Loaded<V> {
    status: "LOADED"; 
    value: V;
}

interface IAsyncStatus_Reloading<V> {
    progress?: number;
    status: "RELOADING"; 
    value: V; 
}

interface IAsyncStatus_Failed<E> {
    status: "FAILED"; 
    error: E; 
}

/**
 * State that represents that loading has not yet started. 
 */
export function asyncStatusNotStarted(): IAsyncStatus_NotStarted {
    return {
        status: undefined, 
    };
}

/**
 * State that represents that loading is in progress. 
 */
export function asyncStatusLoading(): IAsyncStatus_Loading {
    return {
        status: "LOADING",
    }
}

/**
 * State that represents that loading has completed. 
 */
export function asyncStatusLoaded<V>(value: V): IAsyncStatus_Loaded<V> {
    return {
        status: "LOADED", 
        value, 
    }
}

/**
 * State that represents that there was a failure and loading could not be completed.
 */
export function asyncStatusFailed<E>(error: E): IAsyncStatus_Failed<E> {
    return {
        status: "FAILED", 
        error, 
    }
}

export function asyncReloading<V>(value: V, progress?: number): IAsyncStatus_Reloading<V> {
    return {
        progress,
        status: "RELOADING",
        value,
    };
}

export function isAsyncStatusNotStarted<V, E>(
    state: IAsyncStatus<V, E> | undefined,
): state is IAsyncStatus_NotStarted | undefined {
    return state == null || state.status == null || state.status === "NOT_STARTED";
}

export function isAsyncStatusLoading<V, E>(state: IAsyncStatus<V, E> | undefined): state is IAsyncStatus_Loading {
    return state != null && state.status === "LOADING";
}

export function isAsyncStatusLoaded<V, E>(state: IAsyncStatus<V, E> | undefined): state is IAsyncStatus_Loaded<V> {
    return state != null && state.status === "LOADED";
}

export function isAsyncStatusFailedLoading<V, E>(state: IAsyncStatus<V, E> | undefined): state is IAsyncStatus_Failed<E> {
    return state != null && state.status === "FAILED";
}
