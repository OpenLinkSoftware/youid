/*
 *  This file is part of the OpenLink Structured Data Sniffer
 *
 *  Copyright (C) 2015-2021 OpenLink Software
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

class wStore {
  constructor()
  {
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



var window = {};
var localStorage = new wStore();

try {

  importScripts(
                "./browser.js",
                "./settings.js",
                "./utils2.js",
                "./background.js"
  );

  //=====================================

  async function setUID() 
  {
    const setting = new Settings();
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

      await setRules_for_Headers(uid, hdr_list);
    }catch(_) { }
  }
      
  Browser.api.runtime.onInstalled.addListener(async (details) => {
    if(details.reason !== "install" && details.reason !== "update") return;
    try {
      await setUID();
    } catch(ex) {
      console.log(ex);
    }
  });

} catch(ex) {
  console.log(ex);
}
