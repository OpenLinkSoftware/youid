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


{
  var setting = new Settings();

  async function sync_Settings()
  {
    var pref_youid;
    var hdr_list = [];

    try {
      var v = await setting.getValue("ext.youid.pref.id");
      if (v)
        pref_youid = JSON.parse(v);

      if (pref_youid && pref_youid.id)
        localStorage.setItem('cur_delegator', pref_youid.id);
      else
        localStorage.removeItem('cur_delegator');

      v = await setting.getValue("ext.youid.pref.hdr_list");
      if (v && v.length>0)
        hdr_list = hdr_list.concat(JSON.parse(v));

      if (hdr_list && hdr_list.length > 0)
        localStorage.setItem('hdr_list', JSON.stringify(hdr_list));
      else
        localStorage.removeItem('hdr_list');
    }catch(e) { }
  }

  sync_Settings();

  Browser.api.webRequest.onBeforeSendHeaders.addListener(
        function(details) 
        {
          var pref_youid = null;
          var hdr_list = [];
          try {
            pref_youid = localStorage.getItem('cur_delegator');
          } catch(e){}

          try {
            var v = localStorage.getItem('hdr_list');
            if (v)
              hdr_list = JSON.parse(v);
          } catch(e){}

          if (pref_youid && pref_youid.length > 0) {
            details.requestHeaders.push({name:"On-Behalf-Of", value:pref_youid});
/***
            var header_acah = null;
            for (var h of details.requestHeaders) {
              if (h.name && h.name.toLowerCase() === "access-control-allow-headers") {
                header_acah = h;
                break;
              }
            }

            if (header_acah && header_acah.value.trim().length > 0)
              header_acah.value += ', On-Behalf-Of'
            else
              details.requestHeaders.push({name:"Access-Control-Allow-Headers", value:"On-Behalf-Of"});
***/
          }

          if (hdr_list.length > 0) {
            for(var i=0; i < hdr_list.length; i++) {
              var item = hdr_list[i]
              details.requestHeaders.push({name:item.hdr, value:item.val});
            }
          }
          
          return {"requestHeaders": details.requestHeaders};
        },
        {urls: ["<all_urls>"]},
        ["blocking", "requestHeaders"]);




  // iterace with YouID content script
  Browser.api.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
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
      else
        sendResponse({});  // stop
  });


  Browser.api.runtime.onMessageExternal.addListener(
    async function(request, sender, sendResponse) {
      if (request.getWebId) {
        var v = await setting.getValue("ext.youid.pref.id");
        sendResponse({webid: v});
      }
    });


}
