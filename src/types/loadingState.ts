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
    | IAsyncStatus_Failed<E>;

interface IAsyncStatus_NotStarted {
    status: "not-started" | undefined; 
}

interface IAsyncStatus_Loading {
    status: "loading"; 
}

interface IAsyncStatus_Loaded<V> {
    status: "loaded"; 
    value: V;
}

interface IAsyncStatus_Failed<E> {
    status: "failed"; 
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
        status: "loading",
    }
}

/**
 * State that represents that loading has completed. 
 */
export function asyncStatusLoaded<V>(value: V): IAsyncStatus_Loaded<V> {
    return {
        status: "loaded", 
        value, 
    }
}

/**
 * State that represents that there was a failure and loading could not be completed.
 */
export function asyncStatusFailed<E>(error: E): IAsyncStatus_Failed<E> {
    return {
        status: "failed", 
        error, 
    }
}

export function isAsyncStatusNotStarted<V, E>(
    state: IAsyncStatus<V, E> | undefined,
): state is IAsyncStatus_NotStarted | undefined {
    return state == null || state.status == null || state.status === "not-started";
}

export function isAsyncStatusLoading<V, E>(state: IAsyncStatus<V, E> | undefined): state is IAsyncStatus_Loading {
    return state != null && state.status === "loading";
}

export function isAsyncStatusLoaded<V, E>(state: IAsyncStatus<V, E> | undefined): state is IAsyncStatus_Loaded<V> {
    return state != null && state.status === "loaded";
}

export function isFailedLoading<V, E>(state: IAsyncStatus<V, E> | undefined): state is IAsyncStatus_Failed<E> {
    return state != null && state.status === "failed";
}
