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
  init();
});

async function init()
{
	gPref = new Settings();

        DOM.iSel("c_year").innerText = new Date().getFullYear();

        v_youid = new YouId_View(false);
        v_cert = new Certificate();

        DOM.qSel('#add_youid').onclick = (e) => { v_youid.click_add_youid(e); };
        DOM.qSel('#add_certid').onclick = (e) => { v_youid.click_add_certid(e); };

        DOM.qSel('#hdr_add').onclick = (e) => { hdr_add() }
        $('#hdr_add').button({
          icons: { primary: 'ui-icon-plusthick' },
          text: false
        });


	// Tabs
	DOM.qSel('#tabs a[href="#webid"').onclick = (e) => {
          selectTab('#webid');
          return false;
	}
	DOM.qSel('#tabs a[href="#certificate"').onclick = (e) => {
          selectTab('#certificate');
          v_cert.click_gen_cert(v_youid.cur_webid);
          return false;
	}
	DOM.qSel('#tabs a[href="#delegate"').onclick = (e) => {
          selectTab('#delegate');
          v_cert.showTab_delegate('#delegate-tab');
          return false;
	}
	DOM.qSel('#tabs a[href="#accounts"').onclick = (e) => {
          selectTab('#accounts');
          return false;
	}
	DOM.qSel('#tabs a[href="#headers"').onclick = (e) => {
          selectTab('#headers');
          return false;
	}
	DOM.qSel('#tabs a[href="#about"').onclick = (e) => {
          selectTab('#about');
          return false;
	}

        selectTab('#webid');

        await loadPref();

        DOM.iSel('OK_btn').onclick = (e) => { savePref() }
        DOM.iSel('Cancel_btn').onclick = (e) => { closeOptions() }

        DOM.qSel('#announce #btn-reset-announce').onclick = (e) => {
           DOM.qSel('#announce #message-text').value = gPref.getDef_Fingerprint();
        }


        DOM.qSel('#ext_ver').innerText = 'Version: '+ Browser.api.runtime.getManifest().version;
        var url = new URL(location.href);

        if (url.hash == '#certificate') {
          selectTab('#certificate');
          v_cert.click_gen_cert(v_youid.cur_webid);
        } else if (url.hash == '#delegate') {
          selectTab('#delegate');
          v_cert.showTab_delegate('#delegate-tab');
        } else if (url.hash == '#add_youid') {
          selectTab('#webid');
          v_youid.click_add_youid();
        }
}



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
  updateTab('#delegate', selectedTab);
  updateTab('#accounts', selectedTab);
  updateTab('#headers', selectedTab);
  updateTab('#about', selectedTab);
}


function closeOptions()
{
    if (Browser.is_ff) {
      Browser.api.tabs.getCurrent(function(tab) {
        Browser.api.tabs.remove(tab.id);
      });
    } else {
      window.close();
    }
}



async function loadPref()
{
    var hdr_list = [];

    await v_youid.load_youid_list();

    try {
      var v = await gPref.getValue('ext.youid.pref.hdr_list');
      if (v)
        hdr_list = JSON.parse(v);
    } catch(e){}

    load_hdr_list(hdr_list);

    
    DOM.qSel('#s3_account #c_s3_access_key').value = await gPref.getValue('ext.youid.s3_access_key');
    DOM.qSel('#s3_account #c_s3_secret_key').value = await gPref.getValue('ext.youid.s3_secret_key');
    DOM.qSel('#s3_account #c_s3_bucket').value = await gPref.getValue('ext.youid.s3_bucket');

    DOM.qSel('#az_account #c_az_account').value = await gPref.getValue('ext.youid.s3_account');
    DOM.qSel('#az_account #c_az_sas_token').value = await gPref.getValue('ext.youid.s3_sas_token');

    var v = await gPref.getValue('ext.youid.pref.ann_message');
    if (!v || v.length < 1)
      v = gPref.getDef_Fingerprint();
    
    DOM.qSel('#announce #message-text').value = v;
}



async function savePref()
{
   v_youid.save_youid_data();
   await save_hdr_list();

   await gPref.setValue('ext.youid.s3_access_key', DOM.qSel('#s3_account #c_s3_access_key').value);
   await gPref.setValue('ext.youid.s3_secret_key', DOM.qSel('#s3_account #c_s3_secret_key').value);
   await gPref.setValue('ext.youid.s3_bucket', DOM.qSel('#s3_account #c_s3_bucket').value);

   await gPref.setValue('ext.youid.s3_account', DOM.qSel('#az_account #c_az_account').value);
   await gPref.setValue('ext.youid.s3_sas_token', DOM.qSel('#az_account #c_az_sas_token').value);

   await gPref.setValue('ext.youid.pref.ann_message', DOM.qSel('#announce #message-text').value);

   Browser.api.runtime.sendMessage({ cmd: 'settings_updated'});
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


async function save_hdr_list()
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

  await gPref.setValue('ext.youid.pref.hdr_list', JSON.stringify(list, undefined, 2));
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

