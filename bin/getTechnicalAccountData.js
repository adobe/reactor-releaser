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

const inquirer = require('inquirer');

module.exports = async (
  envConfig,
  { privateKey, orgId, techAccountId, apiKey, clientSecret }
) => {
  privateKey = privateKey || process.env[envConfig.privateKeyEnvVar];
  clientSecret = clientSecret || process.env[envConfig.clientSecretEnvVar];

  if (!privateKey) {
    ({ privateKey } = await inquirer.prompt([
      {
        type: 'input',
        name: 'privateKey',
        message: 'What is the path (relative or absolute) to your private key?',
        validate: Boolean
      }
    ]));
  }

  if (!orgId) {
    ({ orgId } = await inquirer.prompt([
      {
        type: 'input',
        name: 'orgId',
        message: 'What is your organization ID?',
        validate: Boolean
      }
    ]));
  }

  if (!techAccountId) {
    ({ techAccountId } = await inquirer.prompt([
      {
        type: 'input',
        name: 'techAccountId',
        message: 'What is your technical account ID?',
        validate: Boolean
      }
    ]));
  }

  if (!apiKey) {
    ({ apiKey } = await inquirer.prompt([
      {
        type: 'input',
        name: 'apiKey',
        message: 'What is your API key?',
        validate: Boolean
      }
    ]));
  }

  if (!clientSecret) {
    ({ clientSecret } = await inquirer.prompt([
      {
        type: 'input',
        name: 'clientSecret',
        message: 'What is your client secret?',
        validate: Boolean
      }
    ]));
  }

  return {
    privateKey,
    orgId,
    techAccountId,
    apiKey,
    clientSecret
  };
};
