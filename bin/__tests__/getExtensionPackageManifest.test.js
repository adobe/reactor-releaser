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

const path = require('path');
const getExtensionPackageManifest = require('../getExtensionPackageManifest');

describe('getExtensionPackageManifest', () => {
  const testDirName = path.resolve(__dirname);
  let processCwdSpy;

  beforeEach(() => {
    processCwdSpy = jest.spyOn(process, 'cwd').mockReturnValue(testDirName);
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('throws error for extension package zip without extension.json', async () => {
    let errorMessage;

    try {
      getExtensionPackageManifest();
    } catch (error) {
      errorMessage = error.message;
    }

    expect(errorMessage).toBe(
      'Cannot find the extension manifest. Make sure you execute the \
command from inside the extension directory that you want to release.'
    );
    expect(processCwdSpy).toHaveBeenCalled();
  });
});
