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

const chalk = require('chalk');
const getReactorHeaders = require('../getReactorHeaders');

const extensionPackageFromServer = {
  attributes: { name: 'extension_name', version: '1.0.0' },
  id: 'EP123'
};

const extensionManifest = { name: 'fake-extension' };
const envConfig = { extensionPackages: 'https://extensionpackages.com' };
const token = 'generatedAccessToken';
let verbose;
let confirmPackageRelease;

describe('changeAvailability', () => {
  let mockFetch;
  let mockHandleResponseError;
  let mockLogVerboseHeader;
  let changeAvailability;
  let consoleSpy;

  beforeEach(() => {
    mockFetch = jest.fn();
    mockFetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        data: {
          id: 'EP123'
        }
      })
    });
    jest.mock('../fetchWrapper', () => ({
      fetch: mockFetch
    }));
    jest.mock('../logVerboseHeader', () => jest.fn());
    mockHandleResponseError = jest.fn().mockImplementation(() => {
      throw new Error();
    });
    jest.mock('../handleResponseError', () => mockHandleResponseError);
    consoleSpy = jest.spyOn(console, 'log');
    jest.resetModules();
    verbose = false;
    confirmPackageRelease = false;
    changeAvailability = require('../changeAvailability');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('without mock Inquirer', () => {
    it('can release silently', async () => {
      confirmPackageRelease = true;
      await changeAvailability(
        envConfig,
        token,
        extensionPackageFromServer,
        extensionManifest,
        verbose,
        confirmPackageRelease
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'https://extensionpackages.com/EP123',
        {
          method: 'PATCH',
          body: expect.anything(),
          // body: {
          //   data: {
          //     id: 'EP123',
          //     type: 'extension_packages',
          //     meta: { action: 'release_private' }
          //   }
          // },
          headers: getReactorHeaders('generatedAccessToken')
        }
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          `The extension package with the ID ${chalk.bold(
            'EP123'
          )} has been released.`
        )
      );
    });
  });

  describe('with mock Inquirer', () => {
    let mockInquirer;

    beforeEach(() => {
      mockInquirer = jest.fn().mockReturnValue({ confirmPackageRelease: true });
      jest.mock('inquirer', () => mockInquirer);
      jest.resetModules();
    });

    it('prompts for confirmation of package release', async () => {
      const result = await changeAvailability(
        envConfig,
        token,
        extensionPackageFromServer,
        extensionManifest,
        verbose,
        confirmPackageRelease
      );

      expect(mockInquirer.prompt).toHaveBeenCalledWith([
        {
          type: 'confirm',
          name: 'confirmPackageRelease',
          message:
            'An extension package with the name extension_name at version 1.0.0 ' +
            'with development availability was found on the server. Would you like ' +
            'to release this extension package to private availability?'
        }
      ]);
      expect(result).toBe(true);
    });

    it('returns false when the user does not confirm the package details', async () => {
      mockInquirer.prompt.mockReturnValueOnce({ confirmPackageRelease: false });

      const result = await changeAvailability(
        envConfig,
        token,
        extensionPackageFromServer,
        extensionManifest,
        verbose,
        confirmPackageRelease
      );

      expect(result).toBe(false);
    });

    it('logs an error when no package that can be released is found on server', async () => {
      await changeAvailability(
        envConfig,
        token,
        null,
        extensionManifest,
        false
      );

      expect(console.log).toHaveBeenCalledWith(
        `No extension package was found on the server with the name ${chalk.bold(
          'fake-extension'
        )} and development availability.`
      );
    });

    it('logs additional detail in verbose mode', async () => {
      verbose = true;
      await changeAvailability(
        envConfig,
        token,
        extensionPackageFromServer,
        extensionManifest,
        verbose,
        confirmPackageRelease
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
          verbose,
          confirmPackageRelease
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
        verbose,
        confirmPackageRelease
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
});
