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

const expectedTechnicalAccountData = (o = {}) =>
  Object.assign(
    {
      apiKey: 'MyApiKey',
      clientSecret: 'MyClientSecret',
      techAccountId: 'MyTechAccountId',
      orgId: 'MyOrgId',
      privateKey: 'MyPrivateKey'
    },
    o
  );

describe('getTechnicalAccountData', () => {
  let getTechnicalAccountData;
  let mockInquirer;

  beforeEach(() => {
    process.env.TEST_PRIVATE_KEY = 'MyPrivateKey';
    process.env.TEST_CLIENT_SECRET = 'MyClientSecret';
    mockInquirer = {
      prompt: jasmine.createSpy()
    };

    getTechnicalAccountData = proxyquire('../getTechnicalAccountData', {
      inquirer: mockInquirer
    });

    spyOn(console, 'log');
  });

  afterEach(() => {
    delete process.env.TEST_PRIVATE_KEY;
    delete process.env.TEST_CLIENT_SECRET;
  });

  it('prompts for data', async () => {
    mockInquirer.prompt.and.callFake((prompts) => {
      switch (prompts[0].name) {
        case 'authMethod':
          return { authMethod: 'integration' };
        case 'privateKey':
          return { privateKey: 'MyPrivateKey' };
        case 'orgId':
          return { orgId: 'MyOrgId' };
        case 'techAccountId':
          return { techAccountId: 'MyTechAccountId' };
        case 'apiKey':
          return { apiKey: 'MyApiKey' };
        case 'clientSecret':
          return { clientSecret: 'MyClientSecret' };
      }
    });

    const technicalAccountData = await getTechnicalAccountData(
      {
        scope: 'https://scope.com/s/'
      },
      {}
    );

    expect(technicalAccountData).toEqual(expectedTechnicalAccountData());
  });

  it('uses data from arguments', async () => {
    const technicalAccountData = await getTechnicalAccountData(
      {
        scope: 'https://scope.com/s/'
      },
      {
        privateKey: 'MyPrivateKey',
        orgId: 'MyOrgId',
        techAccountId: 'MyTechAccountId',
        apiKey: 'MyApiKey',
        clientSecret: 'MyClientSecret'
      }
    );

    expect(mockInquirer.prompt).not.toHaveBeenCalled();
    expect(technicalAccountData).toEqual(expectedTechnicalAccountData());
  });

  it('uses environment variables if respective arguments do not exist', async () => {
    const technicalAccountData = await getTechnicalAccountData(
      {
        scope: 'https://scope.com/s/',
        privateKeyEnvVar: 'TEST_PRIVATE_KEY',
        clientSecretEnvVar: 'TEST_CLIENT_SECRET'
      },
      {
        orgId: 'MyOrgId',
        techAccountId: 'MyTechAccountId',
        apiKey: 'MyApiKey'
      }
    );

    expect(mockInquirer.prompt).not.toHaveBeenCalled();
    expect(technicalAccountData).toEqual(expectedTechnicalAccountData());
  });
});
