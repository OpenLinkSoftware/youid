OAuth2.adapter('win_live', {
  authorizationCodeURL: function(config) {
    return ('https://login.live.com/oauth20_authorize.srf?' +
      'client_id={{CLIENT_ID}}&' +
      'redirect_uri={{REDIRECT_URI}}&' +
      'scope={{API_SCOPE}}&' +
      'access_type=offline&' +
      'response_type=code')
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
    return  'https://login.live.com/oauth20_token.srf';
  },

  accessTokenMethod: function() {
    return 'POST';
  },

  accessTokenParams: function(authorizationCode, config) {
    return {
      code: authorizationCode,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: this.redirectURL(config),
      grant_type: 'authorization_code'
    };
  },

  parseAccessToken: function(response) {
    var parsedResponse = JSON.parse(response);
    return {
      accessToken: parsedResponse.access_token,
      refreshToken: parsedResponse.refresh_token,
      expiresIn: parsedResponse.expires_in
    };
  },

  userInfo: async function(accessToken, callback) {
    var url = 'https://apis.live.net/v5.0/me?access_token='+accessToken;
    var rc = await fetch(url);
    if (rc.ok) {
      var data = await rc.json();
      if (callback) {
        callback({'email':data.emails.preferred, 'name':data.name});
      }
    }
  }

});
