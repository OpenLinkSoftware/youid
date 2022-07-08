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

var gPref = null;
var $ = jQuery;
var v_youid = null;


$(document).ready(function()
{
  document.getElementById("c_year").innerText = new Date().getFullYear();

  $('#prefs_btn').click(Prefs_exec);

  gPref = new Settings();
  v_youid = new YouId_View(true);

  $('#ext_ver').text('version: '+ Browser.api.runtime.getManifest().version);

  document.querySelector('#add_youid').onclick = (e) => { v_youid.click_add_youid(e); };
  document.querySelector('#btn-gen-cert').onclick = (e) => { Browser.openTab("options.html#certificate"); };
  document.querySelector('#btn-delegate').onclick = (e) => { Browser.openTab("options.html#delegate"); };

  load_youid_list();
});


function Prefs_exec()
{
  Browser.openTab("options.html")
  return false;
}

async function load_popup()
{
    await v_youid.load_youid_list();
}

