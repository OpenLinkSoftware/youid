OAuth2.adapter('facebook', {
  authorizationCodeURL: function(config) {
    return ('https://www.facebook.com/dialog/oauth?' +
      'client_id={{CLIENT_ID}}&' +
      'redirect_uri={{REDIRECT_URI}}&' +
      'scope={{API_SCOPE}}')
        .replace('{{CLIENT_ID}}', config.clientId)
        .replace('{{REDIRECT_URI}}', this.redirectURL(config))
        .replace('{{API_SCOPE}}', config.apiScope);
  },

  redirectURL: function(config) {
    return 'https://id.myopenlink.net/OAuthCallback';
  },

  parseAuthorizationCode: function(url) {
    var u = new URL(url);
    var params = u.searchParams;
    if (params.has('error')) {
      throw 'Error getting authorization code: ' + params.get('error');
    }
    return params.get('code');
  },

  accessTokenURL: function() {
    return 'https://graph.facebook.com/oauth/access_token';
  },

  accessTokenMethod: function() {
    return 'GET';
  },

  accessTokenParams: function(authorizationCode, config) {
    return {
      code: authorizationCode,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: this.redirectURL(config)
    };
  },

  parseAccessToken: function(response) {
    var parsedResponse = JSON.parse(response);
    return {
      accessToken: parsedResponse.access_token,
      tokenType: parsedResponse.token_type,
      expiresIn: parsedResponse.expires_in
    };

  },

  userInfo: async function(accessToken, callback) {
    var url = 'https://graph.facebook.com/me?fields=email,name&access_token='+accessToken;
    var rc = await fetch(url);
    if (rc.ok) {
      var data = await rc.json();
      if (callback) {
        callback({'email':data.email, 'name':data.name});
      }
    }
  }

});
