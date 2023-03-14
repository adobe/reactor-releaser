#!/usr/bin/env node

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

/* eslint-disable-next-line header/header */
const argv = require('yargs')
  .usage('Usage: $0 [options]')
  .options({
    'private-key': {
      type: 'string',
      describe:
        'For authentication using an Adobe I/O integration. The local path (relative or absolute) to the RSA private key. Instructions on how to generate this key can be found in the Getting Started guide (https://developer.adobelaunch.com/guides/extensions/getting-started/) and should have been used when creating your integration through the Adobe I/O console. Optionally, rather than passing the private key path as a command line argument, it can instead be provided by setting one of the following environment variables, depending on the environment that will be receiving the extension package: REACTOR_IO_INTEGRATION_PRIVATE_KEY_DEVELOPMENT, REACTOR_IO_INTEGRATION_PRIVATE_KEY_QE, REACTOR_IO_INTEGRATION_PRIVATE_KEY_STAGE, REACTOR_IO_INTEGRATION_PRIVATE_KEY. REACTOR_IO_INTEGRATION_PRIVATE_KEY_QE is deprecated in favor of REACTOR_IO_INTEGRATION_PRIVATE_KEY_STAGE and will be removed in the future.'
    },
    'org-id': {
      type: 'string',
      describe:
        'For authentication using an Adobe I/O integration. Your organization ID. You can find this on the overview screen for the integration you have created within the Adobe I/O console (https://console.adobe.io).'
    },
    'tech-account-id': {
      type: 'string',
      describe:
        'For authentication using an Adobe I/O integration. Your technical account ID. You can find this on the overview screen for the integration you have created within the Adobe I/O console (https://console.adobe.io).'
    },
    'api-key': {
      type: 'string',
      describe:
        'For authentication using an Adobe I/O integration. Your API key. You can find this on the overview screen for the integration you have created within the Adobe I/O console (https://console.adobe.io).'
    },
    'client-secret': {
      type: 'string',
      describe:
        'For authentication using an Adobe I/O integration. Your client secret. You can find this on the overview screen for the integration you have created within the Adobe I/O console (https://console.adobe.io). Optionally, rather than passing the client secret as a command line argument, it can instead be provided by setting one of the following environment variables, depending on the environment that will be receiving the extension package:  REACTOR_IO_INTEGRATION_CLIENT_SECRET_DEVELOPMENT, REACTOR_IO_INTEGRATION_CLIENT_SECRET_QE, REACTOR_IO_INTEGRATION_CLIENT_SECRET_STAGE, REACTOR_IO_INTEGRATION_CLIENT_SECRET. REACTOR_IO_INTEGRATION_CLIENT_SECRET_QE is deprecated in favor of REACTOR_IO_INTEGRATION_CLIENT_SECRET_STAGE and will be removed in the future.'
    },
    environment: {
      type: 'string',
      describe:
        'The environment to which the extension package \
        should be released (for Adobe internal use only).',
      choices: ['stage', 'qe', 'integration']
    },
    verbose: {
      type: 'boolean',
      describe: 'Logs additional information useful for debugging.'
    },
    'confirm-package-release': {
      type: 'boolean',
      describe:
        'Skips the confirmation that the extension is the one you wish to release.'
    }
  })
  .epilogue(
    'For more information, see https://www.npmjs.com/package/@adobe/reactor-releaser.'
  ).argv;

const chalk = require('chalk');
const getEnvironment = require('./getEnvironment');
const getIntegrationAccessToken = require('./getIntegrationAccessToken');
const getExtensionPackageManifest = require('./getExtensionPackageManifest');
const getExtensionPackageFromServer = require('./getExtensionPackageFromServer');
const envConfig = require('./envConfig');
const changeAvailability = require('./changeAvailability');
const getTechnicalAccountData = require('./getTechnicalAccountData');

(async () => {
  try {
    if (argv.verbose) {
      require('request-debug')(require('request-promise-native'), function (
        type,
        data,
        r
      ) {
        const filteredData = { ...data };
        if (filteredData.headers && filteredData.headers.Authorization) {
          filteredData.headers.Authorization = 'Bearer [USER_ACCESS_TOKEN]';
        }
        console.error({ [type]: filteredData });
        return r;
      });
    }

    const environment = getEnvironment(argv);
    if (environment === 'qe') {
      console.log(
        chalk.bold.red(
          "'--environment=qe' is currently redirecting to '--environment=stage' on your behalf, " +
            'and will be removed in the future.'
        )
      );
      console.log(chalk.bold.red("Prefer usage of '--environment=stage'."));
    }
    const envSpecificConfig = envConfig[environment];
    const technicalAccountData = await getTechnicalAccountData(
      envSpecificConfig,
      argv
    );
    const integrationAccessToken = await getIntegrationAccessToken(
      envSpecificConfig,
      technicalAccountData
    );
    const extensionPackageManifest = getExtensionPackageManifest();
    const extensionPackageFromServer = await getExtensionPackageFromServer(
      envSpecificConfig,
      integrationAccessToken,
      extensionPackageManifest,
      technicalAccountData,
      argv.verbose
    );

    await changeAvailability(
      envSpecificConfig,
      integrationAccessToken,
      extensionPackageFromServer,
      extensionPackageManifest,
      technicalAccountData,
      argv.verbose,
      argv['confirm-package-release']
    );
  } catch (error) {
    if (argv.verbose || !error.code) {
      throw error;
    }

    console.log(chalk.bold.red(error.message));
    console.log(chalk.bold.red('run in --verbose mode for full stack trace'));
    process.exitCode = 1;
  }
})();
