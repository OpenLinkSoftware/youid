OAuth2.adapter('win_azure', {
  authorizationCodeURL: function(config) {
    return ('https://login.microsoftonline.com/common/oauth2/v2.0/authorize?' +
      'client_id={{CLIENT_ID}}&' +
      'redirect_uri={{REDIRECT_URI}}&' +
      'scope={{API_SCOPE}}&' +
      'state=566&' +
      'response_mode=fragment&' +
      'response_type=token')
        .replace('{{CLIENT_ID}}', config.clientId)
        .replace('{{REDIRECT_URI}}', this.redirectURL(config))
        .replace('{{API_SCOPE}}', config.apiScope);
  },

  redirectURL: function(config) {
    return 'https://login.live.com/oauth20_desktop.srf';
  },

  parseAuthorizationCode: function(url) {
    return null;
  },

  parseAuthorizationAccessToken: function(url) {
    var u = new URL(url);
    var params = new URLSearchParams(u.hash.substring(1));
    if (params.has('error')) {
      throw 'Error getting authorization token: ' + params.get('error');
    }
    return params.get('access_token');
  },

  accessTokenURL: function() {
    return  null;
  },

  accessTokenMethod: function() {
    return null;
  },

  accessTokenParams: function(authorizationCode, config) {
    return null;
  },

  parseAccessToken: function(response) {
    return null;
  },

  userInfo: async function(accessToken, callback) {
    var url = 'https://graph.microsoft.com/v1.0/me';
    var options = {
      headers: {
        'Authorization': 'Bearer '+accessToken
      }
    }
    var rc = await fetch(url, options);
    if (rc.ok) {
      var data = await rc.json();
      if (callback) {
        var mail = data.mail;
        if (!mail && data.userPrincipalName && data.userPrincipalName.indexOf('@')!=-1)
           mail = data.userPrincipalName
        callback({'email':mail, 'name':data.displayName});
      }
    }
  }

});
