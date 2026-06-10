fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## iOS

### ios testflight_release

```sh
[bundle exec] fastlane ios testflight_release
```

Create or sync App Store signing assets, upload to TestFlight, and update App Store metadata without submitting

----


## Android

### android internal_release

```sh
[bundle exec] fastlane android internal_release
```

Upload Android AAB to Google Play Internal track with changelog metadata

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
