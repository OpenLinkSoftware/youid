  var googleAuth = new OAuth2('google', {
    client_id: '1059555567512-5o6s66782i86orgofpv6biorXXXXXXXX.apps.googleXXXXXXtent.com',
    client_secret: 'avFEa2TKTJWyP4omXXXXXXXX',
    api_scope: 'openid profile email',
    mode2: false
  });

  var facebookAuth = new OAuth2('facebook', {
    client_id: '453029738100680',
    client_secret: '9efa297e80b23386c780a7c8XXXXXXXX',
    api_scope: 'email',
    mode2: false,
    supportMessages: false
  });
  

  var amazonAuth = new OAuth2('amazon', {
    client_id: 'amzn1.application-oa2-client.17b970df204c430fbfa94398XXXXXXXX',
    client_secret: '97a0c4ed60b9fb3d50184c0b4baae098e4a315d1099454e579b70eccXXXXXXXX',
    api_scope: 'profile',
    mode2: false
  });

  var winLiveAuth = new OAuth2('win_live', {
    client_id: '00000000441007A0',
    client_secret: 'lT8MLq01zrl3q-qIpZE15efYXXXXXXXX',
    api_scope: 'wl.basic+wl.emails',
    mode2: false
  });

  var linkedinAuth = new OAuth2('linkedin', {
    client_id: 'geyovx12q4tz',
    client_secret: 'HvTPPEJnXXXXXXXX',
    api_scope: 'r_liteprofile r_emailaddress w_member_social',
    mode2: false,
    supportMessages: true
  });

  var winAzureAuth = new OAuth2('win_azure', {
    client_id: 'a45b3cd9-976c-400c-b35d-f4d63b6f566b',
    client_secret: 'AeoL9..7a.ydWqGNz5_Dnvm.0KXXXXXXXX',
    api_scope: 'openid offline_access profile User.Read',
    mode2: true
  });

  var twitterAuth = new OAuth1('twitter', {
    consumerKey: 'WBCEO8jOeNBjmIZE1jKVRA',
    consumerSec: 'v8USBQNfBHkDJKLuqV7I4z5a5f85iMdGyoXXXXXXXX',
    supportMessages: true
  });
