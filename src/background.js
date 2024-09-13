/*
 *  This file is part of the OpenLink Structured Data Sniffer
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

{
  var setting = new Settings();

  async function sync_Settings()
  {
    var pref_youid = null;
    var hdr_list = [];
    var uid = null;

    try {
      var v = await setting.getValue("ext.youid.pref.id");
      if (v)
        pref_youid = JSON.parse(v);

      if (pref_youid && pref_youid.id) {
        localStorage.setItem('cur_delegator', pref_youid.id);
        uid = pref_youid.id;
      }
      else
        localStorage.removeItem('cur_delegator');

      v = await setting.getValue("ext.youid.pref.hdr_list");
      if (v && v.length>0)
        hdr_list = hdr_list.concat(JSON.parse(v));

      if (hdr_list && hdr_list.length > 0)
        localStorage.setItem('hdr_list', JSON.stringify(hdr_list));
      else
        localStorage.removeItem('hdr_list');

      if (Browser.is_chrome_v3 || Browser.is_ff_v3)
        await setRules_for_Headers(uid, hdr_list);
    }catch(_) { }
  }

  sync_Settings();


  async function getCurWin()
  {
    if (Browser.is_chrome) {
      return new Promise(function (resolve, reject) {
        Browser.api.windows.getCurrent({}, (w) => {
          resolve(w)
        });
      })
    } else {
      return Browser.api.windows.getCurrent({});
    }
  }

  async function getCurTab()
  {
    if (Browser.is_chrome) {
      return new Promise(function (resolve, reject) {
        Browser.api.tabs.query({active:true, currentWindow:true}, (t) => {
          resolve(t)
        });
      })
    } else {
      return Browser.api.tabs.query({active:true, currentWindow:true});
    }
  }


  //Chrome API
  //wait data from extension
  Browser.api.runtime.onMessage.addListener(function(request, sender, sendResponse)
  {
    (async () => {
      try {
        if (request.cmd === "close_oidc_web")
        {
          var curWin = await getCurWin();
          var curTab = await getCurTab();
          if (request.url && curTab.length > 0 && curTab[0].windowId === curWin.id
              && curTab[0].url === request.url) {
            Browser.api.tabs.remove(curTab[0].id);
          }
        }
        else if (request.cmd === "activate_certgen")
        {
           Browser.openTab("options.html#certificate");
        }
      } catch(e) {
        console.log("OSDS: onMsg="+e);
      }
    })();

    // Important! Return true to indicate you want to send a response asynchronously
    return true;
  });

  
  Browser.api.runtime.onMessageExternal.addListener(
    async function(request, sender, sendResponse) {
      if (request.getWebId) {
        var v = await setting.getValue("ext.youid.pref.id");
        sendResponse({webid: v});
        return true;
      }
  });


  // iterace with YouID content script
  Browser.api.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    (async () => {
      var pref_youid;

      if (request.getWebId) {
        try {
          var v = await setting.getValue("ext.youid.pref.id");
          if (v)
            pref_youid = JSON.parse(v);
        } catch(e){}

        sendResponse({webid: pref_youid.id});
      }
      else if (request.cmd === "settings_updated") {
        await sync_Settings();
        sendResponse({});  // stop
      }
      else if (request.cmd === "oauth_callback") {
        let params = request.params
        if (params) {
          var curTab = await getCurTab();
          Browser.api.tabs.update(curTab[0].id, { "url": Browser.api.runtime.getURL("oauth2/oauth2.html")+params});
        }
      }
    })();

    // Important! Return true to indicate you want to send a response asynchronously
    return true;
  });

}