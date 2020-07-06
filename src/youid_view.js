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

var ttl_nano_pattern = /(## (Nanotation|Turtle) +Start ##)((.|\n|\r)*?)(## (Nanotation|Turtle) +(End|Stop) ##)(.*)/gmi;
var jsonld_nano_pattern = /(## JSON-LD +Start ##)((.|\n|\r)*?)((## JSON-LD +(End|Stop) ##))(.*)/gmi;
var rdf_nano_pattern = /(## RDF(\/|-)XML +Start ##)((.|\n|\r)*?)((## RDF(\/|-)XML +(End|Stop) ##))(.*)/gmi;


YouId_View = function(is_popup) {
  this.is_popup = is_popup;
  this.gPref = new Settings();
  this.cur_webid;
  this.webid_list = [];
}

YouId_View.prototype = {
  create_youid_item: function (youid, sel)
  {
    function mk_row_str(_name_href, _name, _str)
    {
      if (_str)
        return `<tr class="dtext">
                  <td valign="top" class="dtext_col1">
                    <a href="${_name_href}" class="uri">${_name}</a>
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
                        `<a href="${_href}" class="uri">${_href}</a>`);
      else
        return '';
    }

    var cls = sel ? ' class="youid_item youid_checked"' 
                  : ' class="youid_item"';
    var checked = sel ? ' checked="checked"':' ';
    var mdata = encodeURI(JSON.stringify(youid, undefined, 2));
    var uri = youid.id ? `<a href="${youid.id}" class="uri">${youid.id}</a>` : '';

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

    if (youid.behalfOf && youid.behalfOf.length>0) {
      var val = ""
      for(var i=0; i< youid.behalfOf.length; i++) {
        var href = youid.behalfOf[i] ? `<a href="${youid.behalfOf[i]}" class="uri">${youid.behalfOf[i]}</a>` 
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
        var href = youid.foaf_knows[i] ? `<a href="${youid.foaf_knows[i]}" class="uri">${youid.foaf_knows[i]}</a>` 
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
        var href = youid.acl[i] ? `<a href="${youid.acl[i]}" class="uri">${youid.acl[i]}</a>` 
                                : '';
        val += `<div>${href}</div>`;
      }
      det += mk_row_str('http://www.w3.org/ns/auth/acl#delegates',
                        'Delegates',
                        val);
    }

    var item = `
     <table ${cls} id="data" mdata="${mdata}" > 
       <tr> 
         <td style="width:20px">
           <input id="chk" class="youid_chk" type="checkbox" ${checked}>
         </td> 
         <td class="ltext">${youid.name}
         </td> 
       </tr> 
       <tr> 
         <td> 
           <input type="image" class="refresh_youid" src="lib/css/img/refresh.png" width="21" height="21" title="Refresh YouID details"> 
         </td> 
         <td class="itext">
           ${uri}
         </td> 
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
         <td>
         </td> 
         <td> 
           <table class="dettable" > 
            ${det} 
           </table> 
         </td> 
       </tr> 
     </table>`;
    return item;
  },

  load_youid_list: function ()
  {
    var pref_youid = null;
    var list = [];
    var self = this;

    try {
      var v = this.gPref.getValue("ext.youid.pref.id");
      if (v)
        pref_youid = JSON.parse(v);
    } catch(e){}

    try {
      var v = this.gPref.getValue("ext.youid.pref.list");
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
  },

  addYouIdItem: function (youid, sel)
  {
    var self = this;
    for(var i=0; i < self.webid_list.length; i++) {
      if (youid.id === self.webid_list[i]) {
        alert("WebID: "+youid.id+" existed already in the list.");
        return;
      }
    }
    var s = this.create_youid_item(youid, sel);
    var tbody = DOM.qSel('#youid_tbl tbody');
//    $('.youid_list').append('<tr><td>'+DOMPurify.sanitize(s,{SAFE_FOR_JQUERY: true, ADD_ATTR: ['mdata']})+'</td></tr>');
    var r = tbody.insertRow(-1);
    r.innerHTML = '<td>'+s+'</td>';

    r.querySelector('.det_btn').onclick = (e) => { self.click_det(e); };
    r.querySelector('.youid_chk').onclick = (e) =>{ return self.select_youid_item(e); };
    r.querySelector('.uri').onclick = (e) => { return self.click_uri(e);};
    r.querySelector('.remove_youid').onclick = (e) => { return self.click_remove_youid(e);};
    r.querySelector('.refresh_youid').onclick = (e) => { return self.click_refresh_youid(e);}

  },

  updateYouIdItem: function (row, youid)
  {
    var self = this;
    var pref_youid = null;

    try {
      var v = this.gPref.getValue("ext.youid.pref.id");
      if (v)
        pref_youid = JSON.parse(v);
    } catch(e){}

    var sel = pref_youid && pref_youid.id === youid.id;
    var s = this.create_youid_item(youid, sel);

    var td = row.querySelector('td');
    td.innerHTML = s;

    row.querySelector('.det_btn').onclick = (e) => { self.click_det(e); };
    row.querySelector('.youid_chk').onclick = (e) =>{ return self.select_youid_item(e); };
    row.querySelector('.uri').onclick = (e) => { return self.click_uri(e);};
    row.querySelector('.remove_youid').onclick = (e) => { return self.click_remove_youid(e);};
    row.querySelector('.refresh_youid').onclick = (e) => { return self.click_refresh_youid(e);}
  },

  click_det: function (e)
  {
    var el = e.target;
    var det_data = el.closest('table.youid_item').querySelector('tr.det_data');
     
    det_data.classList.toggle('hidden');
    if (det_data.classList.contains('hidden'))
      el.src = "lib/css/img/plus.png"
    else
      el.src = "lib/css/img/minus.png"

    return false;
  },


  select_youid_item: function (ev)
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
  },

  click_uri: function (e)
  {
    var href = e.target.href;
    if (href)
      Browser.openTab(href);
    return false;
  },

  click_remove_youid: function (e)
  {
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
       Msg.showYN("Do you want to drop YouID item ?",youid.name, function(){
          row.remove();
          for(var i=0; i < self.webid_list.length; i++) {
            if (youid.id === self.webid_list[i]) {
              self.webid_list.splice(i,1);
              break;
            }
          }
          if (self.is_popup)
            self.save_youid_data();
       });
    }

    return true;
  },

  click_refresh_youid: function (e)
  {
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
       Msg.showYN("Do you want to reload YouID item data ?",youid.name, function(){
         self.verify1_youid_exec(null, youid.id, row);
       });
    }

    return true;
  },


  click_add_youid: function ()
  {
    var self = this;

    var btnOk = DOM.qSel('#add-dlg #btn-ok');
    btnOk.onclick = async () =>
       {
         var uri = $('#add-dlg #uri').val().trim();
         var url = new URL(uri);
         url.hash = '';
         url = url.toString();
         var url_lower = url.toLowerCase();
         if (url_lower.endsWith(".html") || url_lower.endsWith(".htm"))
           {
             var data;
             try {
               var rc = await fetch(url, {credentials: 'include'});
               if (!rc.ok) {
                 $('#add-dlg').modal('hide');
                 Msg.showInfo("Could not load URL "+url);
                 return;
               }
               data = await rc.text();
               var parser = new DOMParser();
               var doc = parser.parseFromString(data, 'text/html');
               var idata = sniff_doc_data(doc, uri);
               $('#add-dlg').modal('hide');
               self.verify1_youid_exec(idata, null, null);

             } catch(e) {
                $('#add-dlg').modal('hide');
                Msg.showInfo("Error:"+e+" for load URL "+uri);
                return;
             }
           }
         else if (url_lower.endsWith(".txt"))
           {
             var data;
             try {
               var rc = await fetch(url, {credentials: 'include'});
               if (!rc.ok) {
                 $('#add-dlg').modal('hide');
                 Msg.showInfo("Could not load URL "+url);
                 return;
               }
               data = await rc.text();
               var idata = sniff_text_data(data, uri);
               $('#add-dlg').modal('hide');
               self.verify1_youid_exec(idata, null, null);

             } catch(e) {
                $('#add-dlg').modal('hide');
                Msg.showInfo("Error:"+e+" for load URL "+uri);
                return;
             }
           }
         else
           {
             $('#add-dlg').modal('hide');
             self.verify1_youid_exec(null, uri, null);
           }
       };

    var dlg = $('#add-dlg .modal-content');
    dlg.width(620);
    $('#add-dlg').modal('show');

    return false;
  },


  save_youid_data: function ()
  {
    var pref_youid = "";
    var list = [];

    var tbody = DOM.qSel('#youid_tbl tbody');
    var lst = tbody.querySelectorAll('table.youid_item');
    
    for (var i=0; i < lst.length; i++) {
      var r = lst[i];
      var checked = r.querySelector('.youid_chk').checked;

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
    this.gPref.setValue('ext.youid.pref.list', JSON.stringify(list, undefined, 2));
    this.gPref.setValue('ext.youid.pref.id', JSON.stringify(pref_youid, undefined, 2));
  },



  verify1_youid_exec: async function (idata, uri, row)
  {
    var self = this;
    var _webid;
    var _success = false;

    $("#verify1-dlg #verify_progress").show();
    $("#verify1-dlg #verify-msg").prop("textContent","");
    $('#verify1-dlg #verify-tbl-place').children().remove();
    $("#verify1-dlg #btn-ok").hide();
    $("#verify1-dlg #verify-webid-lst").hide();
    $("#verify1-dlg #verify-pkey-lst").hide();

    var btnOk = DOM.qSel('#verify1-dlg #btn-ok');
    btnOk.onclick =  () =>
       {
         if (_success) {
           if (row)
             self.updateYouIdItem(row, _webid);
           else
             self.addYouIdItem(_webid, false);
           if (self.is_popup)
             self.save_youid_data();
         }
     
         $('#verify1-dlg').modal('hide');
       };

    var dlg = $('#verify1-dlg .modal-content');
    dlg.width(630);
    $('#verify1-dlg').modal('show');

    var lst = [];

    function add_id(rc, out_lst)
    {
      for(var webid in rc) {
        var found = -1;
        var val = rc[webid];
        for(var i=0; i < out_lst.length; i++) {
          if (webid === out_lst[i].id) {
            found = i;
            break;
          }
        }

        if (val.success && val.keys.length > 0) {
          if (found == -1) {
            out_lst.push(val);
          } else {
            var item = out_lst[found];
            for(var i=0; i < val.keys.length; i++) {
              var add = true;
              for(var j=0; j < item.keys.length; j++) {
                if (item.keys[i].pubkey_url === val.keys[i].pubkey_uri)
                  add = false;
              }
              if (add)
                item.keys.push(val.keys[i]);
            }
          }
        }
      }
    }

    if (idata) {
      for(var i=0; i<idata.ttl.length; i++) {
        try {
           var data = idata.ttl[i];
           var loader = new YouID_Loader();
           var rc = await loader.parse_data(data, 'text/turtle', idata.baseURI);
           add_id(rc, lst);
        } catch (e) { console.log(e); }
      }
      for(var i=0; i<idata.ldjson.length; i++) {
        try {
           var data = idata.ldjson[i];
           var loader = new YouID_Loader();
           var rc = await loader.parse_data(data, 'application/ld+json', idata.baseURI);
           add_id(rc, lst);
        } catch (e) { console.log(e); }
      }
      for(var i=0; i<idata.rdfxml.length; i++) {
        try {
           var data = idata.rdfxml[i];
           var loader = new YouID_Loader();
           var rc = await loader.parse_data(data, 'application/rdf+xml', idata.baseURI);
           add_id(rc, lst);
        } catch (e) { console.log(e); }
      }
    } else {
      try {
        var loader = new YouID_Loader();
        var rc = await loader.verify_ID_1(uri)
        add_id(rc, lst);
      } catch (e) { console.log(e); }
    }


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
         Msg.showInfo("Could not found any valid WebId relations");
       }

    } catch(err) {
       $('#verify1-dlg').modal('hide');
       Msg.showInfo(err.message);
    }
  },





}

