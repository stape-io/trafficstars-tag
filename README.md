# Trafficstars Tag for GTM Server-Side

This server-side tag allows you to track Trafficstars conversions via server-to-server (S2S) postbacks and handle Click ID storage directly from your Google Tag Manager Server container.

## Features

- **Event Support**: Handles **Page View** (for storing Click IDs) and **Conversion** (for tracking goals).
- **Cookie Management**: Automatically extracts the Click ID from the URL during a Page View and stores it as a first-party cookie.
- **Advanced Reporting**: Supports sending optional parameters like Value, Price, and Lead Code.
- **Optimistic Scenario**: Option to trigger `gtmOnSuccess()` immediately without waiting for the API response.
- **BigQuery Logging**: Native support for streaming request and response data to BigQuery.

## Configuration

### 1. Event Type

- **Page View**: Fires when a user reaches the landing page to store the Click ID.
  - **Click ID Key**: The query parameter key for your `{click_id}` token (e.g., `starstracker`).
  - **Cookie Settings**: Define **Expiration** (days), **Domain**, and **HttpOnly** flag for the Click ID cookie.
- **Conversion**: Sends a postback to Trafficstars.
  - **Goal ID**: Found in the "Goals & Conversions" tab.
  - **Click ID**: The unique tracking ID (usually retrieved from the cookie set by the Page View event).
  - **API Key**: The `key` parameter found in your "Goals & Postbacks" tab.

### 2. Advanced Parameters (Conversion)

Use the table to map specific fields supported by the Trafficstars API:

- **Value**: Track earnings/revenue.
- **Price**: Track conversion cost.
- **Lead Code**: Track post-conversion events.
- **Allow Duplicates**: Set to a truthy value to allow multiple conversions for the same Click ID.

### 3. General Settings

- **Use Optimistic Scenario**: Check to fire the tag success trigger regardless of the actual API result.
- **Ad Storage Consent**: Choose "Send data in case marketing consent given" to abort execution if `ad_storage` is not granted.

### 4. Logging

- **Logs Settings**: Options to log to console "Always", "Never", or during "Debug and preview".
- **BigQuery Logs**: Enable to log full event data to a BigQuery table.
  - **Project ID**: Defaults to `GOOGLE_CLOUD_PROJECT` environment variable if empty.
  - **Dataset ID**: Required.
  - **Table ID**: Required.

## Permissions

This template requires the following permissions:

- **Send HTTP Requests**: Grants access to `https://tsyndicate.com/api/v1/cpa/action*`.
- **Set Cookies**: To store the Click ID.
- **Access BigQuery**: Requires `write` access if BigQuery logging is enabled.
- **Access to Global Variables**: Reads event data, container version, and request headers.

## Open Source

The **Exoclick Tag for GTM Server Side** is developed and maintained by the [Stape Team](https://stape.io/) under the Apache 2.0 license.
