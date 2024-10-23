# Adobe Experience Platform Tags Extension Releaser Tool

[![Build Status](https://travis-ci.com/adobe/reactor-releaser.svg?branch=master)](https://travis-ci.com/adobe/reactor-releaser)
[![npm (scoped)](https://img.shields.io/npm/v/@adobe/reactor-releaser.svg?style=flat)](https://www.npmjs.com/package/@adobe/reactor-releaser)

Adobe Experience Platform Tags is a next-generation tag management solution enabling simplified deployment of marketing technologies. For more information regarding Tags, please visit our [product website](http://www.adobe.com/enterprise/cloud-platform/launch.html).

The releaser tool allows extension developers to easily change the availability of their Tags extension. It can be used to change the availability from `development` to `private`.

For more information about developing an extension for Tags, please visit our [extension development guide](https://experienceleague.adobe.com/docs/experience-platform/tags/extension-dev/overview.html).

> [!WARNING]  
> The releaser tool now uses Adobe's [Oauth Server-to-Server credential format](https://experienceleague.adobe.com/en/docs/experience-cloud-kcs/kbarticles/ka-22080) by default.
>
> Legacy support for `jwt-auth` credentials will end completely by Adobe in January 2025. You may download and run the [legacy version of the releaser here](https://github.com/adobe/reactor-releaser/releases/tag/legacy-jwt-releaser-v3.1.3).

## Usage

Before running the releaser tool, you must first have [Node.js](https://nodejs.org/en/) installed on your computer.

You will need to be authorized to release extensions in Tags. This is done by first creating an integration through Adobe I/O. Please see the [Access Tokens documentation](https://experienceleague.adobe.com/docs/experience-platform/landing/platform-apis/api-authentication.html) for detailed steps on creating an integration and procuring extension management rights.

Once you've been granted extension management rights, you can use the releaser tool in either a question-answer format or by passing information through command line arguments.

### Question-Answer Format

To use the releaser in a question-answer format, run the releaser tool by executing the following command from the command line within the directory containing your extension source files:

```
npx @adobe/reactor-releaser
```

The releaser tool will ask for any information necessary to release the extension. Run the command from the directory containing your `extension.json` file.

### Command Line Arguments

To skip any of the questions the releaser would typically ask, you can pass the respective information as command line arguments. An example is as follows:

```
npx @adobe/reactor-releaser --auth.client-id=abcdefghijklmnopqrstuvwxyz12345 --auth.client-secret=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

The named parameters are as follows:

##### --auth.client-id (for authentication using an Adobe I/O integration)

Your Client ID. You can find this on the overview screen for the integration you have created within the [Adobe I/O console](https://console.adobe.io).

Client ID can also be provided by setting an environment variable. The environment variable should be named one of the following, depending on which Experience Platform Tags environment will be receiving the extension package:

* `REACTOR_IO_INTEGRATION_CLIENT_ID_DEVELOPMENT`
* `REACTOR_IO_INTEGRATION_CLIENT_ID_STAGE`
* `REACTOR_IO_INTEGRATION_CLIENT_ID` (this is the default, and is used for production environment)

##### --auth.client-secret (for authentication using an Adobe I/O integration)

Your Client Secret. You can find this on the overview screen for the integration you have created within the [Adobe I/O console](https://console.adobe.io).

Client Secret can also be provided by setting an environment variable. The environment variable should be named one of the following, depending on which Experience Platform Tags environment will be receiving the extension package:

* `REACTOR_IO_INTEGRATION_CLIENT_SECRET_DEVELOPMENT`
* `REACTOR_IO_INTEGRATION_CLIENT_SECRET_STAGE`
* `REACTOR_IO_INTEGRATION_CLIENT_SECRET` (this is the default, and is used for production environment)

##### --confirm-package-release

Used to skip the confirmation question to release the extension package to private. This is useful for CI/CD environments.

##### --environment (for Adobe internal use only)

The environment to which the extension package should be uploaded. Valid options are `development`, `stage`, `production`. Users outside of Adobe don't need to use this flag.

##### -- auth.scope (for authentication using an Adobe I/O integration)

The scopes to bind to the Access Token that is returned. Sane defaults are provided on your behalf within this repository, but you may override them if it is necessary.

##### --auth.scheme (for authentication using an Adobe I/O integration)

The type of authentication method when calling Adobe IO. This defaults to `oauth-server-to-server` and is used in conjunction with your Client ID & Client Secret.

##### --auth.access-token

Bypass the call to gain an Access Token if you already have the ability to supply it to the command line or through an environment variable. This is useful if you are running this tool in a CI/CD environment.
We highly encourage only using an environment variable within a CI/CD environment, as it is more secure than passing it through the command line.

The environment variable should be named one of the following, depending on which Experience Platform Tags environment will be receiving the extension package:

* `REACTOR_IO_INTEGRATION_ACCESS_TOKEN_DEVELOPMENT`
* `REACTOR_IO_INTEGRATION_ACCESS_TOKEN_STAGE`
* `REACTOR_IO_INTEGRATION_ACCESS_TOKEN` (this is the default, and is used for production environment)

##### --verbose

Logs additional information useful for debugging.

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

Then, in a directory where you would like to use the releaser tool, run the following command:

```
npx @adobe/reactor-releaser
```

Npx will execute the releaser tool using your locally linked code rather than the code published on the public npm repository.

## Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
