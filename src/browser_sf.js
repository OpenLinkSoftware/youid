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

var Browser = {
    is_chrome: true,
    is_ff: false,
    is_safari: true,
    is_chrome_v3: false,
    is_ff_v3: false,

    api: null,

    openTab : function(uri, tab_index) {
      if (Browser.is_safari) {
        if (tab_index!==undefined) 
          Browser.api.tabs.create({url:uri, index:tab_index+1 });
        else
          Browser.api.tabs.getCurrent(
            function(tab) {
              if (tab!==undefined)
                Browser.api.tabs.create({url:uri, index:tab.index+1 });
              else
                Browser.api.tabs.create({url:uri});
            }
          )
      }else
        window.open(uri);
    },
    createTab : function(url) {
      if (Browser.is_ff || Browser.is_chrome_v3 || is_safari) {
        Browser.api.tabs.create({url:url});
      }
      else if (window && window.open)
        window.open(url);
      else
        Browser.api.tabs.create({url:url});
    }
}

try {
  Browser.api = (Browser.is_chrome) ? chrome : browser;
} catch(e) {}
