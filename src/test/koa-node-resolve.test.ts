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
import {resolve as resolvePath} from 'path';
import request from 'supertest';
import test from 'tape';

import {nodeResolve} from '../koa-node-resolve';
import {createAndServe, squeeze} from './test-utils';

const fixturesPath = resolvePath(__dirname, '../../test/fixtures/');

test('transforms resolvable specifiers', async (t) => {
  t.plan(2);
  createAndServe(
      {
        middleware: [nodeResolve(fixturesPath)],
        routes: {
          '/my-module.js': `import * as x from 'x';`,
          '/my-page.html': `
            <script type="module">
            import * as x from 'x';
            </script>
          `,
        },
      },
      async (server) => {
        t.equal(
            squeeze((await request(server).get('/my-module.js')).text),
            squeeze(`
              import * as x from "./node_modules/x/main.js";
            `),
            'should transform specifiers in JavaScript module');
        t.equal(
            squeeze((await request(server).get('/my-page.html')).text),
            squeeze(`
              <script type="module">
              import * as x from "./node_modules/x/main.js";
              </script>
            `),
            'should transform specifiers in inline module script');
      });
});

test('ignores unresolvable specifiers', async (t) => {
  t.plan(2);
  createAndServe(
      {
        middleware: [nodeResolve(fixturesPath)],
        routes: {
          '/my-module.js': `
            import * as wubbleFlurp from 'wubble-flurp';
          `,
          '/my-page.html': `
            <script type="module">
            import * as wubbleFlurp from 'wubble-flurp';
            </script>
          `,
        },
      },
      async (server) => {
        t.equal(
            squeeze((await request(server).get('/my-module.js')).text),
            squeeze(`
              import * as wubbleFlurp from 'wubble-flurp';
        `));
        t.equal(
            squeeze((await request(server).get('/my-page.html')).text),
            squeeze(`
              <script type="module">
              import * as wubbleFlurp from 'wubble-flurp';
              </script>
        `));
      });
});