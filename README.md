# TrafficStars Tag for GTM Server-Side

This server-side tag allows you to track [TrafficStars conversions](https://trafficstars.com/faq/articles/how-to-set-up-tracking-conversions) via server-to-server (S2S) postbacks and handle Click ID storage directly from your Google Tag Manager Server container.

## Features

- **Event Support**: Handles **Page View** (for storing Click IDs) and **Conversion** (for tracking goals).
- **Cookie Management**: Automatically extracts the Click ID from the URL during a Page View and stores it as a first-party cookie.
- **Cookie Syncing**: Optional feature to fire browser-side pixels to synchronize cookies across TrafficStars domains when no Click ID is found in first-party cookie or the Click ID value is invalid.
- **Optimistic Scenario**: Option to trigger `gtmOnSuccess()` immediately without waiting for the API response.


## Configuration

### 1. Event Type

- **Page View**: Fires when a user reaches the landing page to store the Click ID in the `_trafficstars_cid` first-party cookie.
  - **Click ID URL Parameter Name**: The query parameter key for your `{click_id}` token (e.g., `starstracker`).
  - **Cookie Settings**: Define **Expiration** (days), **Domain**, **SameSite** and **HttpOnly** flag for the Click ID cookie.
- **Conversion**: Sends a postback to TrafficStars.
  - **Click ID URL Parameter Name**: The query parameter name for your `{click_id}` token (e.g., `starstracker`).
  - **Goal ID**: Found in the "[Goals & Conversions - Postback](https://admin.trafficstars.com/advertisers/tracking-tools/postback/)" tab on TrafficStars admin panel.
  - **API Key**: The `key` parameter found in your "[Goals & Conversions - Postback](https://admin.trafficstars.com/advertisers/tracking-tools/postback/)".
  - **Enable cookie syncing**: Enables third-party cookie-syncing pixels from the browser (e.g., to `https://tsyndicate.com/api/v2/cpa/{Profile ID}/pixel.gif`) if the server-side conversion request fails due to no available Click ID to be used or due to an invalid Click ID.

### 2. Advanced Parameters (Conversion)

Use the table to map specific fields supported by the TrafficStars API:

- **Value**: Track earnings and ROI by reporting your revenue.
- **Price**: Track conversion cost by reporting you cost for conversion.
- **Lead Code**: Track post-conversion events by reporting multiple conversions for the same Click ID Value.
- **Allow Duplicates**: Allow conversion to be counted multiple times.

### 3. General Settings

- **Use Optimistic Scenario**: Check to fire the tag success trigger regardless of the actual API result.
- **Ad Storage Consent**: Choose "Send data in case marketing consent given" to abort execution if `ad_storage` is not granted.

### 4. Logging

- **Logs Settings**: Options to log to console "Always", "Never", or during "Debug and preview".
- **BigQuery Logs**: Enable to log full event data to a BigQuery table.
  - **Project ID**: Defaults to `GOOGLE_CLOUD_PROJECT` environment variable if empty.
  - **Dataset ID**: Required.
  - **Table ID**: Required.

## Open Source

The **TrafficStars Tag for GTM Server Side** is developed and maintained by the [Stape Team](https://stape.io/) under the Apache 2.0 license.

### GTM Gallery Status
🟢 [Listed](https://tagmanager.google.com/gallery/#/owners/stape-io/templates/trafficstars-tag)
