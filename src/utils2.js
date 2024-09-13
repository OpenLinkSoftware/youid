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

async function setRules_for_Headers(uid, hdr_list)
{
  if (Browser.is_chrome_v3 || Browser.is_ff_v3) {
    var headers = [];
    if (uid)
      headers.push({ "header": "On-Behalf-Of", "operation": "set", "value": uid });

    if (hdr_list && hdr_list.length > 0) 
      for(const v of hdr_list)
        headers.push({ "header": v.hdr, "operation": "set", "value": v.val });

    if (headers.length > 0) {
      try { 
        
        const oldRules = await Browser.api.declarativeNetRequest.getDynamicRules();
        const oldRuleIds = oldRules.map(rule => rule.id);
        await Browser.api.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: oldRuleIds,
          addRules: [{
            "id": 1,
            "priority": 1,
            "action": {
              "type": "modifyHeaders",
              "requestHeaders": headers
            },
            "condition": {
              "resourceTypes": ["main_frame", "sub_frame", "xmlhttprequest"]
            }
          }]
        });
      } catch(ex) {
        console.log(ex);
      }
    }
    else {
      try {
        const oldRules = await Browser.api.declarativeNetRequest.getDynamicRules();
        const oldRuleIds = oldRules.map(rule => rule.id);
        if (oldRuleIds.length > 0) 
          await Browser.api.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: oldRuleIds
          });
      } catch(ex) {
        console.log(ex);
      }  
    }
  }

}


async function setRule_OnBehalfOf(chk, UID) {
  if (Browser.is_chrome_v3 || Browser.is_ff_v3) {
    if (chk==="1" && UID && UID.length > 1) {
      try { 
        const oldRules = await Browser.api.declarativeNetRequest.getDynamicRules();
        const oldRuleIds = oldRules.map(rule => rule.id);
        await Browser.api.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: oldRuleIds,
          addRules: [{
            "id": 1,
            "priority": 1,
            "action": {
              "type": "modifyHeaders",
              "requestHeaders": [
                { "header": "On-Behalf-Of", "operation": "set", "value": UID }
              ]
            },
            "condition": {
              "resourceTypes": ["main_frame", "sub_frame", "xmlhttprequest"]
            }
          }]
        });
      } catch(ex) {
        console.log(ex);
      }
    }
    else {
      try {
        const oldRules = await Browser.api.declarativeNetRequest.getDynamicRules();
        const oldRuleIds = oldRules.map(rule => rule.id);
        if (oldRuleIds.length > 0) 
          await Browser.api.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: oldRuleIds
          });
      } catch(ex) {
        console.log(ex);
      }  
    }
  }
}

