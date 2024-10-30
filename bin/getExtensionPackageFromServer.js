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

const request = require('request-promise-native');
const getReactorHeaders = require('./getReactorHeaders');
const handleResponseError = require('./handleResponseError');
const logVerboseHeader = require('./logVerboseHeader');

module.exports = async (
  envConfig,
  accessToken,
  extensionPackageManifest,
  verbose
) => {
  const options = {
    method: 'GET',
    url: `${envConfig.extensionPackages}`,
    qs: {
      'page[size]': 1,
      'page[number]': 1,
      'filter[name]': `EQ ${extensionPackageManifest.name}`,
      'filter[platform]': `EQ ${extensionPackageManifest.platform}`,
      'filter[availability]': 'EQ development'
    },
    headers: getReactorHeaders(accessToken),
    transform: JSON.parse
  };

  if (verbose) {
    logVerboseHeader('Retrieving extension package from server');
  }

  let body;

  try {
    body = await request(options);
  } catch (error) {
    handleResponseError(
      error,
      'Error detecting whether extension package exists on server.'
    );
  }

  return body.data.length ? body.data[0] : null;
};
