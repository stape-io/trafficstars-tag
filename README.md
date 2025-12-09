# Trafficstars Tag for GTM Server-Side

This server-side tag allows you to track Trafficstars conversions via server-to-server (S2S) postbacks and handle Click ID storage directly from your Google Tag Manager Server container.

## Features

- **Event Support**: Handles **Page View** (for storing Click IDs) and **Conversion** (for tracking goals).
- **Cookie Management**: Automatically extracts the Click ID from the URL during a Page View and stores it as a first-party cookie.
- **Optimistic Scenario**: Option to trigger `gtmOnSuccess()` immediately without waiting for the API response.
- **BigQuery Logging**: Native support for streaming request and response data to BigQuery.

## Configuration

### 1. Event Type

- **Page View**: Fires when a user reaches the landing page to store the Click ID.
- **Conversion**: Fires when the user completes one of your defined Goals.

### 2. General Settings

- **Use Optimistic Scenario**: Check to fire the tag success trigger regardless of the actual API result.
- **Ad Storage Consent**: Choose "Send data in case marketing consent given" to abort execution if `ad_storage` is not granted.

### 3. Logging

- **Logs Settings**: Options to log to console "Always", "Never", or during "Debug and preview".
- **BigQuery Logs**: Enable to log full event data to a BigQuery table.
  - **Project ID**: Defaults to `GOOGLE_CLOUD_PROJECT` environment variable if empty.
  - **Dataset ID**: Required.
  - **Table ID**: Required.

## Permissions

This template requires the following permissions:

- **Send HTTP Requests**: Grants access to ``.
- **Set Cookies**: To store the Click ID.
- **Access BigQuery**: Requires `write` access if BigQuery logging is enabled.
- **Access to Global Variables**: Reads event data, container version, and request headers.
