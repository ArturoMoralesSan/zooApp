# DurangoZooApp

Interactive institution AR educational platform for Durango Zoológico Sahuatoba.

## TODO

- [x] Basic setup instructions
- [ ] iOS setup and usage
- [ ] Localized documentation
- [ ] Improved writing and refined docs

## Development

There are some prerequisites that need to be fulfilled before starting developing the project. The installation process may vary depending on your operating system and mobile device's operating system.

Copy and paste the following in your terminal to install Volta:

bash

# Linux

curl "https://get.volta.sh" | bash

# Windows

winget install Volta.Volta

This is used to manage multiple versions of both NodeJS and NPM. Since the expo CLI does not work properly yet on NPM 12, the 11th version is pinned for this project.

You can find further instructions [here][1].

A JDK 17 installation is also needed for generating local development builds. On Linux you can use sdkman.

bash

# Install sdkman

curl -s "https://get.sdkman.io" | bash

# Install the required JDK

sdk install java 17.0.20-tem

On windows go to the [Temurin JDK webpage][3] and download the corresponding JDK for your system.

### Android

Install Android Studio, the Android SDK Build-Tools, and the Android SDK Platform-Tools v36. Then add the the ANDROID_HOME environment variable and platform tools to the path.

Lastly, check if your device is being recognized by your computer with `adb devices`. Enable the developer options in your device before executing this command.

More information [here][4].

### Start the project

To start the project execute the following commands.

bash

# Generate the prebuild

npx expo prebuild --clean

# Run the project

npx expo run:android

[1]: https://docs.volta.sh/guide/getting-started 'Getting started, Volta.'
[2]: https://sdkman.io/ 'sdkman.'
[3]: https://adoptium.net/temurin/releases/?version=11&os=windows&arch=any 'Temurin JDK'
[4]: https://docs.expo.dev/get-started/set-up-your-environment/?mode=development-build&buildEnv=local 'Expo - Set up your environment'
