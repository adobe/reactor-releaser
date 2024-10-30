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

const path = require('path');

module.exports = () => {
  try {
    return require(path.resolve(process.cwd(), './extension.json'));
  } catch (e) {
    console.log(e.message);
    throw new Error(
      'Cannot find the extension manifest. Make sure you execute the \
command from inside the extension directory that you want to release.'
    );
  }
};
