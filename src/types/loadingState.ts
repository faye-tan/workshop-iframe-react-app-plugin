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
 * 
 * @type V The value type
 * @type E The error type, defaults to `unknown`
 */
export type IAsyncLoaded<V, E = unknown> =
  | IAsyncLoaded_NotStarted
  | IAsyncLoaded_Loading
  | IAsyncLoaded_Loaded<V>
  | IAsyncLoaded_Reloading<V>
  | IAsyncLoaded_Failed<E>;

/**
 * State that represents that loading hasn't started yet.
 */
interface IAsyncLoaded_NotStarted {
  status: "NOT_STARTED" | undefined;
}

/**
 * State that represents that loading is in progress.
 */
interface IAsyncLoaded_Loading {
  status: "LOADING";
}

/**
 * State that represents that loading has completed successfully.
 * 
 * @type V: The value type
 */
interface IAsyncLoaded_Loaded<V> {
  status: "LOADED";
  value: V;
}

/**
 * State that represents that reloading is in progress.
 * 
 * @type V: The value type
 */
interface IAsyncLoaded_Reloading<V> {
  progress?: number;
  status: "RELOADING";
  value: V;
}

/**
 * State that represents that loading failed.
 * 
 * @type E: The error type
 */
interface IAsyncLoaded_Failed<E> {
  status: "FAILED";
  error: E;
}

/**
 * Helper function for creating "not started" async loading state.
 */
export function asyncStatusNotStarted(): IAsyncLoaded_NotStarted {
  return {
    status: undefined,
  };
}

/**
 * Helper function for creating "loading" async loading state.
 */
export function asyncStatusLoading(): IAsyncLoaded_Loading {
  return {
    status: "LOADING",
  };
}

/**
 * Helper function for creating the "loaded" async loading state.
 * 
 * @param value: The loaded value
 * @type V: The value type
 */
export function asyncStatusLoaded<V>(value: V): IAsyncLoaded_Loaded<V> {
  return {
    status: "LOADED",
    value,
  };
}

/**
 * Helper function for creating the "failed" async loading state.
 * 
 * @param error: The error associated with the reason behind the failure
 * @type E: The error type
 */
export function asyncStatusFailed<E>(error: E): IAsyncLoaded_Failed<E> {
  return {
    status: "FAILED",
    error,
  };
}

/**
 * Helper function for creating the "failed" async loading state.
 * 
 * @param value: The previously loaded value
 * @param progress: The loading progress percentage
 * @type V: The value type
 */
export function asyncReloading<V>(
  value: V,
  progress?: number
): IAsyncLoaded_Reloading<V> {
  return {
    progress,
    status: "RELOADING",
    value,
  };
}

/**
 * Type guard for "not started" async loaded state.
 * 
 * @param state: The async loaded state to type check
 * @type V: The value type
 * @type E: The error type
 * @returns true only if the asyncloaded state is "not started".
 */
export function isAsyncStatus_NotStarted<V, E>(
  state: IAsyncLoaded<V, E> | undefined
): state is IAsyncLoaded_NotStarted | undefined {
  return (
    state == null || state.status == null || state.status === "NOT_STARTED"
  );
}

/**
 * Type guard for "loading" async loaded state.
 * 
 * @param state: The async loaded state to type check
 * @type V: The value type
 * @type E: The error type
 * @returns true only if the asyncloaded state is "loading".
 */
export function isAsyncStatus_Loading<V, E>(
  state: IAsyncLoaded<V, E> | undefined
): state is IAsyncLoaded_Loading {
  return state != null && state.status === "LOADING";
}

/**
 * Type guard for "loaded" async loaded state.
 * 
 * @param state: The async loaded state to type check
 * @type V: The value type
 * @type E: The error type
 * @returns true only if the asyncloaded state is "loaded".
 */
export function isAsyncStatus_Loaded<V, E>(
  state: IAsyncLoaded<V, E> | undefined
): state is IAsyncLoaded_Loaded<V> {
  return state != null && state.status === "LOADED";
}

/**
 * Type guard for "failed loading" async loaded state.
 * 
 * @param state: The async loaded state to type check
 * @type V: The value type
 * @type E: The error type
 * @returns true only if the asyncloaded state is "failed loading".
 */
export function isAsyncStatus_FailedLoading<V, E>(
  state: IAsyncLoaded<V, E> | undefined
): state is IAsyncLoaded_Failed<E> {
  return state != null && state.status === "FAILED";
}
