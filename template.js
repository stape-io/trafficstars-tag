const computeEffectiveTldPlusOne = require('computeEffectiveTldPlusOne');
const encodeUriComponent = require('encodeUriComponent');
const getAllEventData = require('getAllEventData');
const getCookieValues = require('getCookieValues');
const getEventData = require('getEventData');
const getRequestHeader = require('getRequestHeader');
const getType = require('getType');
const JSON = require('JSON');
const logToConsole = require('logToConsole');
const makeInteger = require('makeInteger');
const makeString = require('makeString');
const parseUrl = require('parseUrl');
const sendHttpRequest = require('sendHttpRequest');
const sendPixelFromBrowser = require('sendPixelFromBrowser');
const setCookie = require('setCookie');

/*==============================================================================
==============================================================================*/

const eventData = getAllEventData();

if (checkGuardClauses(data, eventData)) return;

if (data.type === 'pageview') return storeClickId(data, eventData);
else {
  sendConversion(data, eventData);
}

if (data.useOptimisticScenario) {
  return data.gtmOnSuccess();
}

/*==============================================================================
  Vendor related functions
==============================================================================*/

function sendConversion(data, eventData) {
  const cookieSync = data.cookieSync;
  const goal = data.conversionId;
  const clickId = getClickId(data, eventData);
  const advancedParameters = data.parameters;
  let requestUrl =
    'https://tsyndicate.com/api/v1/cpa/action?' +
    'key=' +
    enc(data.apiKey) +
    '&clickid=' +
    enc(clickId) +
    '&goalid=' +
    enc(goal);
  let conversionParametersForCookieSync = '?goalid=' + enc(goal);

  if (advancedParameters) {
    advancedParameters.forEach((parameter) => {
      if (parameter.key === 'allow_duplicates' && !!parameter.value) parameter.value = 1;
      const parameterKeyValue = '&' + parameter.key + '=' + enc(parameter.value);
      requestUrl += parameterKeyValue;

      if (cookieSync && parameter.key !== 'allow_duplicates') {
        conversionParametersForCookieSync += parameterKeyValue;
      }
    });
  }

  if (!clickId) {
    log({
      Name: 'TrafficStars',
      Type: 'Message',
      EventName: 'Conversion',
      Message:
        '⚠️ [WARNING] No Click ID found. ' +
        (cookieSync
          ? '3rd party cookie-syncing requests will try to be sent as fallback.'
          : 'Aborting.')
    });
    if (cookieSync) {
      return sendCookieSyncPixel(conversionParametersForCookieSync)
        ? data.gtmOnSuccess()
        : data.gtmOnFailure();
    } else {
      return data.gtmOnFailure();
    }
  }

  const requestOptions = {
    method: 'GET'
  };

  return sendHttpRequest(requestUrl, requestOptions)
    .then((response) => {
      if (!data.useOptimisticScenario) {
        if (response.statusCode !== 200) {
          const parsedBody = JSON.parse(response.body || '{}');
          if (
            cookieSync &&
            getType(parsedBody.error) === 'object' &&
            (parsedBody.error.msg === 'clickid is empty' ||
              parsedBody.error.msg === 'getting click error: invalid clickid' ||
              parsedBody.error.msg === 'clickid is short')
          ) {
            log({
              Name: 'TrafficStars',
              Type: 'Message',
              EventName: 'Conversion',
              Message:
                '⚠️ [WARNING] Click ID is invalid. 3rd party cookie-syncing requests will try to be sent as fallback.',
              Reason: parsedBody
            });
            return sendCookieSyncPixel(conversionParametersForCookieSync)
              ? data.gtmOnSuccess()
              : data.gtmOnFailure();
          }
          return data.gtmOnFailure();
        } else {
          return data.gtmOnSuccess();
        }
      }
    })
    .catch((error) => {
      if (!data.useOptimisticScenario) return data.gtmOnFailure();
    });
}

function parseClickIdFromUrl(data, eventData) {
  const url = eventData.page_location || getRequestHeader('referer');
  if (!url) return;

  const urlSearchParams = parseUrl(url).searchParams;
  return urlSearchParams[data.clickIdKey];
}

function getClickId(data, eventData) {
  const clickId = data.hasOwnProperty('clickId')
    ? data.clickId
    : parseClickIdFromUrl(data, eventData) || getCookieValues('_trafficstars_cid')[0];
  return clickId;
}

function storeClickId(data, eventData) {
  const clickId = parseClickIdFromUrl(data, eventData);
  if (clickId) {
    const cookieOptions = {
      domain: getCookieDomain(data),
      samesite: data.cookieSameSite || 'none',
      path: '/',
      secure: true,
      httpOnly: !!data.cookieHttpOnly,
      'max-age': 60 * 60 * 24 * (makeInteger(data.cookieExpiration) || 365)
    };
    setCookie('_trafficstars_cid', clickId, cookieOptions, false);
  }

  return data.gtmOnSuccess();
}

function sendCookieSyncPixel(conversionParametersForCookieSync) {
  const url =
    'https://tsyndicate.com/api/v2/cpa/' +
    enc(data.profileId) +
    '/pixel.gif' +
    conversionParametersForCookieSync;
  const sendPixelFromBrowserSuccess = sendPixelFromBrowser(url);

  if (!sendPixelFromBrowserSuccess) {
    log({
      Name: 'TrafficStars',
      Type: 'Message',
      EventName: 'Conversion',
      Message:
        '⚠️ [WARNING] The requestor does not support sending pixels from browser. 3rd party cookies will not be collected as a result.'
    });
  }

  return sendPixelFromBrowserSuccess;
}

/*==============================================================================
  Helpers
==============================================================================*/

function checkGuardClauses(data, eventData) {
  const url = eventData.page_location || getRequestHeader('referer');

  if (!isConsentGivenOrNotRequired(data, eventData)) {
    data.gtmOnSuccess();
    return true;
  }

  if (url && url.lastIndexOf('https://gtm-msr.appspot.com/', 0) === 0) {
    data.gtmOnSuccess();
    return true;
  }
}

function enc(data) {
  if (['null', 'undefined'].indexOf(getType(data)) !== -1) data = '';
  return encodeUriComponent(makeString(data));
}

function getCookieDomain(data) {
  return !data.cookieDomain || data.cookieDomain === 'auto'
    ? computeEffectiveTldPlusOne(getEventData('page_location') || getRequestHeader('referer')) ||
        'auto'
    : data.cookieDomain;
}

function isConsentGivenOrNotRequired(data, eventData) {
  if (data.adStorageConsent !== 'required') return true;
  if (eventData.consent_state) return !!eventData.consent_state.ad_storage;
  const xGaGcs = eventData['x-ga-gcs'] || ''; // x-ga-gcs is a string like "G110"
  return xGaGcs[2] === '1';
}

function log(rawDataToLog) {
  rawDataToLog.TraceId = getRequestHeader('trace-id');
  logToConsole(JSON.stringify(rawDataToLog));
}
