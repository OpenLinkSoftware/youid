  var googleAuth = new OAuth2('google', {
    client_id: '1059555567512-5o6s66782i86orgofpv6biorju69ri2n.apps.googleusercontent.com',
    client_secret: 'avFEa2TKTJWyP4om4eSw5cZS',
    api_scope: 'openid profile email',
    mode2: false
  });

/**0
  var facebookAuth = new OAuth2('facebook', {
    client_id: '177955888930840',
    client_secret: 'b42a5741bd3d6de6ac591c7b0e279c9f',
    api_scope: 'read_stream,user_likes',
    mode2: false
  });
***/
  var facebookAuth = new OAuth2('facebook', {
    client_id: '453029738100680',
    client_secret: '9efa297e80b23386c780a7c8c677bb41',
    api_scope: 'email',
    mode2: false
  });
  

  var amazonAuth = new OAuth2('amazon', {
    client_id: 'amzn1.application-oa2-client.17b970df204c430fbfa94398d44875ff',
    client_secret: '97a0c4ed60b9fb3d50184c0b4baae098e4a315d1099454e579b70ecc82922f92',
    api_scope: 'profile',
    mode2: false
  });

  var winLiveAuth = new OAuth2('win_live', {
    client_id: '00000000441007A0',
    client_secret: 'lT8MLq01zrl3q-qIpZE15efYnKE19dTe',
    api_scope: 'wl.basic+wl.emails',
    mode2: false
  });

  var linkedinAuth = new OAuth2('linkedin', {
    client_id: 'geyovx12q4tz',
    client_secret: 'HvTPPEJnvOty9mJW',
    api_scope: 'r_liteprofile r_emailaddress',
    mode2: false
  });

  var winAzureAuth = new OAuth2('win_azure', {
    client_id: 'a45b3cd9-976c-400c-b35d-f4d63b6f566b',
    client_secret: 'AeoL9..7a.ydWqGNz5_Dnvm.0KFneW5j04',
    api_scope: 'openid offline_access profile User.Read',
    mode2: true
  });

  var twitterAuth = new OAuth1('twitter', {
    consumerKey: 'WBCEO8jOeNBjmIZE1jKVRA',
    consumerSec: 'v8USBQNfBHkDJKLuqV7I4z5a5f85iMdGyoS3WgtOK8',
  });
