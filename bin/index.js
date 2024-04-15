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
    'auth.scheme': {
      type: 'string',
      description: 'The method to obtain an access token',
      choices: ['oauth-server-to-server'],
      default: 'oauth-server-to-server'
    },
    'auth.client-id': {
      type: 'string',
      description:
        'For authentication using an Adobe I/O integration. Your Client ID. You can find this on the overview screen for the integration you have created within the Adobe I/O console (https://console.adobe.io). Optionally, rather than passing the Client ID as a command line argument, it can instead be provided by setting one of the following environment variables, depending on the environment that will be receiving the extension package: REACTOR_IO_INTEGRATION_CLIENT_ID_DEVELOPMENT, REACTOR_IO_INTEGRATION_CLIENT_ID_STAGE, REACTOR_IO_INTEGRATION_CLIENT_ID'
    },
    'auth.client-secret': {
      type: 'string',
      description:
        'For authentication using an Adobe I/O integration. Your Client Secret. You can find this on the overview screen for the integration you have created within the Adobe I/O console (https://console.adobe.io). Optionally, rather than passing the Client Secret as a command line argument, it can instead be provided by setting one of the following environment variables, depending on the environment that will be receiving the extension package: REACTOR_IO_INTEGRATION_CLIENT_SECRET_DEVELOPMENT, REACTOR_IO_INTEGRATION_CLIENT_SECRET_STAGE, REACTOR_IO_INTEGRATION_CLIENT_SECRET'
    },
    'auth.scope': {
      type: 'string',
      description:
        'a comma-separated list of override scopes to request (e.g. openid,AdobeID,' +
        'read_organizations,....)'
    },
    'auth.access-token': {
      type: 'string',
      describe:
        'An access token to use, as supplied by an environment variable or other means. Replaces ' +
        'the need to supply client-id, client-secret, and scope.'
    },
    environment: {
      type: 'string',
      describe:
        'The environment to which the extension package should be uploaded.',
      choices: ['development', 'stage', 'production'],
      default: 'production'
    },
    verbose: {
      type: 'boolean',
      describe: 'Logs additional information useful for debugging.',
      validate: true
    },
    'confirm-package-release': {
      type: 'boolean',
      describe:
        'Skips the confirmation that the extension is the one you wish to release.',
      validate: true
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

(async () => {
  try {
    const environment = getEnvironment(argv);
    const envSpecificConfig = envConfig[environment];
    const integrationAccessToken = await getIntegrationAccessToken(
      envSpecificConfig,
      argv
    );
    const extensionPackageManifest = getExtensionPackageManifest();
    const extensionPackageFromServer = await getExtensionPackageFromServer(
      envSpecificConfig,
      integrationAccessToken,
      extensionPackageManifest,
      argv
    );

    await changeAvailability(
      envSpecificConfig,
      integrationAccessToken,
      extensionPackageFromServer,
      extensionPackageManifest,
      argv.verbose,
      argv.confirmPackageRelease
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
