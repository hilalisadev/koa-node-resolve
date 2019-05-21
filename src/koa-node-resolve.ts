/**
 * @license
 * Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
import * as Koa from 'koa';
import {resolve as resolvePath} from 'path';
import {parse as parseURL} from 'url';

import {moduleSpecifierTransform, ModuleSpecifierTransformOptions} from './koa-module-specifier-transform';
import {noLeadingSlash} from './support/path-utils';
import {resolveNodeSpecifier} from './support/resolve-node-specifier';

/**
 * @param root The on-disk directory that maps to the served root URL, used to
 *     resolve module specifiers in filesystem.  In most cases this should match
 *     the root directory configured in your downstream static file server
 *     middleware.
 */
export const nodeResolve =
    (root: string = '.', options: ModuleSpecifierTransformOptions = {}):
        Koa.Middleware => moduleSpecifierTransform(
        (baseURL: string, specifier: string) => resolveNodeSpecifier(
            resolvePath(
                resolvePath(root),
                noLeadingSlash(parseURL(baseURL).pathname || '/')),
            specifier),
        options);