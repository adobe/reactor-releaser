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
const fetchWrapper = require('./fetchWrapper');
const inquirer = require('inquirer');
const getReactorHeaders = require('./getReactorHeaders');
const handleResponseError = require('./handleResponseError');
const logVerboseHeader = require('./logVerboseHeader');

module.exports = async (
  envConfig,
  accessToken,
  extensionPackageFromServer,
  extensionPackageManifest,
  verbose,
  confirmPackageRelease = false
) => {
  if (extensionPackageFromServer) {
    if (!confirmPackageRelease) {
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
    }
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

  const url = `${envConfig.extensionPackages}/${extensionPackageFromServer.id}`;
  const formData = new FormData();
  formData.append('data', {
    id: extensionPackageFromServer.id,
    type: 'extension_packages',
    meta: {
      action: 'release_private'
    }
  });
  const options = {
    method: 'PATCH',
    headers: getReactorHeaders(accessToken),
    body: formData
  };

  try {
    const response = await fetchWrapper.fetch(url, options);
    const body = await response.json();
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
