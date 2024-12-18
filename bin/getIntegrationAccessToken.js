/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/

/* eslint-disable global-require */
const inquirer = require('inquirer').default;
const getEnvironment = require('./getEnvironment');
const logVerboseHeader = require('./logVerboseHeader');
const getAuthToken = (...args) =>
  import('@adobe/auth-token').then(({ auth }) => auth(...args));
const promptValidators = require('./promptValidators');

const authSchemes = ['oauth-server-to-server'];
// as of January 11, 2024, we identified that 'read_organizations' and
// `additional_info.projectedProductContext` were the only scopes required to
// call the API endpoints for extension packages. However, the team identified that it's
// worth asking for these other expected scopes as well.
let scopes = [
  'AdobeID',
  'openid',
  'read_organizations',
  'additional_info.job_function',
  'additional_info.projectedProductContext',
  'additional_info.roles'
];

module.exports = async (envConfig, argv) => {
  const { auth: authConfig, verbose } = argv;
  let {
    scheme: authScheme,
    clientId,
    clientSecret,
    scope: userScopeOverride,
    accessToken
  } = authConfig;
  if (verbose) {
    logVerboseHeader(`authConfig was ${JSON.stringify(authConfig)}`);
  }
  accessToken = accessToken || process.env[envConfig.accessTokenEnvVar];
  if (typeof accessToken === 'string' && accessToken?.length) {
    if (verbose) {
      logVerboseHeader(`Using passed in auth.access-token override`);
    }
    return accessToken;
  }
  if (!authSchemes.includes(authScheme)) {
    throw new Error(
      `Unknown auth.scheme of "${authScheme}" provided. Must be one of
${authSchemes.join(',')}`
    );
  }

  clientId = authConfig.clientId || process.env[envConfig.clientIdEnvVar];
  if (!clientId) {
    ({ clientId } = await inquirer.prompt([
      {
        type: 'input',
        name: 'clientId',
        message: 'What is your clientId?',
        validate: promptValidators.stringValidator
      }
    ]));
  }

  clientSecret =
    authConfig.clientSecret || process.env[envConfig.clientSecretEnvVar];
  if (!clientSecret) {
    ({ clientSecret } = await inquirer.prompt([
      {
        type: 'input',
        name: 'clientSecret',
        message: 'What is your clientSecret?',
        validate: promptValidators.stringValidator
      }
    ]));
  }

  if (userScopeOverride?.length) {
    if (!Array.isArray(userScopeOverride)) {
      scopes = [userScopeOverride].filter((s) => s?.length > 0);
    }
    if (verbose) {
      logVerboseHeader('user has overridden default scope');
    }
  }

  if (scopes.length === 0) {
    throw new Error(
      'No scopes were provided. Please provide at least one scope.'
    );
  }
  const scopeStr = scopes.join(',');
  if (verbose) {
    logVerboseHeader(`Authenticating with scope: ${scopeStr}`);
  }

  try {
    const response = await getAuthToken({
      authScheme,
      clientId,
      clientSecret,
      scope: scopeStr,
      environment: getEnvironment(argv)
    });

    return response.access_token;
  } catch (e) {
    // an unexpected error
    if (!e.code || (verbose && 'request_failed' === e.code)) {
      throw e;
    }

    const errorMessage =
      e.message || 'An unknown authentication error occurred.';
    const isScopeError = 'invalid_scope' === e.code;

    // throw immediately if we've encountered any error that isn't a scope error
    if (!isScopeError) {
      let preAmble = 'Error retrieving your Access Token:';
      const message = `Error Message: ${errorMessage}`;
      const code = `Error Code: ${e.code}`;
      if ('request_failed' === e.code) {
        preAmble +=
          ' This is likely an error within @adobe/auth-token or the IMS token exchange service';
      }

      const preparedError = new Error([preAmble, message, code].join('\n'));
      preparedError.code = e.code;
      throw preparedError;
    }
  }
};
