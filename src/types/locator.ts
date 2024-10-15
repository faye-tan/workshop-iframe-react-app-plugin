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
 * Represents the path to a value in the config
 */
export type ILocator = ILocator_Single | ILocator_ListOf;
export interface ILocator_Single {
    type: "single";
    configFieldId: string;
}
/**
 * Traverses tho the configFieldId which should be a listOf, and then indexes into it and continues traversing along the path to the value.
 */
export interface ILocator_ListOf {
    type: "listOf";
    configFieldId: string;
    index: number;
    locator: ILocator;
}
