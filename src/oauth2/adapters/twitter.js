OAuth1.adapter('twitter', {
  requestTokenURL: function(config) {
    return {url:'https://api.twitter.com/oauth/request_token', method:'POST'};
  },

  authorizationCodeURL: function(config) {
    return ('https://api.twitter.com/oauth/authenticate?' +
      'oauth_token='+config.r_oauth_token);
  },

  redirectURL: function(config) {
    return 'http://id.myopenlink.net/OAuthCallback';
  },

  parseAuthorization: function(url) {
    var u = new URL(url);
    var params = u.searchParams;
    return {oauth_token: params.get('oauth_token'), oauth_verifier: params.get('oauth_verifier')};
  },

  accessTokenURL: function() {
    return 'https://api.twitter.com/oauth/access_token';
  },

  userInfo: async function(accessToken, callback) {
    var url = 'https://api.twitter.com/1.1/users/lookup.json';
    var rc = await fetch(url);
    if (rc.ok) {
      var data = await rc.json();
      if (callback) {
        callback({'email':data.email, 'name':data.name});
      }
    }
  }

});
