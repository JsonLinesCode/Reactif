# TestFlight testers from Google Sheets

The iOS fastlane release can replace the external TestFlight tester list from a private Google Sheet after uploading a build.

Each sync exports current external testers, removes them from the app, then imports the emails from the sheet. Internal App Store Connect testers are not removed.

## Google Sheet format

Create a sheet with one email per row:

```csv
jane@example.com
john@example.com
```

For this email-only format, set `TESTFLIGHT_DEFAULT_GROUPS` to the TestFlight group where these testers should be added.

The importer also accepts a header row if you ever want one later:

```csv
email
jane@example.com
john@example.com
```

Optional columns:

- `first_name`
- `last_name`
- `groups`

If the `groups` column is missing or blank, set `TESTFLIGHT_DEFAULT_GROUPS` in GitHub Actions variables.

## Google Cloud setup

Use the existing Google Play service account if you want to keep one Google key for CI.

1. Open the Google Cloud project that owns `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`.
2. Enable `Google Sheets API` (`sheets.googleapis.com`).
3. Open the service account key JSON and copy the `client_email`.
4. Share the private Google Sheet with that `client_email`.
5. Give it `Viewer` access. `Editor` is not needed because CI only reads the sheet.

The workflow uses the OAuth scope:

```text
https://www.googleapis.com/auth/spreadsheets.readonly
```

`Google Drive API` is not needed for this implementation because it reads the sheet directly by spreadsheet id and A1 range.

## GitHub configuration

Required secrets:

- Secret `TESTFLIGHT_GOOGLE_SHEET_ID`
- Secret `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`

Recommended variables:

- Variable `TESTFLIGHT_GOOGLE_SHEET_RANGE`, defaults to `Testers!A:D`
- Variable `TESTFLIGHT_DEFAULT_GROUPS`, for example `Beta Testers`, required only if the sheet does not provide a `groups` value for every tester

`GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` can be raw JSON or base64-encoded JSON.

## Spreadsheet id and range

The spreadsheet id is the long id in the sheet URL:

```text
https://docs.google.com/spreadsheets/d/<spreadsheet-id>/edit
```

The range must use A1 notation. Examples:

```text
Testers!A:D
Beta Testers!A:D
Sheet1!A1:D500
```

## Manual sync

To import testers without uploading a new build:

```bash
P8_FILE_PATH=./AuthKey.p8 \
P8_KEY_ID=... \
P8_ISSUER_ID=... \
TESTFLIGHT_GOOGLE_SHEET_ID="<spreadsheet-id>" \
TESTFLIGHT_GOOGLE_SHEET_RANGE="Testers!A:D" \
TESTFLIGHT_GOOGLE_SERVICE_ACCOUNT_JSON_PATH="./.ci/keys/google-service-account.json" \
TESTFLIGHT_DEFAULT_GROUPS="Beta Testers" \
fastlane ios sync_testflight_testers
```
