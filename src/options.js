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
var v_youid = null;
var v_cert = null;
var prevSelectedTab = null;
var selectedTab = null;

$(function(){
	gPref = new Settings();

        v_youid = new YouId_View(false);
        v_cert = new Certificate();

        $('#add_youid')
          .click((e) => {
             v_youid.click_add_youid(e);
          });


        $('#hdr_add').click(hdr_add);
        $('#hdr_add').button({
          icons: { primary: 'ui-icon-plusthick' },
          text: false
        });


	// Tabs
        $('#tabs a[href="#webid"').click(() => {
          selectTab('#webid');
          return false;
        });
        $('#tabs a[href="#certificate"').click(() => {
          selectTab('#certificate');
          v_cert.click_gen_cert(v_youid.cur_webid);
          return false;
        });
        $('#tabs a[href="#accounts"').click(() => {
          selectTab('#accounts');
          return false;
        });
        $('#tabs a[href="#headers"').click(() => {
          selectTab('#headers');
          return false;
        });
        $('#tabs a[href="#about"').click(() => {
          selectTab('#about');
          return false;
        });
        selectTab('#webid');

        loadPref();

        $('#OK_btn').click(savePref);
        $('#Cancel_btn').click(function() {
            closeOptions();
         });


        $('#ext_ver').text('Version: '+ Browser.api.runtime.getManifest().version);
        var url = new URL(location.href);

        if (url.hash == '#certificate') {
          selectTab('#certificate');
          v_cert.click_gen_cert(v_youid.cur_webid);
        } else if (url.hash == '#add_youid') {
          selectTab('#webid');
          v_youid.click_add_youid();
        }
});


function selectTab(tab)
{
  prevSelectedTab = selectedTab;
  selectedTab = tab;

  function updateTab(tab, selTab)
  {
    var tab_data = $(tab+'_items');
    var tab_id = $('#tabs a[href="'+tab+'"]');

    if (selTab===tab) {
      tab_data.show()
      tab_id.addClass('selected');
    } else {
      tab_data.hide()
      tab_id.removeClass('selected');
    }
  }

  updateTab('#webid', selectedTab);
  updateTab('#certificate', selectedTab);
  updateTab('#accounts', selectedTab);
  updateTab('#headers', selectedTab);
  updateTab('#about', selectedTab);
}


function closeOptions()
{
    if (Browser.isFirefoxWebExt) {
      Browser.api.tabs.getCurrent(function(tab) {
        Browser.api.tabs.remove(tab.id);
      });
    } else {
      window.close();
    }
}

function loadPref()
{
    var hdr_list = [];

    v_youid.load_youid_list();

    try {
      var v = gPref.getValue('ext.youid.pref.hdr_list');
      if (v)
        hdr_list = JSON.parse(v);
    } catch(e){}

    load_hdr_list(hdr_list);

    
    DOM.qSel('#s3_account #c_s3_access_key').value = gPref.getValue('ext.youid.s3_access_key');
    DOM.qSel('#s3_account #c_s3_secret_key').value = gPref.getValue('ext.youid.s3_secret_key');
    DOM.qSel('#s3_account #c_s3_bucket').value = gPref.getValue('ext.youid.s3_bucket');

    DOM.qSel('#az_account #c_az_account').value = gPref.getValue('ext.youid.s3_account');
    DOM.qSel('#az_account #c_az_sas_token').value = gPref.getValue('ext.youid.s3_sas_token');

}



function savePref()
{
   v_youid.save_youid_data();
   save_hdr_list();

   gPref.setValue('ext.youid.s3_access_key', DOM.qSel('#s3_account #c_s3_access_key').value);
   gPref.setValue('ext.youid.s3_secret_key', DOM.qSel('#s3_account #c_s3_secret_key').value);
   gPref.setValue('ext.youid.s3_bucket', DOM.qSel('#s3_account #c_s3_bucket').value);

   gPref.setValue('ext.youid.s3_account', DOM.qSel('#az_account #c_az_account').value);
   gPref.setValue('ext.youid.s3_sas_token', DOM.qSel('#az_account #c_az_sas_token').value);

   closeOptions();
}



// ========== hdr List ===========

function createHdrRow(row)
{
  if (!row)
    return;
  var del = '<button id="hdr_del" class="hdr_del">'
           +' <input type="image" src="lib/css/img/minus.png" width="12" height="12">'  
           +'</button>';
  return '<tr><td width="16px">'+del+'</td>'
        +'<td ><input style="WIDTH: 98%" id="h" value="'+row.hdr+'"></td>'
        +'<td ><input style="WIDTH: 98%" id="v" value="'+row.val+'"></td>'
        +'</tr>';

}

function addHdrItem(v)
{
  var tbody = DOM.qSel('#hdr_tbl tbody')
  var r = tbody.insertRow(-1);
  r.innerHTML = createHdrRow(v);
  r.querySelector('.hdr_del').onclick = (ev) => {
     var row = ev.target.closest('tr');
     row.remove();
    };
}


function emptyHdrLst()
{
  var tbody = DOM.qSel('#hdr_tbl tbody')
  tbody.innerHTML = ''
}

function hdr_add() {
    addHdrItem({hdr:"", val:""});
}


function load_hdr_list(params)
{
  emptyHdrLst();

  for(var i=0; i<params.length; i++) {
    addHdrItem(params[i]);
  }

  if (params.length == 0)
    hdr_add();
}

function save_hdr_list()
{
  var list = [];
  var tbody = DOM.qSel('#hdr_tbl tbody')
  var rows = tbody.querySelectorAll('tr');
  for(var i=0; i < rows.length; i++) {
    var r = rows[i];

    var h = r.querySelector('#h').value;
    var v = r.querySelector('#v').value;
    if (h.length>0 && v.length>0)
       list.push({hdr:h, val:v});
  }

  gPref.setValue('ext.youid.pref.hdr_list', JSON.stringify(list, undefined, 2));
}




Browser.api.runtime.onMessage.addListener(async function(request, sender, sendResponse)
{
  try {
    if (request.cmd === "store_updated" && request.key === "oidc.session")
    {
      v_cert.oidc_changed(); 
    }
    else
    {
      sendResponse({}); 
    }
  } catch(e) {
    console.log("OSDS: onMsg="+e);
  }

});

