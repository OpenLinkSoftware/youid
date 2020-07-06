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


// iterate with another content scripts (now Dokieli)
window.addEventListener("message", recvMessage, false);

function recvMessage(event)
{
  var ev_data;

  if (String(event.data).lastIndexOf("youid:",0)!==0)
    return;

  try {
    ev_data = JSON.parse(event.data.substr(6));
  } catch(e) {}


  if (ev_data && ev_data.getWebId) {
    if (Browser.isChromeWebExt) {
       Browser.api.runtime.sendMessage({ getWebId: true},
              function (response) {
//                 console.log(JSON.stringify(response, undefined, 2));

                 if (response.webid) {
                   var msg = '{"webid":"'+response.webid+'"}';
                   event.source.postMessage("youid_rc:"+msg, event.origin);
                 }

              });
    } else {
      Browser.api.runtime.sendMessage({ getWebId: true})
           .then(function (response) 
                 {
//                 console.log(JSON.stringify(response, undefined, 2));

                   if (response.webid) {
                     var msg = '{"webid":"'+response.webid+'"}';
                     event.source.postMessage("youid_rc:"+msg, event.origin);
                   }
                 });
    }

  }
}


