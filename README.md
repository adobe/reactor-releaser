# Launch Extension Releaser Tool

[![Build Status](https://travis-ci.com/adobe/reactor-releaser.svg?branch=master)](https://travis-ci.com/adobe/reactor-releaser)

Launch, by Adobe, is a next-generation tag management solution enabling simplified deployment of marketing technologies. For more information regarding Launch, please visit our [product website](http://www.adobe.com/enterprise/cloud-platform/launch.html).

The releaser tool allows extension developers to easily change the availability of their Launch extension. It can be used to change the availability from `development` to `private`.

For more information about developing an extension for Launch, please visit our [extension development guide](https://developer.adobelaunch.com/extensions/).

## Usage

Before running the releaser tool, you must first have [Node.js](https://nodejs.org/en/) installed on your computer. Your npm version (npm comes bundled with Node.js) will need to be at least 5.2.0. You can check the installed version by running the following command from a command line:

```
npm -v
```

You will need to be authorized to release extensions in Launch. This is done by first creating an integration through Adobe I/O. Please see the [Access Tokens documentation](https://developer.adobelaunch.com/api/guides/access_tokens/) for detailed steps on creating an integration and procuring extension management rights.

Once you've been granted extension management rights, you can use the releaser tool in either a question-answer format or by passing information through command line arguments.

### Question-Answer Format

To use the releaser in a question-answer format, run the releaser tool by executing the following command from the command line within the directory containing your extension source files:

```
npx @adobe/reactor-releaser
```

The releaser tool will ask for any information necessary to release the extension.

### Command Line Arguments

To skip any of the questions the releaser would typically ask, you can pass the respective information as command line arguments. An example is as follows:

```
npx @adobe/reactor-releaser --private-key=/Users/jane/launchkeys/reactor_integration_private.key --org-id=01C20D883A7D42080A494212@AdobeOrg --tech-account-id=14A533A72B181CF90A44410D@techacct.adobe.com --api-key=192ce541b1144160941a83vb74e0e74d --client-secret=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

The named parameters are as follows:

##### --private-key (for authentication using an Adobe I/O integration)

The local path (relative or absolute) to the RSA private key. Instructions on how to generate this key can be found in the [Access Tokens documentation](https://developer.adobelaunch.com/api/guides/access_tokens/) and should have been used when creating your integration through the Adobe I/O console.

Optionally, rather than passing the private key path as a command line argument, it can instead be provided by setting an environment variable. The environment variable should be named `REACTOR_UPLOADER_PRIVATE_KEY`.

##### --org-id (for authentication using an Adobe I/O integration)

Your organization ID. You can find this on the overview screen for the integration you have created within the [Adobe I/O console](https://console.adobe.io).

##### --tech-account-id (for authentication using an Adobe I/O integration)

Your technical account ID. You can find this on the overview screen for the integration you have created within the [Adobe I/O console](https://console.adobe.io).

##### --api-key (for authentication using an Adobe I/O integration)

Your API key. You can find this on the overview screen for the integration you have created within the [Adobe I/O console](https://console.adobe.io).

##### --client-secret (for authentication using an Adobe I/O integration)

Your client secret. You can find this on the overview screen for the integration you have created within the [Adobe I/O console](https://console.adobe.io).

Optionally, rather than passing the client secret as a command line argument, it can instead be provided by setting an environment variable. The environment variable should be named `REACTOR_UPLOADER_CLIENT_SECRET`.

##### --verbose

Logs additional information useful for debugging.

##### --environment (for Adobe internal use only)

The environment to which the extension package should be uploaded. Valid options are `development`, `qe`, `integration`. Users outside of Adobe don't need to use this flag.

Private key path can also be provided by setting an environment variable. The environment variable should be named one of the following, depending on which Launch environment will be receiving the extension package:

* `REACTOR_UPLOADER_PRIVATE_KEY_DEVELOPMENT`
* `REACTOR_UPLOADER_PRIVATE_KEY_QE`
* `REACTOR_UPLOADER_PRIVATE_KEY_INTEGRATION`

Client secret can also be provided by setting an environment variable. The environment variable should be named one of the following, depending on which Launch environment will be receiving the extension package:

* `REACTOR_UPLOADER_CLIENT_SECRET_DEVELOPMENT`
* `REACTOR_UPLOADER_CLIENT_SECRET_QE`
* `REACTOR_UPLOADER_CLIENT_SECRET_INTEGRATION`

## Contributing

Contributions are welcomed! Read the [Contributing Guide](CONTRIBUTING.md) for more information.

To get started:

1. Install [node.js](https://nodejs.org/).
3. Clone the repository.
4. After navigating into the project directory, install project dependencies by running `npm install`.

To manually test your changes, first run the following command from the releaser tool directory:

```
npm link
```

Then, in a directory where you would like to use the uploader tool, run the following command:

```
npx @adobe/reactor-releaser
```

Npx will execute the releaser tool using your locally linked code rather than the code published on the public npm repository.

## Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
