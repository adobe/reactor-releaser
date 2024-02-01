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
const changeAvailability = require('../changeAvailability');

// Mocking modules for Jest
jest.mock('node-fetch');
jest.mock('../handleResponseError');
jest.mock('../logVerboseHeader');
jest.mock('inquirer', () => ({
  prompt: jest.fn().mockResolvedValue({ confirmPackageRelease: true })
}));

const fetch = require('node-fetch');
const mockHandleResponseError = require('../handleResponseError');
const inquirer = require('inquirer');

const extensionPackageFromServer = {
  attributes: { name: 'extension_name', version: '1.0.0' },
  id: 'EP123'
};

const extensionManifest = { name: 'fake-extension' };
const envConfig = { extensionPackages: 'https://extensionpackages.com' };
const token = 'generatedAccessToken';
let verbose;
let confirmPackageRelease;
let consoleSpy;

describe('changeAvailability', () => {
  beforeEach(() => {
    verbose = false;
    confirmPackageRelease = false;
    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        data: {
          id: 'EP123'
        }
      })
    });
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
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

      expect(fetch).toHaveBeenCalledWith(
        'https://extensionpackages.com/EP123',
        {
          method: 'PATCH',
          headers: {
            ...getReactorHeaders('generatedAccessToken')
          },
          body: expect.any(FormData)
        }
      );

      const formData = fetch.mock.calls[0][1].body;
      const formDataObject = JSON.parse(formData.get('data'));
      console.log(formDataObject.id);

      expect(formDataObject).toEqual(
        expect.objectContaining({
          id: 'EP123',
          type: 'extension_packages',
          meta: { action: 'release_private' }
        })
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        `The extension package with the ID ${chalk.bold(
          'EP123'
        )} has been released.`
      );
    });
  });

  describe('with mock Inquirer', () => {
    it('prompts for confirmation of package release', async () => {
      const technicalAccountData = await changeAvailability(
        envConfig,
        token,
        extensionPackageFromServer,
        extensionManifest,
        verbose,
        confirmPackageRelease
      );

      expect(inquirer.prompt).toHaveBeenCalledWith([
        {
          type: 'confirm',
          name: 'confirmPackageRelease',
          message:
            'An extension package with the name extension_name at version 1.0.0 ' +
            'with development availability was found on the server. Would you like ' +
            'to release this extension package to private availability?'
        }
      ]);
      expect(technicalAccountData).toEqual(true);
    });

    // ... (similarly update other test cases)

    it('calls handleResponseError on response error', async () => {
      const error = new Error();
      fetch.mockRejectedValue(error);

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
        expect.any(String)
      );
    });
  });
});
