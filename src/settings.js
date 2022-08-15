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

class Settings {
  constructor() { }

  async _syncAll()
  {
    if (!Browser.is_safari) {
      for(var i=0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        var val = localStorage.getItem(key);
        if (key.startsWith('ext.'))
          await this._setItem(key, val);
      }
    }
  }


  async _getItem0(id)
  {
    if (Browser.is_ff) {
      return Browser.api.storage.local.get(id);
    }
    else 
      return new Promise((resolve, reject) => {
         Browser.api.storage.local.get(id, (rec) => {
           resolve(rec);
         });
        
      })
  }

  async _getItem(id)
  {
    if (!Browser.is_safari) {
      var rec = await this._getItem0('data_moved');
      if (!rec['data_moved']) {
        await this._syncAll();
        await this._setItem('data_moved','1');
      }
    }

    var rec = await this._getItem0(id);
    return rec[id];
  }

  async _setItem(id, val)
  {
    var rec = {};
    rec[id] = val;
    if (Browser.is_ff)
      return Browser.api.storage.local.set(rec);
    else 
      return new Promise((resolve, reject) => {
         Browser.api.storage.local.set(rec, () => {
           resolve();
         });
        
      })
  }

  async getValue(id)
  {
    var val = null;

    try {
      val = await this._getItem(id);

      if (val===undefined)
        val = null;
    } catch(e) {
      console.log(e);
    }

    if (val!==null)
      return val;

    switch(id) {
      case "ext.youid.pref.ann_message":
          val = this.getDef_Fingerprint();
          break;
    }
    return val;
  }

  async setValue(id, val)
  {
    try {
      await this._setItem(id, val);
    } catch(e) {
      console.log(e);
    }
  }


  getDef_Fingerprint() 
  {
    return 'Announcing a new verifiable Digital Identity for {webid} .\n'
          +'Fingerprint URI: {ni-scheme-uri} .';
  }

}

