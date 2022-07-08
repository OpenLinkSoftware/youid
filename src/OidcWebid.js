/*
 *  This file is part of the OpenLink YouID
 *
 *  Copyright (C) 2015-2020 OpenLink Software
 *
 *  This project is free software; you can redistribute it and/or modify it
 *  under the terms of the GNU General Public License as published by the
 *  Free Software Foundation; only version 2 of the License, dated June 1991.
 *
 *  This program is distributed in the hope that it will be useful, but
 *  WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 *  General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License along
 *  with this program; if not, write to the Free Software Foundation, Inc.,
 *  51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA
 *
 */
 
const { OIDCWebClient } = OIDC;
const oidc_session = 'oidc.session';
const oidc_clients = 'oidc.clients.';

class myStore {
  constructor()
  {
    this.s = window.localStorage;
    this.data = {};
    this.keys = [];
  }

  sync()
  {
    this.keys = Object.keys(this.data);
  }

  key(idx) 
  {
    if (idx < 0 || idx >= this.keys.length)
      return null;
    return this.keys[idx];
  }

  setItem(key, val)
  {
    this.data[key] = val;
    this.sync();
  }

  getItem(key)
  {
    return this.data[key];
  } 

  removeItem(key)
  {
    delete this.data[key];
    this.sync();
  }

  get length()
  {
    return this.keys.length;
  }

}


class OidcWeb {

  constructor(data) {
    this.webid = null;
    this.session = null;
    this.jstore = new myStore();

    const options = Browser.is_safari ? { solid: true, store: this.jstore} : { solid: true } ;

    this.authClient = new OIDCWebClient(options);
    this.login_url = 'https://openlinksoftware.github.io/oidc-web/login.html#relogin';
  }

  async logout()
  {
    if (this.webid) {
      var idp = '';
      if (this.session) {
        idp = this.session.issuer;
        var key = oidc_clients+idp;
        var rec = await this.localStore_get(key);

        if (rec && rec[key]) {
          if (Browser.is_safari)
            this.jstore.setItem(oidc_clients+idp, rec[key]);
          else
            localStorage.setItem(oidc_clients+idp, rec[key]);
        }

        await this.authClient.logout();
      }
      await this.localStore_remove(oidc_session);
      await this.localStore_remove(oidc_clients+idp);
      this.webid = null;
      this.session = null;
    }
  }

//??
/***
  login0() {
     const width = 650;
     const height = 400;
     const left = window.screenX + (window.innerWidth - width) / 2;
     const top = window.screenY + (window.innerHeight - height) / 2;
     const settings = `width=${width},height=${height},left=${left},top=${top}`;
     window.open(this.login_url, 'Login', settings);	
  }
**/

  login() {
     const width = 650;
     const height = 400;

     if (Browser.is_ff) {
       const left = window.screenX + (window.innerWidth - width) / 2;
       const top = window.screenY + (window.innerHeight - height) / 2;

       Browser.api.windows.create({
         url: this.login_url,
         type: 'popup',
         height,
         width,
         top,
         left,
         allowScriptsToClose : true,
         focused: true
       });

     } else {
       this.popupCenter({url: this.login_url, title:"Login", w:width, h:height});
     }

  }

  popupCenter({url, title, w, h})
  {
    // Fixes dual-screen position                         Most browsers      Firefox  
    var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;  
    var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;  
              
    width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;  
    height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;  
              
    var left = ((width / 2) - (w / 2)) + dualScreenLeft;  
    var top = ((height / 2) - (h / 2)) + dualScreenTop;  
    var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);  
    
    // Puts focus on the newWindow  
    if (window.focus && newWindow) {  
        newWindow.focus();  
    }  
  }

  async fetch(url, options)
  {
    return this.authClient.authFetch(url, options);
  }

  async checkSession() 
  {
    try {
      var rec = await this.localStore_get(oidc_session);

      if (rec && rec[oidc_session]) {
        var session = rec[oidc_session];
        if (Browser.is_safari)
          this.jstore.setItem(oidc_session, session);
        else
          localStorage.setItem(oidc_session, session);
      } 
      else {
        if (Browser.is_safari)
          this.jstore.removeItem(oidc_session);
        else
          localStorage.removeItem(oidc_session);
      }

      this.session = await this.authClient.currentSession()
      this.webid = (this.session.hasCredentials()) ? this.session.idClaims.sub : null;

    } catch(e) {
      console.log(e);
    }
  }

  async localStore_save(key, val) 
  {
    var rec = {};
    rec[key]=val;
    if (Browser.is_chrome) {
      return new Promise(function (resolve, reject) {
        Browser.api.storage.local.set(rec, () => resolve());
      })
    } else {
      return Browser.api.storage.local.set(rec);
    }
  }

  async localStore_get(key) 
  {
    if (Browser.is_chrome) {
      return new Promise(function (resolve, reject) {
        Browser.api.storage.local.get(key, (rec) => {
          resolve(rec)
        });
      })
    } else {
      return Browser.api.storage.local.get(key);
    }
  }

  async localStore_remove(key) 
  {
    if (Browser.is_chrome) {
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


