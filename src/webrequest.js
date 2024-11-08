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

}
