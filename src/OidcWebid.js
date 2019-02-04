 
const { OIDCWebClient } = OIDC;
const oidc_session = 'oidc.session';
const oidc_clients = 'oidc.clients.';

OidcWeb = function(data) {
  this.webid = null;
  this.session = null;
  this.fetch = fetch;

  const options = { solid: true };
  this.authClient = new OIDCWebClient(options);
  this.login_url = 'https://openlinksoftware.github.io/oidc-web/login.html#relogin';
}


OidcWeb.prototype = {
  logout : async function()
  {
    if (this.webid) {
      var idp = '';
      if (this.session) {
        idp = this.session.issuer;
        var key = oidc_clients+idp;
        var rec = await this.localStore_get(key);
        if (rec && rec[key])
          localStorage.setItem(oidc_clients+idp, rec[key]);

        await this.authClient.logout();
      }
      await this.localStore_remove(oidc_session);
      await this.localStore_remove(oidc_clients+idp);
      this.webid = null;
      this.session = null;
      this.fetch = fetch;
    }
  },

  login: function() {
     const width = 650;
     const height = 400;
     const left = window.screenX + (window.innerWidth - width) / 2;
     const top = window.screenY + (window.innerHeight - height) / 2;
     const settings = `width=${width},height=${height},left=${left},top=${top}`;
     window.open(this.login_url, 'Login', settings);
  },

  checkSession: async function() 
  {
    try {
      var rec = await this.localStore_get(oidc_session);

      if (rec && rec[oidc_session]) {
        var session = rec[oidc_session];
        localStorage.setItem(oidc_session, session);
      } else
        localStorage.removeItem(oidc_session);

      this.session = await this.authClient.currentSession()
      this.webid = (this.session.hasCredentials()) ? this.session.idClaims.sub : null;
      this.fetch = (this.webid) ? this.session.fetch : null;

    } catch(e) {
      console.log(e);
    }
  },

  localStore_save: async function(key, val) 
  {
    var rec = {};
    rec[key]=val;
    if (Browser.isChromeWebExt) {
      return new Promise(function (resolve, reject) {
        Browser.api.storage.local.set(rec, () => resolve());
      })
    } else {
      return Browser.api.storage.local.set(rec);
    }
  },

  localStore_get: async function(key) 
  {
    if (Browser.isChromeWebExt) {
      return new Promise(function (resolve, reject) {
        Browser.api.storage.local.get(key, (rec) => {
          resolve(rec)
        });
      })
    } else {
      return Browser.api.storage.local.get(key);
    }
  },

  localStore_remove: async function(key) 
  {
    if (Browser.isChromeWebExt) {
      return new Promise(function (resolve, reject) {
        Browser.api.storage.local.remove(key, (rec) => {
          resolve(rec)
        });
      })
    } else {
      return Browser.api.storage.local.remove(key);
    }
  }


}



