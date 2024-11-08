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


class YouId_View {
  constructor(is_popup) 
  {
    this.is_popup = is_popup;
    this.gPref = new Settings();
    this.cur_webid;
    this.webid_list = [];
    this.gOidc = new OidcWeb();
  }

  create_youid_item(youid, sel)
  {
    function mk_row_str(_name_href, _name, _str)
    {
      if (_str)
        return `<tr class="dtext">
                  <td valign="top" class="dtext_col1">
                    <a href="${_name_href}" class="uri" title="${_name_href}" target="_blank">${_name}</a>
                  </td>
                  <td>
                    ${_str}
                  </td>
                 </tr> `;
      else
        return '';
    }

    function mk_row_href(_name_href, _name, _href)
    {
      if (_href)
        return mk_row_str(_name_href, 
                        _name, 
                        `<a href="${_href}" class="uri" target="_blank">${_href}</a>`);
      else
        return '';
    }

    var cls = sel ? ' class="youid_item youid_checked"' 
                  : ' class="youid_item"';
    var checked = sel ? ' checked="checked"':' ';
    var mdata = encodeURI(JSON.stringify(youid, undefined, 2));
    var uri = youid.id ? `<a href="${youid.id}" class="uri" target="_blank">${youid.id}</a>` : '';

    var det = "";

    det += mk_row_href('http://www.w3.org/ns/auth/cert#key',
                         'PubKey',
                         youid.pubkey);
    det += mk_row_href('http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                         'Algorithm',
                         youid.alg);
    det += mk_row_str('http://www.w3.org/ns/auth/cert#exponent',
                        'Exponent',
                        youid.exp);
    det += mk_row_str('http://www.w3.org/ns/auth/cert#modulus',
                        'Modulus',
                        youid.mod);
    det += mk_row_href('http://www.openlinksw.com/schemas/cert#hasIdentityDelegate',
                         'Delegate',
                         youid.delegate);
    det += mk_row_href('http://www.w3.org/ns/pim/space#storage',
                         'Storage',
                         youid.pim);
    det += mk_row_href('http://www.w3.org/ns/ldp#inbox',
                         'Inbox',
                         youid.inbox);

    if (youid.coin == 1) {
      if (youid.id.startsWith('bitcoin:'))
        det += mk_row_href('http://www.openlinksw.com/schemas/pki#PublicKey#P2PKHaddress',
                         'Account Address',
                         youid.coin_addr);
      else
        det += mk_row_href('http://www.openlinksw.com/schemas/pki#PublicKey#Address',
                         'Account Address',
                         youid.coin_addr);

      det += mk_row_href('http://www.openlinksw.com/schemas/pki#PublicKey',
                         'Account PublicKey',
                         youid.coin_pub);
    }


    if (youid.behalfOf && youid.behalfOf.length>0) {
      var val = ""
      for(var i=0; i< youid.behalfOf.length; i++) {
        var href = youid.behalfOf[i] ? `<a href="${youid.behalfOf[i]}" class="uri" target="_blank">${youid.behalfOf[i]}</a>` 
                                     : '';
        val += `<div>${href}</div>`;
      }
      det += mk_row_str('http://www.openlinksw.com/schemas/cert#onBehalfOf',
                        'OnBehalfOf',
                        val);
    }

    if (youid.foaf_knows && youid.foaf_knows.length>0) {
      var val = ""
      for(var i=0; i< youid.foaf_knows.length; i++) {
        var href = youid.foaf_knows[i] ? `<a href="${youid.foaf_knows[i]}" class="uri" target="_blank">${youid.foaf_knows[i]}</a>` 
                                       : '';
        val += `<div>${href}</div>`;
      }
      det += mk_row_str('http://xmlns.com/foaf/0.1/knows',
                        'Knows',
                        val);
    }

    if (youid.acl && youid.acl.length>0) {
      var val = ""
      for(var i=0; i< youid.acl.length; i++) {
        var href = youid.acl[i] ? `<a href="${youid.acl[i]}" class="uri" target="_blank">${youid.acl[i]}</a>` 
                                : '';
        val += `<div>${href}</div>`;
      }
      det += mk_row_str('http://www.w3.org/ns/auth/acl#delegates',
                        'Delegates',
                        val);
    }

    var refresh_btn = '<input type="image" class="refresh_youid" src="lib/css/img/refresh.png" width="21" height="21" title="Refresh YouID details"> ';

    if (youid.coin == 1)
      refresh_btn = ''; 

    return `
       <table ${cls} id="data" mdata="${mdata}" > 
         <tr> 
           <td style="width:20px"> <input id="chk" class="youid_chk" type="checkbox" ${checked}>  </td> 
           <td class="ltext">${youid.name} </td> 
         </tr> 
         <tr> 
           <td style="width:21px"> ${refresh_btn} </td> 
           <td class="itext"> ${uri} </td> 
         </tr> 
         <tr> 
           <td> 
             <input type="image" class="remove_youid" src="lib/css/img/trash.png" width="21" height="21" title="Drop YouID item from list"> 
           </td> 
           <td class="dtext"> 
             <input type="image" class="det_btn" src="lib/css/img/plus.png" width="12" height="12" title="Show details"> 
             Details 
           </td> 
         </tr> 
         <tr class="det_data hidden"> 
           <td> </td> 
           <td> 
             <table class="dettable" > 
              ${det} 
             </table> 
           </td> 
         </tr> 
       </table>`;
  }


  async load_youid_list()
  {
    var pref_youid = null;
    var list = [];
    var self = this;

    try {
      var v = await this.gPref.getValue("ext.youid.pref.id");
      if (v)
        pref_youid = JSON.parse(v);
    } catch(e){}

    try {
      var v = await this.gPref.getValue("ext.youid.pref.list");
      if (v)
        list = JSON.parse(v);
    } catch(e){}

    self.webid_list = [];
    $.each(list, function (i, item) {
        var sel = pref_youid && pref_youid.id === item.id;
        self.addYouIdItem(item, sel);
        self.webid_list.push(item.id);
    });

    if (pref_youid && pref_youid.id)
      this.cur_webid = pref_youid.id;
  }

  addYouIdItem(youid, sel)
  {
    var self = this;
    for(var i=0; i < self.webid_list.length; i++) {
      if (youid.id === self.webid_list[i]) {
        alert("NetID: "+youid.id+" existed already in the list.");
        return;
      }
    }
    var s = this.create_youid_item(youid, sel);
    var tbody = DOM.qSel('#youid_tbl tbody');
//    $('.youid_list').append('<tr><td>'+DOMPurify.sanitize(s,{SAFE_FOR_JQUERY: true, ADD_ATTR: ['mdata']})+'</td></tr>');
    var r = tbody.insertRow(-1);
    r.innerHTML = '<td>'+s+'</td>';

    r.querySelector('.det_btn').onclick = (e) => { self.click_det(e); };

    var el = r.querySelector('.youid_chk');
    if (el)
      el.onclick = (e) =>{ self.select_youid_item(e); };

    r.querySelector('.uri').onclick = (e) => { self.click_uri(e);};
    r.querySelector('.remove_youid').onclick = (e) => { self.click_remove_youid(e);};

    el = r.querySelector('.refresh_youid');
    if (el)
      el.onclick = (e) => { self.click_refresh_youid(e);}

  }


  async updateYouIdItem(row, youid)
  {
    var self = this;
    var pref_youid = null;

    try {
      var v = await this.gPref.getValue("ext.youid.pref.id");
      if (v)
        pref_youid = JSON.parse(v);
    } catch(e){}

    var sel = pref_youid && pref_youid.id === youid.id;
    var s = this.create_youid_item(youid, sel);

    var td = row.querySelector('td');
    td.innerHTML = s;

    row.querySelector('.det_btn').onclick = (e) => { self.click_det(e); };
    row.querySelector('.youid_chk').onclick = async (e) =>{ return await self.select_youid_item(e); };
    row.querySelector('.uri').onclick = (e) => { return self.click_uri(e);};
    row.querySelector('.remove_youid').onclick = async (e) => { return await self.click_remove_youid(e);};
    row.querySelector('.refresh_youid').onclick = (e) => { return self.click_refresh_youid(e);}
  }

  click_det(e)
  {
    e.preventDefault();

    var el = e.target;
    var det_data = el.closest('table.youid_item').querySelector('tr.det_data');
     
    det_data.classList.toggle('hidden');
    if (det_data.classList.contains('hidden'))
      el.src = "lib/css/img/plus.png"
    else
      el.src = "lib/css/img/minus.png"

    return false;
  }


  async select_youid_item(ev)
  {
    var chk = ev.target;

    if (chk.checked) {
      var tbody = DOM.qSel('#youid_tbl tbody');
      var lst = tbody.querySelectorAll('.youid_chk');
      for (var i=0; i < lst.length; i++) {
        if (lst[i] !== chk) {
          lst[i].checked = false;
          var tbl = lst[i].closest('table.youid_item');
          tbl.classList.remove("youid_checked");
        }
      }

      var tbl = chk.closest('table.youid_item');
      tbl.classList.add("youid_checked");

      try {
        var str = tbl.attr("mdata");
        var youid = JSON.parse(decodeURI(str));
        if (youid && youid.id)
          this.cur_webid = youid.id;
      } catch(e) {
      }

    }
    else {
      var tbl = chk.closest('table.youid_item');
      tbl.classList.remove("youid_checked");
    }

    if (this.is_popup) {
      this.save_youid_data();
    }
  }

  click_uri(e)
  {
    e.preventDefault();

    var href = e.target.href;
    if (href)
      Browser.openTab(href);
    return false;
  }


  async click_remove_youid(e)
  {
    e.preventDefault();

    var self = this;
    var row = e.target.closest('table').closest('tr');
    var data = row.querySelector('table');
    var youid = null;
    try {
      var str = data.attributes['mdata'].value;
      youid = JSON.parse(decodeURI(str));
    } catch(e) {
      console.log(e);
    }

    if (youid!=null) {
       Msg.showYN("Do you want to drop NetID item ?",youid.name, async function(){
          row.remove();
          for(var i=0; i < self.webid_list.length; i++) {
            if (youid.id === self.webid_list[i]) {
              self.webid_list.splice(i,1);
              break;
            }
          }
          if (self.is_popup)
            await self.save_youid_data();
       });
    }

    return true;
  }

  click_refresh_youid(e)
  {
    e.preventDefault();

    var self = this;
    var row = e.target.closest('table').closest('tr');
    var data = row.querySelector('table');
    var youid = null;
    try {
      var str = data.attributes['mdata'].value;
      youid = JSON.parse(decodeURI(str));
    } catch(e) {
      console.log(e);
    }

    if (youid && youid.id) {
       Msg.showYN("Do you want to reload YouID item data ?",youid.name, async function(){
         self.load_data_from_uri(youid.id, row);
       });
    }

    return true;
  }


  async load_data_from_uri(uri, row)
  {
    $('#add-dlg').modal('hide');
    this.verify1_youid_exec(uri, row);
  }


  click_add_youid(e)
  {
    if (e)
      e.preventDefault();

    var self = this;

    var btnOk = DOM.qSel('#add-dlg #btn-ok');
    btnOk.onclick = async (e) =>
       {
         e.preventDefault();

         var uri = $('#add-dlg #uri').val().trim();
         self.load_data_from_uri(uri, null);
       };

    var dlg = $('#add-dlg .modal-content');
    dlg.width(620);
    $('#add-dlg').modal('show');

    return false;
  }


  async load_data_from_cert(cert)
  {
    $('#add-certid-dlg').modal('hide');
    const rc = Coin.is_coin_cert(cert);
    if (rc.is_coin==0 && rc.san && (rc.san.startsWith('http://') || rc.san.startsWith('https://')))
      this.load_data_from_uri(rc.san, null);
    else
      this.verify1_cert_exec(cert);
  }


  async click_add_certid(e)
  {
    e.preventDefault();

    var self = this;
    var cert_file = null;

    DOM.qSel('#add-certid-dlg #file_data').value = null;

    DOM.qSel('#add-certid-dlg #file_data').onchange = async (e) => {
      if (e.target.files.length > 0) {
        cert_file = e.target.files[0];
        const file = e.target.files[0];
        const ftype = file.type; 
        //p12  application/x-pkcs12
        //pem  application/x-x509-ca-cert
        //der  application/pkix-cert'

        if (ftype === 'application/x-pkcs12')
          DOM.qShow('#add-certid-dlg #cert-pwd');
        else
          DOM.qHide('#add-certid-dlg #cert-pwd');
      }
    };



    var btnOk = DOM.qSel('#add-certid-dlg #btn-ok');
    btnOk.onclick = async (e) =>
       {
         e.preventDefault();

         if (cert_file) {
           try {
           var data = await loadBinaryFile(cert_file);

             if (cert_file.type === 'application/x-pkcs12') {
               //PKCS12
               var bdata = forge.asn1.fromDer(data);
               var pwd = DOM.qSel('#add-certid-dlg #file_pwd').value;
               var pkcs = forge.pkcs12.pkcs12FromAsn1(bdata, true, pwd);
               var bags = pkcs.getBags({bagType: forge.pki.oids.certBag});
               var bag = bags[forge.pki.oids.certBag][0];
               self.load_data_from_cert(bag.cert);
             } 
             else if (cert_file.type === 'application/x-x509-ca-cert') {
                //PEM
               var cert = forge.pki.certificateFromPem(data);
               self.load_data_from_cert(cert);
             }
             else if (cert_file.type === 'application/pkix-cert') {
               //DER
               var bdata = forge.asn1.fromDer(data);
               var cert = forge.pki.certificateFromAsn1(bdata, true);
               self.load_data_from_cert(cert);
             }
             else {
               alert('Unsupported file type');
               return;
             }
           } catch(e) {
             console.log(e);
             alert(e);
           }
         }
       };

    var dlg = $('#add-certid-dlg .modal-content');
    dlg.width(620);
    $('#add-certid-dlg').modal('show');

    return false;
  }


  async save_youid_data()
  {
    var pref_youid = "";
    var list = [];

    var tbody = DOM.qSel('#youid_tbl tbody');
    var lst = tbody.querySelectorAll('table.youid_item');
    
    for (var i=0; i < lst.length; i++) {
      var r = lst[i];
      var el = r.querySelector('.youid_chk');
      var checked = el && el.checked ? true : false;


      var youid = null;
      try {
        var str = r.attributes["mdata"].value;
        youid = JSON.parse(decodeURI(str));
      } catch(e) {
        console.log(e);
      }

      if (youid) {
         list.push(youid);
         if (checked)
           pref_youid = youid;
      }

    }
    await this.gPref.setValue('ext.youid.pref.list', JSON.stringify(list, undefined, 2));
    await this.gPref.setValue('ext.youid.pref.id', JSON.stringify(pref_youid, undefined, 2));

    Browser.api.runtime.sendMessage({ cmd: 'settings_updated'});
  }



  async verify1_youid_exec(uri, row)
  {
    var self = this;
    var _webid;
    var _success = false;

    $("#verify1-dlg #verify_cert_progress").hide();
    $("#verify1-dlg #verify_progress").show();
    $("#verify1-dlg #verify-msg").prop("textContent","");
    $('#verify1-dlg #verify-tbl-place').children().remove();
    $("#verify1-dlg #btn-ok").hide();
    $("#verify1-dlg #verify-webid-lst").hide();
    $("#verify1-dlg #verify-pkey-lst").hide();

    var btnOk = DOM.qSel('#verify1-dlg #btn-ok');
    btnOk.onclick = async (e) =>
       {
         e.preventDefault();

         if (_success) {
           if (row)
             await self.updateYouIdItem(row, _webid);
           else
             self.addYouIdItem(_webid, false);
           if (self.is_popup)
             await self.save_youid_data();
         }
     
         $('#verify1-dlg').modal('hide');
       };

    var dlg = $('#verify1-dlg .modal-content');
    dlg.width(630);
    $('#verify1-dlg').modal('show');

    var lst = [];
    try {
      var loader = new YouID_Loader();
      var rc = await loader.verify_ID(uri, this.gOidc)

      for(var val of rc.id_list) {
        var found = -1;
        for(var i=0; i < lst.length; i++) {
          if (val.id === lst[i].id) {
            found = i;
            break;
          }
        }

        if (val.success && val.keys.length > 0) {
          if (found == -1) {
            lst.push(val);
          } else {
            var item = lst[found];
            for(var i=0; i < val.keys.length; i++) {
              var add = true;
              for(var j=0; j < item.keys.length; j++) {
                if (item.keys[i].pubkey_uri === val.keys[i].pubkey_uri)
                  add = false;
              }
              if (add)
                item.keys.push(val.keys[i]);
            }
          }
        }
      }
    
    } catch (e) { console.log(e); }


    try {
       if (lst.length > 0) {

          _webid = lst[0];
          _success = lst[0].success;

          function update_pkey_list (webid)
          {
            if (webid.keys.length > 1) {
              $("#verify1-dlg #verify-pkey-lst").show();
              var pkey_lst = DOM.qSel('#verify1-dlg #c_pkey_lst');
              pkey_lst.options.length = 0;
              for(var i=0; i < webid.keys.length; i++) {
                var el = document.createElement('option');
                el.text = webid.keys[i].pkey;
                el.value = i;
                pkey_lst.add(el);
              }
            } else {
              $("#verify1-dlg #verify-pkey-lst").hide();
            }
            
            if (webid.keys.length > 0) {
              webid.pubkey = webid.keys[0].pubkey_uri;
              webid.alg = webid.keys[0].alg;
              webid.mod = webid.keys[0].mod;
              webid.exp = webid.keys[0].exp;
            }
          }


          update_pkey_list(_webid);
          
          var pkey_lst = DOM.qSel('#verify1-dlg #c_pkey_lst');
          pkey_lst.onchange = (e) => {
             var sel = parseInt(DOM.qSel('#verify1-dlg #c_pkey_lst option:checked').value);
             var pk = _webid.keys[sel];
             DOM.qSel('#verify1-dlg #pkey_uri').textContent = pk.pubkey_uri;
             DOM.qSel('#verify1-dlg #pkey_alg').textContent = pk.alg;
             DOM.qSel('#verify1-dlg #pkey_mod').textContent = pk.mod;
             DOM.qSel('#verify1-dlg #pkey_exp').textContent = pk.exp;
             _webid.pubkey = pk.pubkey_uri;
             _webid.alg = pk.alg;
             _webid.mod = pk.mod;
             _webid.exp = pk.exp;
          }
          
          if (lst.length > 1) {
            var webid_lst = DOM.qSel('#verify1-dlg #c_webid_lst');
            webid_lst.options.length = 0;
            for(var i=0; i < lst.length; i++) {
              var el = document.createElement('option');
              el.text = lst[i].id;
              el.value = i;
              webid_lst.add(el);
            }
            $("#verify1-dlg #verify-webid-lst").show();
            
            webid_lst.onchange = (e) => {
               var sel = parseInt(DOM.qSel('#verify1-dlg #c_webid_lst option:checked').value);
               $("#verify1-dlg #verify-msg").prop("textContent",lst[sel].msg);
               $('#verify1-dlg #verify-tbl-place').children().remove();
               var html = new YouID_Loader().genHTML_view(lst[sel]);
               $('#verify1-dlg #verify-tbl-place').append(DOMPurify.sanitize(html));
               _webid = lst[sel];
               _success = lst[sel].success;
               update_pkey_list(_webid);
            }

          } 

          $("#verify1-dlg #btn-ok").show();
          $("#verify1-dlg #verify_progress").hide();
          $("#verify1-dlg #verify-msg").prop("textContent",lst[0].msg);
          $('#verify1-dlg #verify-tbl-place').children().remove();
          var html = new YouID_Loader().genHTML_view(lst[0]);
          $('#verify1-dlg #verify-tbl-place').append(DOMPurify.sanitize(html));
       } else {
         $('#verify1-dlg').modal('hide');
         Msg.showInfo("Couldn't find any relations associating this NetID with a Public Key.");
       }

    } catch(err) {
       $('#verify1-dlg').modal('hide');
       Msg.showInfo(err.message);
    }
  }


  async verify1_cert_exec(cert, row)
  {
    var self = this;
    var _certid;
    var _success = false;

    $("#verify1-dlg #verify_progress").hide();
    $("#verify1-dlg #verify_cert_progress").show();
    $("#verify1-dlg #verify-msg").prop("textContent","");
    $('#verify1-dlg #verify-tbl-place').children().remove();
    $("#verify1-dlg #btn-ok").hide();
    $("#verify1-dlg #verify-webid-lst").hide();
    $("#verify1-dlg #verify-pkey-lst").hide();


    var btnOk = DOM.qSel('#verify1-dlg #btn-ok');
    btnOk.onclick = async (e) =>
       {
         e.preventDefault();

         if (_success) {
           self.addYouIdItem(_certid, false);

           if (self.is_popup)
             await self.save_youid_data();
         }
     
         $('#verify1-dlg').modal('hide');
       };


    var dlg = $('#verify1-dlg .modal-content');
    dlg.width(630);
    $('#verify1-dlg').modal('show');

    var rc;
    try {
      rc = Coin.coin_cert_check(cert);
    } catch(e) {
       $('#verify1-dlg').modal('hide');
       Msg.showInfo(e.message);
       return;
    }

    if (rc.rc!= 1) {
       $('#verify1-dlg').modal('hide');
       Msg.showInfo(rc.err);
       return;
    }

    _success = true;
    _certid = {};

    _certid.name = rc.name;
    _certid.id = rc.san;
    _certid.alg = 'http://www.w3.org/ns/auth/cert#RSAPublicKey';
    _certid.mod = rc.mod;
    _certid.exp = rc.exp;
    _certid.coin = 1;
    _certid.coin_pub = rc.pub;
    _certid.coin_addr = rc.addr;

    try {
      $("#verify1-dlg #btn-ok").show();
      $("#verify1-dlg #verify_cert_progress").hide();
      $("#verify1-dlg #verify-msg").prop("textContent", 'Successfully verified.');
      $('#verify1-dlg #verify-tbl-place').children().remove();
      var html = new YouID_Loader().genHTML_cert_view(_certid);
      $('#verify1-dlg #verify-tbl-place').append(DOMPurify.sanitize(html));

    } catch(err) {
       $('#verify1-dlg').modal('hide');
       Msg.showInfo(err.message);
    }
  }
}

