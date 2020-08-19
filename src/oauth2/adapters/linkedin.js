OAuth2.adapter('linkedin', {
  authorizationCodeURL: function(config) {
    return ('https://www.linkedin.com/uas/oauth2/authorization?' +
      'client_id={{CLIENT_ID}}&' +
      'redirect_uri={{REDIRECT_URI}}&' +
      'scope={{API_SCOPE}}&' +
      'state=Dfghfjdj3840cbcb1&' +
      'response_type=code')
       .replace('{{CLIENT_ID}}', config.clientId)
       .replace('{{REDIRECT_URI}}', this.redirectURL(config))
       .replace('{{API_SCOPE}}', config.apiScope);
  },

  redirectURL: function(config) {
    return 'http://id.myopenlink.net/OAuthCallback';
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
    return 'https://www.linkedin.com/uas/oauth2/accessToken';
  },

  accessTokenMethod: function() {
    return 'GET';
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
    var url = 'https://api.linkedin.com/v2/me';
    var options = {
      headers: {
        'Authorization': 'Bearer '+accessToken
      }
    }
    var rc = await fetch(url, options);
    if (rc.ok) {
      var data = await rc.json();
      if (callback) {
        callback({'email':'', 'name':data.localizedFirstName+' '+data.localizedLastName});
      }
    }
  }

});
