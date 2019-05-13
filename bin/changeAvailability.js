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
const request = require('request-promise-native');
const inquirer = require('inquirer');
const getReactorHeaders = require('./getReactorHeaders');
const handleResponseError = require('./handleResponseError');
const logVerboseHeader = require('./logVerboseHeader');

module.exports = async (
  envConfig,
  accessToken,
  extensionPackageFromServer,
  extensionPackageManifest,
  { apiKey },
  verbose
) => {
  let confirmPackageRelease = false;

  if (extensionPackageFromServer) {
    ({ confirmPackageRelease } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmPackageRelease',
        message: `An extension package with the name \
${extensionPackageFromServer.attributes.name} at version \
${extensionPackageFromServer.attributes.version} with development \
availability was found on the server. Would you like to release \
this extension package to private availability?`
      }
    ]));
  } else {
    console.log(
      'No extension package was found ' +
        `on the server with the name ${chalk.bold(
          extensionPackageManifest.name
        )} and development availability.`
    );
  }

  if (!confirmPackageRelease) {
    return false;
  }

  if (verbose) {
    logVerboseHeader('Releasing package');
  }

  const options = {
    method: 'PATCH',
    url: `${envConfig.extensionPackages}/${extensionPackageFromServer.id}`,
    body: {
      data: {
        id: extensionPackageFromServer.id,
        type: 'extension_packages',
        meta: {
          action: 'release_private'
        }
      }
    },
    json: true,
    headers: getReactorHeaders(accessToken, apiKey),
    transform: body => body
  };

  try {
    const body = await request(options);
    const extensionPackageId = body.data.id;

    console.log(
      `The extension package with the ID ${chalk.bold(
        extensionPackageId
      )} has been released.`
    );
  } catch (error) {
    handleResponseError(error, 'Error releasing extension package.');
  }

  return true;
};
