const GAPI_URL = 'https://apis.google.com/js/api.js';
const GIS_URL = 'https://accounts.google.com/gsi/client';

// Use a script element with type "application/json" to enclose a JSON
// object.
const {
  GOOGLE_CLIENT_ID,
  GOOGLE_DISCOVERY_DOCS, // array of [service, version]
  GOOGLE_GAPI_LIBRARIES, // colon-delimited string
  GOOGLE_SCOPES          // array of scopes
} = JSON.parse(document.getElementById('google-config')?.textContent);

// Configure Google API (gapi) component.
export const getGAPI = (function() {
  const gapiReady = new Promise(async resolve => {
    async function onGAPILoad() {
      // Intiialize the client, plus any other top-level libraries (e.g. picker).
      const gapi = window['gapi'];
      await new Promise((callback, onerror) => {
        gapi.load(GOOGLE_GAPI_LIBRARIES, { callback, onerror });
      });
      await gapi.client.init({});

      // Load the client libraries, e.g. drive, docs, sheets.
      await Promise.all(GOOGLE_DISCOVERY_DOCS.map(doc => {
        return gapi.client.load(doc);
      }));

      resolve(gapi);
    }

    const scriptElement = document.createElement('script');
    scriptElement.src = GAPI_URL;
    scriptElement.addEventListener('load', onGAPILoad, { once: true });
    document.body.appendChild(scriptElement);
  });
  return () => gapiReady;
})();

// Configure Google Identity Services (gapi-token-client).
export const getAccessToken = (function() {
  const getAccessTokenReady = new Promise(resolve => {
    async function onGISLoad() {
      // Create the token client.
      // https://developers.google.com/identity/oauth2/web/reference/js-reference#google.accounts.oauth2.initTokenClient
      const tokenClient = window['google'].accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GOOGLE_SCOPES.join(' '),
        prompt: '',
        callback: '' // defined at request time in await/promise scope.
      });

      async function getAccessToken(gapi) {
        return new Promise(function (resolve, reject) {
          tokenClient.callback = function(response) {
            if (response.error) {
              return reject(new Error(response.error));
            }
            const accessToken = gapi.client.getToken();
            resolve(accessToken);
          };
          tokenClient.requestAccessToken();
        });
      }

      resolve(getAccessToken);
    }

    const scriptElement = document.createElement('script');
    scriptElement.src = GIS_URL;
    scriptElement.addEventListener('load', onGISLoad, { once: true });
    document.body.appendChild(scriptElement);
  });

  return async (gapi) => {
    const gat = await getAccessTokenReady;
    return gat(gapi);
  }
})();
