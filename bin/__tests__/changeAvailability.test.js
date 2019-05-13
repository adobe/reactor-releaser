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

const proxyquire = require('proxyquire');
const chalk = require('chalk');
const getReactorHeaders = require('../getReactorHeaders');

const extensionPackageFromServer = {
  attributes: { name: 'extension name', version: '1.0.0' },
  id: 'EP123'
};

const extensionManifest = { name: 'fake-extension' };
const envConfig = { extensionPackages: 'https://extensionpackages.com' };
const token = 'generatedAccessToken';

describe('changeAvailability', () => {
  let mockRequest;
  let mockHandleResponseError;
  let mockLogVerboseHeader;
  let changeAvailability;
  let mockInquirer;

  beforeEach(() => {
    mockRequest = jasmine.createSpy().and.returnValue({
      data: {
        id: 'EP123'
      }
    });

    mockInquirer = {
      prompt: jasmine
        .createSpy()
        .and.returnValue({ confirmPackageRelease: true })
    };

    mockHandleResponseError = jasmine.createSpy().and.throwError();
    mockLogVerboseHeader = jasmine.createSpy();
    spyOn(console, 'log');

    changeAvailability = proxyquire('../changeAvailability', {
      'request-promise-native': mockRequest,
      './handleResponseError': mockHandleResponseError,
      './logVerboseHeader': mockLogVerboseHeader,
      inquirer: mockInquirer
    });
  });

  it('prompts for confirmation of package release', async () => {
    const technicalAccountData = await changeAvailability(
      envConfig,
      token,
      extensionPackageFromServer,
      extensionManifest,
      {},
      false
    );

    expect(technicalAccountData).toEqual(true);
  });

  it('returns false when the user does not confirm the package details', async () => {
    mockInquirer.prompt.and.returnValue({ confirmPackageRelease: false });

    const technicalAccountData = await changeAvailability(
      envConfig,
      token,
      extensionPackageFromServer,
      extensionManifest,
      {},
      false
    );

    expect(technicalAccountData).toEqual(false);
  });

  it('logs an error when no package that can be released is found on server', async () => {
    await changeAvailability(
      envConfig,
      token,
      null,
      extensionManifest,
      {},
      false
    );

    expect(console.log).toHaveBeenCalledWith(
      `No extension package was found on the server with the name ${chalk.bold(
        'fake-extension'
      )} and development availability.`
    );
  });

  it('logs additional detail in verbose mode', async () => {
    await changeAvailability(
      envConfig,
      token,
      extensionPackageFromServer,
      extensionManifest,
      {},
      true
    );

    expect(mockLogVerboseHeader).toHaveBeenCalledWith('Releasing package');
  });

  it('calls handleResponseError on response error', async () => {
    const error = new Error();
    mockRequest.and.throwError(error);

    try {
      await changeAvailability(
        envConfig,
        token,
        extensionPackageFromServer,
        extensionManifest,
        {},
        false
      );
    } catch (e) {}

    expect(mockHandleResponseError).toHaveBeenCalledWith(
      error,
      jasmine.any(String)
    );
  });

  it('releases an extension package', async () => {
    await changeAvailability(
      envConfig,
      token,
      extensionPackageFromServer,
      extensionManifest,
      { apiKey: 'apiKey' },
      false
    );

    expect(mockRequest).toHaveBeenCalledWith({
      method: 'PATCH',
      url: 'https://extensionpackages.com/EP123',
      body: {
        data: {
          id: 'EP123',
          type: 'extension_packages',
          meta: { action: 'release_private' }
        }
      },
      json: true,
      headers: getReactorHeaders('generatedAccessToken', 'apiKey'),
      transform: jasmine.any(Function)
    });

    expect(console.log).toHaveBeenCalledWith(
      `The extension package with the ID ${chalk.bold(
        'EP123'
      )} has been released.`
    );
  });
});
