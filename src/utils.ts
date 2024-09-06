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
import { IMessageToWorkshop } from "./types/messages";

/**
 * Sends a message to Workshop through the parent window
 */
export function sendMessageToWorkshop(message: IMessageToWorkshop) {
    window.parent.postMessage(JSON.stringify(message), "*");
}

/**
 * Detect whether app is in Dev Console in order to use default values 
 */
export function isInsideIframe(): boolean { 
    // TODO generalize this to all stacks
    const isIframedInDevConsole = window.self.location.origin !== "https://swirl-containers.palantirfoundry.com";

    // Need try/catch since browsers can block access to window.top due to same origin policy. IE bugs also take place.
    try {
        return window.self !== window.top || isIframedInDevConsole;
    } catch (e) {
        return true;
    }
}