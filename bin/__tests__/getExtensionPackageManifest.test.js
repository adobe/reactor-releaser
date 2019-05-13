/***************************************************************************************
 * (c) 2019 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/

const proxyquire = require('proxyquire').noCallThru();
const path = require('path');

describe('getExtensionPackageManifest', () => {
  it('returns extension manifest from the current folder', async () => {
    const getExtensionPackageManifest = proxyquire(
      '../getExtensionPackageManifest',
      {
        [path.resolve(process.cwd(), './extension.json')]: {
          name: 'extensionname'
        }
      }
    );

    expect(getExtensionPackageManifest().name).toBe('extensionname');
  });

  it('throws error for extension package zip without extension.json', async () => {
    let errorMessage;

    try {
      require('../getExtensionPackageManifest')();
    } catch (error) {
      errorMessage = error.message;
    }

    expect(errorMessage).toBe(
      'Cannot find the extension manifest. Make sure you execute the \
command from inside the extension directory that you want to release.'
    );
  });
});
