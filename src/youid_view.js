/*
 *  This file is part of the OpenLink YouID
 *
 *  Copyright (C) 2015-2018 OpenLink Software
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



YouId_View = function(is_popup) {
  this.is_popup = is_popup;
  this.gPref = new Settings();
}

YouId_View.prototype = {
  create_youid_item: function (youid, sel)
  {
    function mk_row_str(_name_href, _name, _str)
    {
      return `<tr class="dtext">
                <td valign="top" class="dtext_col1">
                  <a href="${_name_href}" class="uri">${_name}</a>
                </td>
                <td>
                  ${_str}
                </td>
               </tr> `;
    }

    function mk_row_href(_name_href, _name, _href)
    {
      return mk_row_str(_name_href, 
                        _name, 
                        `<a href="${_href}" class="uri">${_href}</a>`);
    }



    var cls = sel ? ' class="youid_item youid_checked"' 
                  : ' class="youid_item"';
    var checked = sel ? ' checked="checked"':' ';
    var mdata = encodeURI(JSON.stringify(youid, undefined, 2));
    var uri = youid.id ? `<a href="${youid.id}" class="uri">${youid.id}</a>` : '';

    var det = "";

    if (youid.pubkey) {
      det += mk_row_href('http://www.w3.org/ns/auth/cert#key',
                         'PubKey',
                         youid.pubkey);
    }
    if (youid.alg) {
      det += mk_row_href('http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                         'Algorithm',
                         youid.alg);
    }
    if (youid.exp) {
      det += mk_row_str('http://www.w3.org/ns/auth/cert#exponent',
                        'Exponent',
                        youid.exp);
    }
    if (youid.mod) {
      det += mk_row_str('http://www.w3.org/ns/auth/cert#modulus',
                        'Modulus',
                        youid.mod);
    }
    if (youid.delegate) {
      det += mk_row_href('http://www.openlinksw.com/schemas/cert#hasIdentityDelegate',
                         'Delegate',
                         youid.delegate);
    }
    if (youid.pim) {
      det += mk_row_href('http://www.w3.org/ns/pim/space#storage',
                         'Storage',
                         youid.pim);
    }
    if (youid.inbox) {
      det += mk_row_href('http://www.w3.org/ns/ldp#inbox',
                         'Inbox',
                         youid.inbox);
    }

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
       <tr class="det_data" style="display:none"> 
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

    $.each(list, function (i, item) {
        var sel = pref_youid && pref_youid.id === item.id;
        self.addYouIdItem(item, sel);
    });
  },

  addYouIdItem: function (youid, sel)
  {
    var self = this;
    var s = this.create_youid_item(youid, sel);
    $('.youid_list').append('<tr><td>'+DOMPurify.sanitize(s,{SAFE_FOR_JQUERY: true, ADD_ATTR: ['mdata']})+'</td></tr>');

    var tr = $('.youid_list > tr:last-child');
    
    tr.find('.det_btn').click(function(e){ return self.click_det(e);})
    tr.find('.youid_chk').click(function(e){ return self.select_youid_item(e);})
    tr.find('.uri').click(function(e){ return self.click_uri(e);})
    tr.find('.remove_youid').click(function(e){ return self.click_remove_youid(e);})
    tr.find('.refresh_youid').click(function(e){ return self.click_refresh_youid(e);})
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
    row.children("td:first").children().remove();
    row.children("td:first").append(s);

    row.find('.det_btn').click(function(e){ return self.click_det(e);})
    row.find('.youid_chk').click(function(e){ return self.select_youid_item(e);})
    row.find('.uri').click(function(e){ return self.click_uri(e);})
    row.find('.remove_youid').click(function(e){ return self.click_remove_youid(e);})
    row.find('.refresh_youid').click(function(e){ return self.click_refresh_youid(e);})
  },

  click_det: function (e)
  {
    var el = $(e.target);

    var det_data = el.parents('table.youid_item').find('tr.det_data');
    var is_visible = det_data.is(":visible");
    if (is_visible) {
      det_data.hide();
      el.attr("src","lib/css/img/plus.png");
    }
    else {
      det_data.show();
      el.attr("src","lib/css/img/minus.png");
    }
    return false;
  },


  select_youid_item: function (e)
  {
    var checked = $(e.target).is(':checked');
    if (checked) {
      var lst = $('.youid_chk');

      for(var i=0; i < lst.length; i++) {
        if (lst[i] !== e.target) {
          lst[i].checked = false;
          var tbl = $(lst[i]).parents('table.youid_item');
          $(tbl).toggleClass("youid_checked", false);
        }
      }

      var tbl = $(e.target).parents('table.youid_item');
      $(tbl).toggleClass("youid_checked", true);

    }
    else {
      var tbl = $(e.target).parents('table.youid_item');
      $(tbl).toggleClass("youid_checked", false);
    }

    if (this.is_popup) {
      this.save_youid_data();
      window.close();
    }

    return true;
  },

  click_uri: function (e)
  {
    var href = $(e.target).attr("href");
    if (href)
      Browser.openTab(href);
    return false;
  },

  click_remove_youid: function (e)
  {
    var self = this;
    var data = $(e.target).parents('table:first');
    var row = data.parents('tr:first');
    var youid = null;
    try {
      var str = data.attr('mdata');
      youid = JSON.parse(decodeURI(str));
    } catch(e) {
      console.log(e);
    }

    if (youid!=null) {
       Msg.showYN("Do you want to drop YouID item ?",youid.name, function(){
          $(row).remove();
          if (self.is_popup)
            self.save_youid_data();
       });
    }

    return true;
  },

  click_refresh_youid: function (e)
  {
    var self = this;
    var data = $(e.target).parents('table:first');
    var row = data.parents('tr:first');
    var youid = null;
    try {
      var str = data.attr('mdata');
      youid = JSON.parse(decodeURI(str));
    } catch(e) {
      console.log(e);
    }

    if (youid && youid.id) {
       Msg.showYN("Do you want to reload YouID item data ?",youid.name, function(){
         self.verify_youid_exec(youid.id, row);
       });
    }

    return true;
  },

  click_add_youid: function ()
  {
    var self = this;

    var btnOk = document.querySelector('#add-dlg #btn-ok');
    btnOk.onclick = () =>
       {
         var uri = $('#add-dlg #uri').val().trim();
         $('#add-dlg').modal('hide');
         self.verify_youid_exec(uri);
       };

    var dlg = $('#add-dlg .modal-content');
    dlg.width(620);
    $('#add-dlg').modal('show');

    return false;
  },


  verify_youid_exec: function (uri, row)
  {
    var self = this;
    var _youid;
    var _success = false;

    $("#verify-dlg #verify_progress").show();
    $("#verify-dlg #verify-msg").prop("textContent","");
    $('#verify-dlg #verify-tbl-place').children().remove();
    $("#verify-dlg #btn-ok").hide();

    var btnOk = document.querySelector('#verify-dlg #btn-ok');
    btnOk.onclick =  () =>
       {
         if (_success) {
           if (row)
             self.updateYouIdItem(row, _youid);
           else
             self.addYouIdItem(_youid, false);
           if (self.is_popup)
             self.save_youid_data();
         }
     
         $('#verify-dlg').modal('hide');
       };


    var dlg = $('#verify-dlg .modal-content');
    dlg.width(630);
    $('#verify-dlg').modal('show');


    var loader = new YouID_Loader();
    loader.verify_ID(uri)
     .then((ret) => { 
        _youid = ret.youid;
        _success = ret.success;
        $("#verify-dlg #btn-ok").show();
        $("#verify-dlg #verify_progress").hide();
        $("#verify-dlg #verify-msg").prop("textContent",ret.msg);
        $('#verify-dlg #verify-tbl-place').children().remove();
        $('#verify-dlg #verify-tbl-place').append(DOMPurify.sanitize(ret.verify_data));
     })
     .catch(err => {
       $('#verify-dlg').modal('hide');
       Msg.showInfo(err.message);
     });
  },


  save_youid_data: function ()
  {
    var pref_youid = "";
    var list = [];
    var rows = $('.youid_list>tr');
    for(var i=0; i < rows.length; i++) {
      var r = $(rows[i]);
      var checked = r.find('.youid_chk').is(':checked');

      var youid = null;
      try {
        var str = r.find('table').attr("mdata");
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


}

