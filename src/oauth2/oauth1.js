

var OAuth1 = function(adapterName, config) {
  this.adapterName = adapterName;
  var that = this;
  OAuth1.loadAdapter(adapterName, function() {
    that.adapter = OAuth1.adapters[adapterName];
    if (config == OAuth1.FINISH) {
      that.finishAuth();
    } else if (config) {
      that.updateLocalStorage();

      var data = that.get();
      data.consumerKey = config.consumerKey;
//      data.clientSecret = {consumerSec:config.consumerSec, tokenSec:''};
      data.clientSecret.consumerSec = config.consumerSec;
      if (!data.clientSecret.tokenSec)
        data.clientSecret.tokenSec = '';
      data.supportMessages = config.supportMessages;
      that.setSource(data);
    }
  });
};

/**
 * Pass instead of config to specify the finishing OAuth flow.
 */
OAuth1.FINISH = 'finish';

/**
 * OAuth 1.0 endpoint adapters known to the library
 */
OAuth1.adapters = {};

/**
 * Consolidates the data stored in localStorage on the current adapter in to
 * a single JSON object.
 * The update should only ever happen once per adapter and will delete the old
 * obsolete entries in localStorage after copying their values.
 */
OAuth1.prototype.updateLocalStorage = function() {
  // Check if update is even required.
  if (this.getSource()) {
    return;
  }
  var data = {};
  var variables = [
    'oauth_token', 'oauth_token_secret', 'consumerKey', 'clientSecret',
    'r_oauth_token', 'r_oauth_token_secret' 
  ];
  // Check if a variable has already been persisted and then copy them.
  var key;
  for (var i = 0; i < variables.length; i++) {
    key = this.adapterName + '_' + variables[i];
    if (localStorage.hasOwnProperty(key)) {
      data[variables[i]] = localStorage[key];
      delete localStorage[key];
    }
  }
  // Persist the new JSON object in localStorage.
  this.setSource(data);
};


OAuth1.prototype.nonce = function(len) {
  const CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  var result = "";
  for (var i = 0; i < len; ++i) {
      var rnum = Math.floor(Math.random() * CHARS.length);
      result += CHARS.substring(rnum, rnum+1);
  }
  return result;
}


OAuth1.prototype.prepareOAuthHeader = function (meth, url, token, callback, queryParams) {
  function percentEncode(str) {
    return encodeURIComponent(str).replace(/[!*()']/g, (character) => {
      return '%' + character.charCodeAt(0).toString(16);
    });  
  }

  var ts = ""+parseInt(Math.round(Date.now() / 1000));
  var nonce = this.nonce(6);
  var meth = meth.toUpperCase();
  var params = {...queryParams};

  var data = this.get();
  var signKey = data.clientSecret;
  var consumerKey = data.consumerKey;

  if (token)
    signKey.tokenSec = token.secret;

  params['oauth_consumer_key'] = consumerKey;
  params['oauth_version'] = '1.0';
  params['oauth_timestamp'] = ts;
  params['oauth_nonce'] = nonce;
  params['oauth_signature_method'] = 'HMAC-SHA1';
  if (token)
    params['oauth_token'] = token.key;
  else if (data.oauth_token)
    params['oauth_token'] = data.oauth_token;

  if (callback)
    params['oauth_callback'] = callback;

  var ordered = {};
  Object.keys(params).sort().forEach(function(key) {
    ordered[key] = params[key];
  });

  var encodedParameters = '';

  for (k in ordered) {
    const encodedKey = k;  
    const encodedValue = percentEncode(ordered[k]);
    if(encodedParameters === ''){
      encodedParameters += `${encodedKey}=${encodedValue}`;
    }
    else{
      encodedParameters += `&${encodedKey}=${encodedValue}`;
    }
  }

  var signBase = `${meth}&${percentEncode(url)}&${percentEncode(encodedParameters)}`;

  var key = percentEncode(signKey.consumerSec)+'&'+percentEncode(signKey.tokenSec);
  var oauth_signature = percentEncode(b64_hmac_sha1(key, signBase));

  var add_callback = callback ? `oauth_callback="${encodeURIComponent(callback)}", ` : '';
  var add_token = params['oauth_token'] ? `oauth_token="${encodeURIComponent(params['oauth_token'])}", ` : '';

  return `OAuth ${add_callback}oauth_consumer_key="${consumerKey}", ${add_token}oauth_signature_method="HMAC-SHA1", oauth_signature="${oauth_signature}", oauth_timestamp="${ts}", oauth_nonce="${nonce}", oauth_version="1.0"`;
}


OAuth1.prototype.requestToken = async function(config) {
  var that = this;
  var rc = this.adapter.requestTokenURL(config);
  var callback = this.adapter.redirectURL(config);

  var OAuthHeader = this.prepareOAuthHeader(rc.method, rc.url, null, callback, {});
  try {
    var options = {
      method: 'POST',
      headers: {
        'Authorization': OAuthHeader
      }
    }
    var rc = await fetch(rc.url, options);
    if (rc.ok) {
      var data = await rc.text();
      var params = new URLSearchParams(data);
      if (params.has('oauth_callback_confirmed') && params.get('oauth_callback_confirmed') === "true")
        {
          var oauth_token = params.get('oauth_token');
          var oauth_token_secret = params.get('oauth_token_secret');
          var data = that.get();
          data.r_oauth_token_secret = oauth_token_secret;
          data.r_oauth_token = oauth_token;
          that.setSource(data);
          return true;
        }
    }
  } catch (e) {
    console.log(e);
  }
  return false;
}

/**
 * Opens up an authorization popup window. This starts the OAuth 2.0 flow.
 *
 * @param {Function} callback Method to call when the user finished auth.
 */
OAuth1.prototype.openAuthorizationCodePopup = function(callback) {
  // Store a reference to the callback so that the newly opened window can call
  // it later.
  window['oauth-callback'] = callback;
  window['youid_pdp_oauth'] = this.adapterName;
  window['youid_pdp_oauth_mode'] = 1;

  // Create a new tab with the OAuth 2.0 prompt
  chrome.tabs.create({url: this.adapter.authorizationCodeURL(this.getConfig())},
  function(tab) {
    // 1. user grants permission for the application to access the OAuth 2.0
    // endpoint
    // 2. the endpoint redirects to the redirect URL.
    // 3. the extension injects a script into that redirect URL
    // 4. the injected script redirects back to OAuth1.html, also passing
    // the redirect URL
    // 5. OAuth1.html uses redirect URL to know what OAuth 2.0 flow to finish
    // (if there are multiple OAuth 2.0 adapters)
    // 6. Finally, the flow is finished and client code can call
    // myAuth.getAccessToken() to get a valid access token.
  });
};

/**
 * Gets access and refresh (if provided by endpoint) tokens
 *
 * @param {String} authorizationCode Retrieved from the first step in the process
 * @param {Function} callback Called back with 3 params:
 *                            access token, refresh token and expiry time
 */
OAuth1.prototype.getAccessTokens = async function(oauth_verifier) {
  var formData = 'oauth_verifier=' + oauth_verifier;
  var url = this.adapter.accessTokenURL();
  var data = this.get();
  var token = {key:data.r_oauth_token, secret:data.r_oauth_token_secret};

  var OAuthHeader = this.prepareOAuthHeader('POST', url, token, null, {oauth_verifier});

  try {
    var options = {
      method: 'POST',
      headers: {
        'Authorization': OAuthHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    }
    var rc = await fetch(url, options);
    if (rc.ok) {
      var data = await rc.text();
      var params = new URLSearchParams(data);

      var data = this.get();
      data.oauth_token = params.get('oauth_token'); 
      data.clientSecret.tokenSec = params.get('oauth_token_secret');;

      data.screen_name = params.get('screen_name');
      this.setSource(data);
      this.clear('r_oauth_token');
      this.clear('r_oauth_token_secret');
      return true;
    }
  } catch(e) {
    console.log(e);
  }
  return false;
};


/**
 * Extracts authorizationCode from the URL and makes a request to the last
 * leg of the OAuth 2.0 process.
*/
OAuth1.prototype.finishAuth = async function() {
  var that = this;

  // Loop through existing extension views and excute any stored callbacks.
  function callback(error) {
    var views = chrome.extension.getViews();
    for (var i = 0, view; view = views[i]; i++) {
      if (view['oauth-callback']) {
        view['oauth-callback'](error);
        // TODO: Decide whether it's worth it to scope the callback or not.
        // Currently, every provider will share the same callback address but
        // that's not such a big deal assuming that they check to see whether
        // the token exists instead of blindly trusting that it does.
      }
    }

    // Once we get here, close the current tab and we're good to go.
    // The following works around bug: crbug.com/84201
    window.open('', '_self', '');
    window.close();
  }

  var config = this.getConfig();

  try {
    var rc = that.adapter.parseAuthorization(window.location.href);
    if (rc.oauth_token !== config.r_oauth_token){
      callback('Error wrong oauth_token');
      return;
    }
  } catch (e) {
    console.error(e);
    callback(e);
    return;
  }

  var rc = await that.getAccessTokens(rc.oauth_verifier);

  callback();
};

/**
 * Get the persisted adapter data in localStorage. Optionally, provide a
 * property name to only retrieve its value.
 *
 * @param {String} [name] The name of the property to be retrieved.
 * @return The data object or property value if name was specified.
 */
OAuth1.prototype.get = function(name) {
  var src = this.getSource();
  var obj = src ? JSON.parse(src) : {};
  return name ? obj[name] : obj;
};

/**
 * Set the value of a named property on the persisted adapter data in
 * localStorage.
 *
 * @param {String} name The name of the property to change.
 * @param value The value to be set.
 */
OAuth1.prototype.set = function(name, value) {
  var obj = this.get();
  obj[name] = value;
  this.setSource(obj);
};

/**
 * Clear all persisted adapter data in localStorage. Optionally, provide a
 * property name to only clear its value.
 *
 * @param {String} [name] The name of the property to clear.
 */
OAuth1.prototype.clear = function(name) {
  if (name) {
    var obj = this.get();
    delete obj[name];
    this.setSource(obj);
  } else {
    delete localStorage['oauth2_' + this.adapterName];
  }
};

/**
 * Get the JSON string for the object stored in localStorage.
 *
 * @return {String} The source JSON string.
 */
OAuth1.prototype.getSource = function() {
  return localStorage['oauth2_' + this.adapterName];
};

/**
 * Set the JSON string for the object stored in localStorage.
 *
 * @param {Object|String} source The new JSON string/object to be set.
 */
OAuth1.prototype.setSource = function(source) {
  if (!source) {
    return;
  }
  if (typeof source !== 'string') {
    source = JSON.stringify(source);
  }
  localStorage['oauth2_' + this.adapterName] = source;
};

/**
 * Get the configuration parameters to be passed to the adapter.
 *
 * @returns {Object} Contains clientId, clientSecret and apiScope.
 */
OAuth1.prototype.getConfig = function() {
  var data = this.get();
  return {
    consumerKey: data.consumerKey,
    clientSecret: data.clientSecret,
    r_oauth_token: data.r_oauth_token,
    apiScope: data.apiScope,
    supportMessages: data.supportMessages
  };
};

/***********************************
 *
 * STATIC ADAPTER RELATED METHODS
 *
 ***********************************/

/**
 * Loads an OAuth 2.0 adapter and calls back when it's loaded
 *
 * @param adapterName {String} The name of the JS file
 * @param callback {Function} Called as soon as the adapter has been loaded
 */
OAuth1.loadAdapter = function(adapterName, callback) {
  // If it's already loaded, don't load it again
  if (OAuth1.adapters[adapterName]) {
    callback();
    return;
  }
  var head = document.querySelector('head');
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = '/oauth2/adapters/' + adapterName + '.js';
  script.addEventListener('load', function() {
    callback();
  });
  head.appendChild(script);
};

/**
 * Registers an adapter with the library. This call is used by each adapter
 *
 * @param {String} name The adapter name
 * @param {Object} impl The adapter implementation
 *
 * @throws {String} If the specified adapter is invalid
 */
OAuth1.adapter = function(name, impl) {
  var implementing = 'requestTokenURL authorizationCodeURL redirectURL accessTokenURL ' +
    'parseAuthorization';

  // Check for missing methods
  implementing.split(' ').forEach(function(method, index) {
    if (!method in impl) {
      throw 'Invalid adapter! Missing method: ' + method;
    }
  });

  // Save the adapter in the adapter registry
  OAuth1.adapters[name] = impl;
};


/***********************************
 *
 * PUBLIC API
 *
 ***********************************/
 
/**
 * Authorizes the OAuth authenticator instance.
 *
 * @param {Function} callback Tries to callback when auth is successful
 *                            Note: does not callback if grant popup required
 */
//+
OAuth1.prototype.authorize = async function(callback) {
  var that = this;
  OAuth1.loadAdapter(that.adapterName, async function() {
    that.adapter = OAuth1.adapters[that.adapterName];
    var data = that.get();

    that.clearAccessToken();
    var rc = await that.requestToken(data);
    if (rc) {
       that.openAuthorizationCodePopup(callback);
    }
  });
};

/**
 * Indicate whether or not a valid access token exists.
 *
 * @returns {Boolean} True if an access token exists; otherwise false.
 */
OAuth1.prototype.hasAccessToken = function() {
  return !!this.get('oauth_token');
};

/**
 * Clears an access token, effectively "logging out" of the service.
 */
OAuth1.prototype.clearAccessToken = function() {
  this.clear('oauth_token');
  this.clear('oauth_token_secret');
  var data = this.get();
  data.clientSecret.tokenSec = '';
  this.setSource(data);
};

OAuth1.prototype.userInfo = function(callback) {
  var that = this;
  OAuth1.loadAdapter(that.adapterName, async function() {
    that.adapter = OAuth1.adapters[that.adapterName];
    if (that.hasAccessToken()) {
      var data = that.get();
      var url = 'https://api.twitter.com/1.1/users/lookup.json';
      var screen_name = data.screen_name;
      var OAuthHeader = that.prepareOAuthHeader('GET', url, null, null, {screen_name});

      try {
        var options = {
          headers: {
            'Authorization': OAuthHeader
          }
        }
        var rc = await fetch(url+"?screen_name="+encodeURIComponent(screen_name), options);
        if (rc.ok) {
          var data = await rc.json();
          if (callback) {
            if (data.length > 0)
              callback({'name':data[0].name});
          }
        }
      } catch(e) {
        console.log(e);
      }
    } 
  });
};

OAuth1.prototype.sendMessage = function(msg, callback) {
  var that = this;
  OAuth1.loadAdapter(that.adapterName, async function() {
    that.adapter = OAuth1.adapters[that.adapterName];
    if (that.hasAccessToken()) {
      var data = that.get();
      if (data.supportMessages) {
        var url = 'https://api.twitter.com/1.1/statuses/update.json'; 
        var OAuthHeader = that.prepareOAuthHeader('POST', url, null, null, {status: msg});

        try {
          var options = {
            method: 'POST',
            headers: {
              'Authorization': OAuthHeader,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'status='+encodeURIComponent(msg)
          }
          var rc = await fetch(url, options);
          var data = await rc.json();
          var error = null;
          if (!rc.ok && data.errors) {
            error =data.errors[0].message;
            data = null;
          }
          if (callback) {
            callback(data, error);
          }
        } catch(e) {
          console.log(e);
        }
      }
    } 
  });
};


