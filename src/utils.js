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

YouID_Loader = function () {

  this.load_webid = `
  PREFIX foaf:<http://xmlns.com/foaf/0.1/> 
  PREFIX schema: <http://schema.org/> 
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
  PREFIX owl:  <http://www.w3.org/2002/07/owl#> 
  PREFIX cert: <http://www.w3.org/ns/auth/cert#> 
  PREFIX oplcert: <http://www.openlinksw.com/schemas/cert#> 
  PREFIX acl: <http://www.w3.org/ns/auth/acl#> 
  PREFIX pim: <http://www.w3.org/ns/pim/space#> 
  PREFIX ldp: <http://www.w3.org/ns/ldp#> 
  PREFIX skos: <http://www.w3.org/2004/02/skos/core#> 
  PREFIX as: <http://www.w3.org/ns/activitystreams#> 
  PREFIX vcard: <http://www.w3.org/2006/vcard/ns#>

  SELECT * WHERE 
    { 
       {{?url foaf:primaryTopic ?webid .} UNION 
        {?url schema:mainEntity ?webid .} 
       }
       {{?webid schema:name ?schema_name} UNION 
        {?webid foaf:name ?foaf_name} UNION 
        {?webid rdfs:label ?rdfs_name} UNION 
        {?webid skos:prefLabel ?skos_prefLabel} UNION 
        {?webid skos:altLabel ?skos_altLabel} UNION 
        {?url schema:name ?schema_name} UNION 
        {?url foaf:name ?foaf_name} UNION 
        {?url rdfs:label ?rdfs_name} UNION 
        {?url skos:prefLabel ?skos_prefLabel} UNION 
        {?url skos:altLabel ?skos_altLabel} 
       } 
    }`;
  
  this.webid_details = `
  PREFIX foaf:<http://xmlns.com/foaf/0.1/> 
  PREFIX schema: <http://schema.org/> 
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
  PREFIX owl:  <http://www.w3.org/2002/07/owl#> 
  PREFIX cert: <http://www.w3.org/ns/auth/cert#> 
  PREFIX oplcert: <http://www.openlinksw.com/schemas/cert#> 
  PREFIX acl: <http://www.w3.org/ns/auth/acl#> 
  PREFIX pim: <http://www.w3.org/ns/pim/space#> 
  PREFIX ldp: <http://www.w3.org/ns/ldp#> 
  PREFIX skos: <http://www.w3.org/2004/02/skos/core#> 
  PREFIX as: <http://www.w3.org/ns/activitystreams#> 
  PREFIX vcard: <http://www.w3.org/2006/vcard/ns#>

  SELECT * WHERE 
    { 
       { <#{webid}> oplcert:hasIdentityDelegate ?delegate . } UNION
       { <#{webid}> oplcert:onBehalfOf ?behalfOf . } UNION
       { <#{webid}> acl:delegates ?acl_delegates . } UNION
       { <#{webid}> pim:storage ?pim_store . } UNION
       { <#{webid}> ldp:inbox ?inbox . } UNION
       { <#{webid}> as:outbox ?outbox . } UNION
       { <#{webid}> foaf:knows ?knows . } UNION
       { <#{webid}> foaf:mbox ?foaf_mbox . } UNION
       { <#{webid}> vcard:email ?vcard_email . } UNION
       { <#{webid}> schema:email ?schema_email . }
    }`;

  
  this.load_pubkey = `
  PREFIX dcterms: <http://purl.org/dc/terms/> 
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
  PREFIX cert: <http://www.w3.org/ns/auth/cert#> 
  PREFIX foaf: <http://xmlns.com/foaf/0.1/> 
  PREFIX vcard: <http://www.w3.org/2006/vcard/ns#>
  PREFIX schema: <http://schema.org/> 

  SELECT * WHERE 
    { 
      {
       <#{webid}> cert:key ?pubkey .
       ?pubkey a ?alg ;
              cert:modulus  ?cert_mod ;
              cert:exponent ?cert_exp .
      }
       OPTIONAL { ?pubkey dcterms:created ?key_cr_dt . }
       OPTIONAL { ?pubkey dcterms:title   ?key_cr_title . }
       OPTIONAL { ?pubkey rdfs:label ?key_label . }
    }`;

};

YouID_Loader.prototype = {
  parse_data: async function(data, content_type, baseURI)
  {
    var self = this;
    var store = await (this.load_data(baseURI, data, content_type)
            .catch(err => {
              throw new Error("Could not parse data from: "+baseURI+"\nError: "+err);
            }));
    return await self.exec_verify_query_1(store, {data, content_type, baseURI});
  },


  verify_ID_1 : async function(uri, oidc_fetch) {
    var self = this;
    var baseURI = new URL(uri);
        baseURI.hash = '';
        baseURI = baseURI.toString();

    var url_lower = baseURI.toLowerCase();
    var data, content_type;

    if (url_lower.endsWith(".html") || url_lower.endsWith(".htm")) {
      var rc = await fetch(baseURI, {credentials: 'include'});
      if (!rc.ok) {
        throw new Error("Could not load data from: "+baseURI);
      }
      data = await rc.text();
      content_type = 'text/html';
    }
    else if (url_lower.endsWith(".txt")) {
      var rc = await fetch(baseURI, {credentials: 'include'});
      if (!rc.ok) {
        throw new Error("Could not load data from: "+baseURI);
      }
      data = await rc.text();
      content_type = 'text/plain';
    }
    else {
      var get_url = uri + ((/\?/).test(uri) ? "&" : "?") + (new Date()).getTime();
      var rc = await (this.getProfile(get_url, oidc_fetch)
            .catch(err => {
              throw new Error("Could not load data from: "+uri+"\nError: "+err);
            }));
      data = rc.data;
      content_type = rc.content_type;
    }

    async function get_data(out, data, content_type, baseURI)
    {
      try {
        var ret = await self.parse_data(data, content_type, baseURI);
        for(var webid in ret) {
          var val = ret[webid];
          if (val.success) {
            var add = true;
            for (var item of out) {
              if (item.id === val.id && item.name === val.name) {
                 add = false;
            
                 for(var i=0; i < val.keys.length; i++) {
                   var add_key = true;
                   for(var j=0; j < item.keys.length; j++) {
                     if (item.keys[j].pubkey_uri === val.keys[i].pubkey_uri && item.keys[j].mod === val.keys[i].mod)
                       add_key = false;
                   }
                   if (add_key)
                     item.keys.push(val.keys[i]);
                 }
              }
            }
            if (add)
              out.push(val); 
          }
        }
        return out;
      } catch(e) {
        return out;
      }
    }

    var rc = [];
    if (content_type.indexOf('text/plain') != -1) {
       
       var idata = sniff_text_data(data, baseURI); //idata = {ttl:[], ldjson, rdfxml:[]}

       for(var i=0; i<idata.ldjson.length; i++) {
         rc = await get_data(rc, idata.ldjson[i], 'application/ld+json', idata.baseURI);
       }
       for(var i=0; i<idata.ttl.length; i++) {
         rc = await get_data(rc, idata.ttl[i], 'text/turtle', idata.baseURI);
       }
       for(var i=0; i<idata.rdfxml.length; i++) {
         rc = await get_data(rc, idata.rdfxml[i], 'application/rdf+xml', idata.baseURI);
       }

    } else if (content_type.indexOf('text/html') != -1) {
       
       var parser = new DOMParser();
       var doc = parser.parseFromString(data, 'text/html');
       var idata = sniff_doc_data(doc, baseURI);

       for(var i=0; i<idata.ldjson.length; i++) {
         rc = await get_data(rc, idata.ldjson[i], 'application/ld+json', idata.baseURI);
       }
       for(var i=0; i<idata.ttl.length; i++) {
         rc = await get_data(rc, idata.ttl[i], 'text/turtle', idata.baseURI);
       }
       for(var i=0; i<idata.rdfxml.length; i++) {
         rc = await get_data(rc, idata.rdfxml[i], 'application/rdf+xml', idata.baseURI);
       }

    } else {

      var store = await (this.load_data(baseURI, data, content_type)
            .catch(err => {
              throw new Error("Could not parse data from: "+uri+"\nError: "+err);
            }));

      var ret = await self.exec_verify_query_1(store, {data, content_type, baseURI});
      for(var webid in ret) {
        var data = ret[webid];
        rc.push(data); 
      }
    }

    return rc;
  },



  exec_verify_query_1 : async function(store, profile) {
    var self = this;

    var ret;
    var i = 0;

    while(i < 3) {
      try {
        ret = await this.exec_query(store, self.load_webid);
        if (!ret.err && (ret.results && ret.results.length==0) && i < 3) {
          i++;
          continue;
        }
        break;
      } catch(e) {
        console.log(e);
      }
    }

    // process results
    if (ret.err || (ret.results && ret.results.length==0)) {
      throw new Error("Could not extract profile data\n"+(ret.err?ret.err:""));
    }

    var lst = {};
    var results = ret.results;
    for(var i=0; i < results.length; i++) {
      var r = results[i];
      var webid = r.webid.value;;
      var youid = { id:webid, name: null, keys: [], pubkey:null, alg:null, mod:null, exp:null,
            delegate: null, email:null,
            acl: [], behalfOf: [], foaf_knows:[],
            pim: null, inbox: null, outbox: null };
      var schema_name, foaf_name, rdfs_name, skos_prefLabel, skos_altLabel;

      var ret = await self.loadCertKeys(store, webid);
      if (!ret.error && ret.keys)
        youid.keys = ret.keys;

      if (r.schema_name)
        schema_name = r.schema_name.value;
      if (r.foaf_name)
        foaf_name = r.foaf_name.value;
      if (r.rdfs_name)
        rdfs_name = r.rdfs_name.value;
      if (r.skos_prefLabel)
        skos_prefLabel = r.skos_prefLabel.value;
      if (r.skos_altLabel)
        skos_altLabel = r.skos_altLabel.value;

      if (skos_prefLabel)
        youid.name = skos_prefLabel;
      else if (skos_altLabel)
        youid.name = skos_altLabel;
      else if (schema_name)
        youid.name = schema_name
      else if (foaf_name)
        youid.name = foaf_name;
      else if (rdfs_name)
        youid.name = rdfs_name;

      lst[webid] = youid;
    }

    var _webid = Object.keys(lst);
    for(var i=0; i < _webid.length; i++) {
      var query = self.webid_details.replace(/#\{webid\}/g, _webid[i]);
      
      var ret = await this.exec_query(store, query);

      var acl_delegates = {};
      var behalfOf = {};
      var foaf_knows = {};

      var youid = lst[_webid[i]];

      if (!ret.err) {
        for(var j=0; j < ret.results.length; j++) {
          var r = ret.results[j];

          if (r.delegate)
            youid.delegate = r.delegate.value;
          if (r.acl_delegates)
            acl_delegates[r.acl_delegates.value] = 1;
          if (r.behalfOf)
            behalfOf[r.behalfOf.value] = 1;
          if (r.knows)
            foaf_knows[r.knows.value] = 1;
          if (r.pim_store)
            youid.pim = r.pim_store.value;
          if (r.inbox)
            youid.inbox = r.inbox.value;
          if (r.outbox)
            youid.outbox = r.outbox.value;

          if (r.foaf_mbox) {
            var s = r.foaf_mbox.value;
            if (s.startsWith('mailto:'))
              youid.email = s.substring(7);
            else
              youid.email = s;
          }
          if (r.vcard_email) 
            youid.email = r.vcard_email.value;
          if (r.schema_email) 
            youid.email = r.schema_email.value;
        }
      }

      var _tmp = Object.keys(acl_delegates);
      for(var j=0; j<_tmp.length; j++)
        youid.acl.push(_tmp[j]);

      var _tmp = Object.keys(behalfOf);
      for(var j=0; j<_tmp.length; j++)
        youid.behalfOf.push(_tmp[j]);

      var _tmp = Object.keys(foaf_knows);
      for(var j=0; j<_tmp.length; j++)
        youid.foaf_knows.push(_tmp[j]);

      var msg, success, verify_data;
//    if (youid.id && youid.pubkey && youid.mod && youid.exp && youid.name) {
//      if (youid.id && youid.name) {
      if (youid.name) {
        youid.msg = 'Successfully verified.';
        youid.success = true;
      } else {
        youid.msg = 'Failed, could not verify WebID.';
        youid.success = false;
      }
    }
    return lst;
  },


  genHTML_view : function(data)
  {
    var out;
    out = `<table class="footable verify-tbl"><tbody id="verify-data">`;

    out += `<tr id="row"><td>WebID</td><td>${data.id}</td></tr>`;
    out += `<tr id="row"><td>Name</td><td>${data.name}</td></tr>`;

    if (!data.keys || data.keys.length == 0) {
      out += `<tr id="row"><td>PubKey</td><td>null</td></tr>`;
      out += `<tr id="row"><td>Algorithm</td><td>null</td></tr>`;
      out += `<tr id="row"><td>Modulus</td><td>null</td></tr>`;
      out += `<tr id="row"><td>Exponent</td><td>null</td></tr>`;
    } else { 
      out += `<tr id="row"><td>PubKey</td><td id="pkey_uri">${data.keys[0].pubkey_uri}</td></tr>`;
      out += `<tr id="row"><td>Algorithm</td><td id="pkey_alg">${data.keys[0].alg}</td></tr>`;
      out += `<tr id="row"><td>Modulus</td><td id="pkey_mod">${data.keys[0].mod}</td></tr>`;
      out += `<tr id="row"><td>Exponent</td><td id="pkey_exp">${data.keys[0].exp}</td></tr>`;
    }

    if (data.delegate)
      out += `<tr id="row"><td>Delegate</td><td>${data.delegate}</td></tr>`;

    if (data.pim)
      out += `<tr id="row"><td>Storage</td><td>${data.pim}</td></tr>`;
    if (data.inbox)
      out += `<tr id="row"><td>Inbox</td><td>${data.inbox}</td></tr>`;

    if (data.behalfOf.length>0) {
      var s = '';
      for(var i=0; i<data.behalfOf.length; i++) {
        s += `<div>${data.behalfOf[i]}</div>`;
      }
      out += `<tr id="row"><td>OnBehalfOf</td><td>${s}</td></tr>`;
    }
    if (data.foaf_knows.length>0) {
      var s = '';
      for(var i=0; i<data.foaf_knows.length; i++) {
        s += `<div>${data.foaf_knows[i]}</div>`;
      }
      out += `<tr id="row"><td>Knows</td><td>${s}</td></tr>`;
    }
    if (data.acl.length>0) {
      var s = '';
      for(var i=0; i<data.acl.length; i++) {
        s += `<div>${data.acl[i]}</div>`;
      }
      out += `<tr id="row"><td>Delegates</td><td>${s}</td></tr>`;
    }

    out += `</tbody></table>`;

    return out;
  },


  getProfile : function(url, oidc_fetch) {
    var _fetch = oidc_fetch || fetch;
    return new Promise( (resolve, reject) => {
      var options = {
        method: 'GET',
        headers: {
          'Accept': 'text/turtle;q=1.0,application/ld+json;q=0.5,text/plain;q=0.2,text/html;q=0.5,*/*;q=0.1',
//          'Accept': 'text/turtle, application/ld+json'
        }
      }

      _fetch(url, options)
        .then(function(response) {
          if (!response.ok) {
            var err = 'HTTP ' + response.status + ' ' + response.statusText;
	    reject (err)
          }

          var header = response.headers.get('content-type');
          response.text().then((data) => {
              resolve({data, content_type: header});
          });
        })
        .catch(err => { 
          reject(err); 
        }) ;
    })
  }, 


  load_data : function(baseURI, data, content_type) {

    var self = this;
    return new Promise(function(resolve, reject) {

      rdfstore.Store.yieldFrequency(15);
      rdfstore.create(function(err, store) {

        var options = {documentIRI:baseURI};
          
        switch(content_type)
        {
        case 'application/rdf+xml':
          try {
            var kb = $rdf.graph();

            $rdf.parse(data, kb, baseURI, "application/rdf+xml");
            data = $rdf.serialize(undefined, kb, baseURI, "text/turtle");
            content_type = "text/turtle";

            store.load(content_type, data, options, function(err, res){
	      if (err)
                reject ("Could not parse profile\n\n"+err+"\n\n Profile data:\n\n"+data);
	      resolve(store);
	    });
          } catch(err) {
              reject ("Could not parse profile\n\n"+err+"\n\n Profile data:\n\n"+data);
          }
          break;
        case 'application/ld+json':
          try {
            var jsonld_data = JSON.parse(data);
            jsonld.expand(jsonld_data, {base:baseURI})
              .then( expanded => {
                jsonld.toRDF(expanded, {base:baseURI, format: 'application/nquads', includeRelativeUrls: true})
                  .then(nquads => {
                    content_type = "text/turtle";

                    store.load(content_type, nquads, options, function(err, res){
	              if (err)
                        reject ("Could not parse profile\n\n"+err+"\n\n Profile data:\n\n"+nquads);
	              resolve(store);
	            });
                  })
                  .catch(err => {
                    reject ("Could not parse profile\n\n"+err+"\n\n Profile data:\n\n"+nquads);
                  });
              })
              .catch(err => {
                reject ("Could not parse profile\n\n"+err+"\n\n Profile data:\n\n"+data);
              });
          } catch(err) {
              reject ("Could not parse profile\n\n"+err+"\n\n Profile data:\n\n"+data);
          }
          break;

        case 'text/turtle':
          store.load(content_type, data, options, function(err, res){
	    if (err)
              reject ("Could not parse profile\n\n"+err+"\n\n Profile data:\n\n"+data);
	    resolve(store);
	  });
	  break;

	default:
          reject ("Unexpected content type :"+content_type);
        }
      })
    })
  },


  exec_query : function(store, query) {
    var self = this;
    return new Promise((resolve, reject) => {
      store.execute(query, function(err, results) {
        resolve({err, results});
      })
    })
  },


  loadCertKeys : async function(store, webid) {
    var self = this;
    var store;

    var query = self.load_pubkey.replace(/#\{webid\}/g, webid);

    var rc;
    try {
      rc = await this.exec_query(store, query);
    } catch(err) {
      return { "error": err};
    }
    if (rc.err) {
      return { "error": rc.err};
    } 
    else if (!rc.err && rc.results && rc.results.length > 0) 
    {
      var ret = [];
      for (var i=0; i < rc.results.length; i++) {
        var r = rc.results[i];
        var pkey = r.pubkey.value;
        try {
          pkey = r.pubkey.token==='blank' ? r.pubkey.value : (new URL(r.pubkey.value)).hash;
        } catch(e) {
        }

        var v = {pkey, pubkey_uri:r.pubkey.value,  alg:r.alg.value,  mod:r.cert_mod.value, exp:r.cert_exp.value};
        if (r.key_cr_dt) 
          v["key_created"] = r.key_cr_dt.value;
        if (r.key_cr_title) 
          v["key_title"] = r.key_cr_title.value;
        if (r.key_label) 
          v["key_label"] = r.key_label.value;

        ret.push(v);
      }
      return {keys: ret};
   }
   else {
      return { "error": 'No data'};
   }
  } ,

}



SPARQL = function () {
  this.store = null;
}
SPARQL.prototype = {
  load_data : function(baseURI, data, content_type) {

    var self = this;
    return new Promise(function(resolve, reject) {

      rdfstore.Store.yieldFrequency(15);
      rdfstore.create(function(err, store) {

        self.store = store;
        var options = {documentIRI:baseURI};
          
        switch(content_type)
        {
        case 'text/turtle':
        case 'application/ld+json':
          store.load(content_type, data, options, function(err, res){
	    if (err) {
              reject ("Could not parse profile\n\n"+err+"\n\n Profile data:\n\n"+data);
	    }

	    resolve(true);
	  });
	  break;

	default:
          reject ("Unexpected content type :"+content_type);
        }
      })
    })
  },


  exec_query : function(query) {
    var self = this;
    return new Promise((resolve, reject) => {
      self.store.execute(query, function(err, results) {
        resolve({err, results});
      })
    })
  },
}


var Msg = {};

Msg.showYN = function (msg1, msg2, callback)
  {
    if (msg1) 
      document.querySelector('#alert-dlg #alert-msg1').textContent = msg1;
    if (msg2)
      document.querySelector('#alert-dlg #alert-msg2').textContent = msg2;

    document.querySelector('#alert-dlg #btn-cancel').textContent = 'No';

    var btnYes = document.querySelector('#alert-dlg #btn-yes');
    btnYes.style.display = 'initial'
    btnYes.onclick = () =>
       {
         if (callback) callback(); 
     
         $('#alert-dlg').modal('hide');
       };

    var dlg = $('#alert-dlg .modal-content');
    dlg.width(400);
    $('#alert-dlg').modal('show');
  };


Msg.showInfo = function (msg)
  {
    if (msg) 
      document.querySelector('#alert-dlg #alert-msg1').textContent = msg;

    document.querySelector('#alert-dlg #btn-cancel').textContent = 'Cancel';
    var btnYes = document.querySelector('#alert-dlg #btn-yes');
    btnYes.style.display = 'none'

    var dlg = $('#alert-dlg .modal-content');
    dlg.width(600);
    $('#alert-dlg').modal('show');
  };


function create_UUID(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}

var DOM = {};

DOM.qSel = (sel) => { return document.querySelector(sel); };
DOM.iSel = (id) => { return document.getElementById(id); };
DOM.qShow = (sel) => { DOM.qSel(sel).classList.remove('hidden'); };
DOM.qHide = (sel) => { DOM.qSel(sel).classList.add('hidden'); };

DOM.qGetValue = function (sel)
  {
    return DOM.qSel(sel).value;
  };
DOM.qSetValue = function (sel, val)
  {
    DOM.qSel(sel).value = val;
  };

DOM.iGetValue = function (sel)
  {
    return DOM.iSel(sel).value;
  };
DOM.iSetValue = function (sel, val)
  {
    DOM.iSel(sel).value = val;
  };

async function getCurWin()
{
  if (Browser.isChromeWebExt) {
    return new Promise(function (resolve, reject) {
      Browser.api.windows.getCurrent({}, (w) => {
        resolve(w)
      });
    })
  } else {
    return Browser.api.windows.getCurrent({});
  }
}

async function getCurTab()
{
  if (Browser.isChromeWebExt) {
    return new Promise(function (resolve, reject) {
      Browser.api.tabs.query({active:true, currentWindow:true}, (t) => {
        resolve(t)
      });
    })
  } else {
    return Browser.api.tabs.query({active:true, currentWindow:true});
  }
}

async function getTabFrames(tab)
{
  if (Browser.isChromeWebExt) {
    return new Promise(function (resolve, reject) {
      Browser.api.webNavigation.getAllFrames({tabId:tab}, (t) => {
        resolve(t)
      });
    })
  } else {
    return Browser.api.webNavigation.getAllFrames({tabId:tab});
  }
}


function fix_Nano_data(str) 
{
        str = str.replace(/\xe2\x80\x9c/g, '"')       //replace smart quotes with sensible ones (opening)
            .replace(/\xe2\x80\x9d/g, '"')       //replace smart quotes with sensible ones (closing)
            .replace(/\xc3\xa2\xc2\x80\xc2\x9c/g, '"')  //smart->sensible quote replacement, wider encoding
            .replace(/\xc3\xa2\xc2\x80\xc2\x9d/g, '"')  //smart->sensible quote replacement, wider encoding

            .replace(/\u00a0/g, " ")   //&nbsp
            .replace(/\u009d/g, " ")   //&nbsp
            .replace(/\u0080/g, " ")   //&nbsp

            .replace(/\u202F/g, " ")   // NARROW NO-BREAK SPACE
            .replace(/\u2009/g, " ")   // thin space
            .replace(/\u2007/g, " ")   // FIGURE SPACE

            .replace(/\u200B/g, "")   //ZERO WIDTH SPACE
            .replace(/\u200D/g, "")   // WORD-JOINER
            .replace(/\u200C/g, "")   // ZERO WIDTH NON-JOINER
            .replace(/\uFEFF/g, "")   // zero width no-break space Unicode code point

            .replace(/\u201A/g, "'")
            .replace(/\u2018/g, "'")
            .replace(/\u2019/g, "'")
            .replace(/\u2039/g, "'")
            .replace(/\u203A/g, "'")
            .replace(/\u201C/g, '"')
            .replace(/\u201D/g, '"')
            .replace(/\u201E/g, '"')
            .replace(/\u00BB/g, '"')
            .replace(/\u00AB/g, '"');

        return str;
}


function sniff_doc_data(doc, uri)
{
    var idata = {ttl:[], ldjson:[], rdfxml:[]}

    var url = new URL(uri);
    url.hash = '';
    idata.baseURI = url.toString();
    
    var all = doc.getElementsByTagName('script');
    for(var i=0; i < all.length; i++) 
       if (all[i].hasAttribute('type')) 
         {
           var atype = all[i].getAttribute('type');
           if (atype == "application/ld+json") 
             {
               var htmlText = all[i].innerHTML;

               htmlText = htmlText.replace("//<![CDATA[", "").replace("//]]>", "");
               htmlText = htmlText.replace("<![CDATA[", "").replace("]]>", "");
               if (htmlText.length > 0)
                 idata.ldjson.push(htmlText);
             }
           else if(atype == "text/turtle")
             {
               var htmlText = all[i].innerHTML;

               htmlText = htmlText.replace("//<![CDATA[", "").replace("//]]>", "");
               htmlText = htmlText.replace("<![CDATA[", "").replace("]]>", "");
               if (htmlText.length > 0)
                 idata.ttl.push(htmlText);
             } 
           else if(atype == "application/rdf+xml")
             {
               var htmlText = all[i].innerHTML;

               htmlText = htmlText.replace("//<![CDATA[", "").replace("//]]>", "");
               htmlText = htmlText.replace("<![CDATA[", "").replace("]]>", "");
               if (htmlText.length > 0)
                 idata.rdfxml.push(htmlText);
             } 
         }
    
    var data = sniff_text_data(doc.body.innerText, uri);
    idata.ttl = idata.ttl.concat(data.ttl);
    idata.ldjson = idata.ldjson.concat(data.ldjson);
    idata.rdfxml = idata.rdfxml.concat(data.rdfxml);

    try{
      var rdfa_ttl = get_rdfa_data(doc);
      if (rdfa_ttl.trim().length > 0)
        idata.ttl.push(rdfa_ttl);
    } catch(e) {
      console.log(e);
    }


    
    return idata;
}


function sniff_text_data(txt, uri)
{
    var idata = {ttl:[], ldjson:[], rdfxml:[]}

    var url = new URL(uri);
    url.hash = '';
    idata.baseURI = url.toString();
    
    try {
      if (txt) {
        function isWhitespace(c) {
            var cc = c.charCodeAt(0);
            if (( cc >= 0x0009 && cc <= 0x000D ) ||
                ( cc == 0x0020 ) ||
                ( cc == 0x0085 ) ||
                ( cc == 0x00A0 )) {
                return true;
            }
            return false;
        }


        //drop commetns
        var eoln = /(?:\r\n)|(?:\n)|(?:\r)/g;
        var s_split = txt.split(eoln);
        var s_doc = "";
        var p1 = /## +([Nn]anotation|[Tt]urtle) +(Start|End|Stop) *##/;
        var p2 = /^ *#/;
        var p3 = /## +(JSON-LD) +(Start|End|Stop) *##/;
        var p4 = /## +(RDF(\/|-)XML) +(Start|End|Stop) *##/;

        s_split.forEach(function (item, i, arr) {
            if (item.length > 0 && (!p2.test(item) || p1.test(item) || p3.test(item) || p4.test(item)))
                s_doc += item + "\n";
        });

        s_doc = fix_Nano_data(s_doc);

        //try get Turtle Nano
        while (true) {
            var ndata = ttl_nano_pattern.exec(s_doc);
            if (ndata == null)
                break;

            var str = ndata[3];
            if (str.length > 0)
               idata.ttl.push(str);
        }

        //try get Turtle Nano in CurlyBraces { ... }
        var j = 0;
        var inCurly = 0;
        var str = "";
        while (j < s_doc.length) {
            var ch = s_doc[j++];
            if (ch == '"') {
                var rc = s_doc.indexOf(ch, j);
                if (rc == -1)
                    break;
                if (inCurly > 0)
                    str += s_doc.substring(j - 1, rc + 1);
                j = rc + 1;
            }
            else if (ch == '{') {
                inCurly++;
            }
            else if (ch == '}') {
                inCurly--;
                idata.ttl.push(str);
                str = "";
            }
            else if (inCurly > 0) {
                str += ch;
            }
        }

        //try get JSON-LD Nano
        while (true) {
            var ndata = jsonld_nano_pattern.exec(s_doc);
            if (ndata == null)
                break;

            var str = ndata[2];
            if (str.length > 0) {
                var add = false;
                for (var c = 0; c < str.length; c++) {
                    add = str[c] === "{" ? true : false;
                    if (add)
                        break;
                    if (!isWhitespace(str[c]))
                        break;
                }

                if (add)
                    idata.ldjson.push(str);
            }
        }

        //try get RDF/XML Nano
        while (true) {
            var ndata = rdf_nano_pattern.exec(s_doc);
            if (ndata == null)
                break;

            var str = ndata[3];
            if (str.length > 0) {
                idata.rdfxml.push(str);
            }
        }
      }
    } catch(e) {
      console.log(e);
    }

    return idata;
}


function get_rdfa_data(doc)
{
    var escape = /["\\\t\n\r\b\f\u0000-\u0019\ud800-\udbff]/;
    var escapeAll = /["\\\t\n\r\b\f\u0000-\u0019]|[\ud800-\udbff][\udc00-\udfff]/g;
    var escapeReplacements = {
        '\\': '\\\\', '"': '\\"', '\t': '\\t',
        '\n': '\\n', '\r': '\\r', '\b': '\\b', '\f': '\\f'
    };

    function iri2str(n) {
        return (n && n.substr(0, 2) === '_:') ? n : "<" + n + ">";
    }

    function NodeList2Str(list) {
        var s = "";
        for (var i = 0; i < list.length; i++) {
            if (i > 0)
                s += "\n";
            if (list[i].innerHTML)
                s += list[i].innerHTML;
            else
                s += list[i].textContent;
        }
        return s;
    }

    function fmt(value) {
        function characterReplacer(character) {
            // Replace a single character by its escaped version
            var result = escapeReplacements[character];
            if (result === undefined) {
                // Replace a single character with its 4-bit unicode escape sequence
                if (character.length === 1) {
                    result = character.charCodeAt(0).toString(16);
                    result = '\\u0000'.substr(0, 6 - result.length) + result;
                }
                // Replace a surrogate pair with its 8-bit unicode escape sequence
                else {
                    result = ((character.charCodeAt(0) - 0xD800) * 0x400 +
                    character.charCodeAt(1) + 0x2400).toString(16);
                    result = '\\U00000000'.substr(0, 10 - result.length) + result;
                }
            }
            return result;
        }

        if (escape.test(value))
            value = value.replace(escapeAll, characterReplacer);

        return value;
    }


    var rdfa_ttl = null;
    var rdfa_subjects = null;

    GreenTurtle.attach(doc);
    rdfa_subjects = doc.data.getSubjects();

    ///Convert RDFa data to internal format
    if (rdfa_subjects != null && rdfa_subjects.length > 0) {
        rdfa = [];
        rdfa_ttl = "";
        var _LiteralMatcher = /^"([^]*)"(?:\^\^(.+)|@([\-a-z]+))?$/i;

        for (var i = 0; i < rdfa_subjects.length; i++) {
            var s_triple = " " + iri2str(fmt(rdfa_subjects[i]));
            var p_triple;
            var o_triple;
            var s = {s: rdfa_subjects[i], n: i + 1};
            rdfa.push(s);
            var plist = doc.data.getProperties(rdfa_subjects[i]);
            s.props = new Object();

            for (var j = 0; j < plist.length; j++) {
                var p = s.props[plist[j]];
                if (p === undefined)
                    s.props[plist[j]] = [];

                p = s.props[plist[j]];
                p_triple = " " + iri2str(fmt(plist[j]));

                var vlist = doc.data.getObjects(rdfa_subjects[i], plist[j]);
                for (var z = 0; z < vlist.length; z++) {
                    var v = vlist[z];
                    if (v.type === "http://www.w3.org/1999/02/22-rdf-syntax-ns#object") {
                        p.push({"iri": String(v.value)});
                        o_triple = " " + iri2str(fmt(v.value));
                    }
                    else if (v.type === "http://www.w3.org/1999/02/22-rdf-syntax-ns#PlainLiteral") {
                        var v_val = null;

                        if (v.value instanceof NodeList)
                            v_val = NodeList2Str(v.value);
                        else
                            v_val = v.value != null ? String(v.value) : null;

                        var v_lang = v.language != null ? String(v.language) : null;
                        p.push({value: v_val, type: null, lang: v_lang});
                        o_triple = ' "' + fmt(v_val) + '"';
                        if (v_lang != null)
                            o_triple += '@' + v_lang;
                    }
                    else {
                        var v_val = null;

                        if (v.value instanceof NodeList)
                            v_val = NodeList2Str(v.value);
                        else
                            v_val = v.value != null ? String(v.value) : null;

                        var v_lang = v.language != null ? String(v.language) : null;
                        var v_type = v.type != null ? String(v.type) : null;
                        p.push({value: v_val, type: v_type, lang: v_lang});
                        o_triple = ' "' + fmt(v_val) + '"';
                        if (v_lang != null)
                            o_triple += '@' + v_lang;
                        else if (v_type != null)
                            o_triple += '^^<' + v_type + ">";
                    }
                    rdfa_ttl += s_triple + p_triple + o_triple + " .\n";
                }
            }
        }
    }

    return rdfa_ttl;
}



var COUNTRIES = [{"ccode":"AF","cl":"Afghanistan","states":[{"scode":"AF-BDS","sl":"Badakhshān"},{"scode":"AF-BGL","sl":"Baghlān"},{"scode":"AF-BAL","sl":"Balkh"},{"scode":"AF-BDG","sl":"Bādghīs"},{"scode":"AF-BAM","sl":"Bāmīān"},{"scode":"AF-FRA","sl":"Farāh"},{"scode":"AF-FYB","sl":"Fāryāb"},{"scode":"AF-GHA","sl":"Ghaznī"},{"scode":"AF-GHO","sl":"Ghowr"},{"scode":"AF-HEL","sl":"Helmand"},{"scode":"AF-HER","sl":"Herāt"},{"scode":"AF-JOW","sl":"Jowzjān"},{"scode":"AF-KAB","sl":"Kabul"},{"scode":"AF-KAN","sl":"Kandahār"},{"scode":"AF-KNR","sl":"Konar"},{"scode":"AF-KDZ","sl":"Kondoz"},{"scode":"AF-KAP","sl":"Kāpīsā"},{"scode":"AF-LAG","sl":"Laghmān"},{"scode":"AF-LOW","sl":"Lowgar"},{"scode":"AF-NAN","sl":"Nangrahār"},{"scode":"AF-NIM","sl":"Nīmrūz"},{"scode":"AF-ORU","sl":"Orūzgān"},{"scode":"AF-PKA","sl":"Paktīkā"},{"scode":"AF-PIA","sl":"Paktīā"},{"scode":"AF-PAR","sl":"Parwān"},{"scode":"AF-SAM","sl":"Samangān"},{"scode":"AF-SAR","sl":"Sar-e Pol"},{"scode":"AF-TAK","sl":"Takhār"},{"scode":"AF-WAR","sl":"Wardak"},{"scode":"AF-ZAB","sl":"Zābol"}]},{"ccode":"AL","cl":"Albania","states":[{"scode":"AL-BR","sl":"Berat"},{"scode":"AL-BU","sl":"Bulqizë"},{"scode":"AL-DL","sl":"Delvinë"},{"scode":"AL-DV","sl":"Devoll"},{"scode":"AL-DI","sl":"Dibër"},{"scode":"AL-DR","sl":"Durrës"},{"scode":"AL-EL","sl":"Elbasan"},{"scode":"AL-FR","sl":"Fier"},{"scode":"AL-GJ","sl":"Gjirokastër"},{"scode":"AL-GR","sl":"Gramsh"},{"scode":"AL-HA","sl":"Has"},{"scode":"AL-KA","sl":"Kavajë"},{"scode":"AL-ER","sl":"Kolonjë"},{"scode":"AL-KO","sl":"Korcë"},{"scode":"AL-KR","sl":"Krujë"},{"scode":"AL-KC","sl":"Kucovë"},{"scode":"AL-KU","sl":"Kukës"},{"scode":"AL-LA","sl":"Laç"},{"scode":"AL-LE","sl":"Lezhë"},{"scode":"AL-LB","sl":"Librazhd"},{"scode":"AL-LU","sl":"Lushnjë"},{"scode":"AL-MK","sl":"Mallakastër"},{"scode":"AL-MM","sl":"Malësia e Madhe"},{"scode":"AL-MT","sl":"Mat"},{"scode":"AL-MR","sl":"Mirditë"},{"scode":"AL-PQ","sl":"Peqin"},{"scode":"AL-PG","sl":"Pogradec"},{"scode":"AL-PU","sl":"Pukë"},{"scode":"AL-PR","sl":"Përmet"},{"scode":"AL-SR","sl":"Sarandë"},{"scode":"AL-SH","sl":"Shkodër"},{"scode":"AL-SK","sl":"Skrapar"},{"scode":"AL-TE","sl":"Tepelenë"},{"scode":"AL-TR","sl":"Tiranë"},{"scode":"AL-TP","sl":"Tropojë"},{"scode":"AL-VL","sl":"Vlorë"}]},{"ccode":"DZ","cl":"Algeria","states":[{"scode":"DZ-01","sl":"Adrar"},{"scode":"DZ-16","sl":"Alger"},{"scode":"DZ-44","sl":"Aïn Defla"},{"scode":"DZ-46","sl":"Aïn Témouchent"},{"scode":"DZ-05","sl":"Batna"},{"scode":"DZ-07","sl":"Biskra"},{"scode":"DZ-09","sl":"Blida"},{"scode":"DZ-34","sl":"Bordj Bou Arréridj"},{"scode":"DZ-10","sl":"Bouira"},{"scode":"DZ-35","sl":"Boumerdès"},{"scode":"DZ-08","sl":"Béchar"},{"scode":"DZ-06","sl":"Béjaïa"},{"scode":"DZ-02","sl":"Chlef"},{"scode":"DZ-25","sl":"Constantine"},{"scode":"DZ-17","sl":"Djelfa"},{"scode":"DZ-32","sl":"El Bayadh"},{"scode":"DZ-39","sl":"El Oued"},{"scode":"DZ-36","sl":"El Tarf"},{"scode":"DZ-47","sl":"Ghardaïa"},{"scode":"DZ-24","sl":"Guelma"},{"scode":"DZ-33","sl":"Illizi"},{"scode":"DZ-18","sl":"Jijel"},{"scode":"DZ-40","sl":"Khenchela"},{"scode":"DZ-03","sl":"Laghouat"},{"scode":"DZ-29","sl":"Mascara"},{"scode":"DZ-43","sl":"Mila"},{"scode":"DZ-27","sl":"Mostaganem"},{"scode":"DZ-28","sl":"Msila"},{"scode":"DZ-26","sl":"Médéa"},{"scode":"DZ-45","sl":"Naama"},{"scode":"DZ-31","sl":"Oran"},{"scode":"DZ-30","sl":"Ouargla"},{"scode":"DZ-04","sl":"Oum el Bouaghi"},{"scode":"DZ-48","sl":"Relizane"},{"scode":"DZ-20","sl":"Saïda"},{"scode":"DZ-22","sl":"Sidi Bel Abbès"},{"scode":"DZ-21","sl":"Skikda"},{"scode":"DZ-41","sl":"Souk Ahras"},{"scode":"DZ-19","sl":"Sétif"},{"scode":"DZ-11","sl":"Tamanghasset"},{"scode":"DZ-14","sl":"Tiaret"},{"scode":"DZ-37","sl":"Tindouf"},{"scode":"DZ-42","sl":"Tipaza"},{"scode":"DZ-38","sl":"Tissemsilt"},{"scode":"DZ-15","sl":"Tizi Ouzou"},{"scode":"DZ-13","sl":"Tlemcen"},{"scode":"DZ-12","sl":"Tébessa"}]},{"ccode":"AS","cl":"American Samoa","states":null},{"ccode":"AD","cl":"Andorra","states":null},{"ccode":"AO","cl":"Angola","states":[{"scode":"AO-BGO","sl":"Bengo"},{"scode":"AO-BGU","sl":"Benguela"},{"scode":"AO-BIE","sl":"Bié"},{"scode":"AO-CAB","sl":"Cabinda"},{"scode":"AO-CCU","sl":"Cuando-Cubango"},{"scode":"AO-CNO","sl":"Cuanza Norte"},{"scode":"AO-CUS","sl":"Cuanza Sul"},{"scode":"AO-CNN","sl":"Cunene"},{"scode":"AO-HUA","sl":"Huambo"},{"scode":"AO-HUI","sl":"Huíla"},{"scode":"AO-LUA","sl":"Luanda"},{"scode":"AO-LNO","sl":"Lunda Norte"},{"scode":"AO-LSU","sl":"Lunda Sul"},{"scode":"AO-MAL","sl":"Malange"},{"scode":"AO-MOX","sl":"Moxico"},{"scode":"AO-NAM","sl":"Namibe"},{"scode":"AO-UIG","sl":"Uíge"},{"scode":"AO-ZAI","sl":"Zaïre"}]},{"ccode":"AI","cl":"Anguilla","states":null},{"ccode":"AQ","cl":"Antarctica","states":null},{"ccode":"AG","cl":"Antigua & Barbuda","states":null},{"ccode":"AR","cl":"Argentina","states":[{"scode":"AR-B","sl":"Buenos Aires"},{"scode":"AR-C","sl":"Capital federal"},{"scode":"AR-K","sl":"Catamarca"},{"scode":"AR-H","sl":"Chaco"},{"scode":"AR-U","sl":"Chubut"},{"scode":"AR-W","sl":"Corrientes"},{"scode":"AR-X","sl":"Córdoba"},{"scode":"AR-E","sl":"Entre Ríos"},{"scode":"AR-P","sl":"Formosa"},{"scode":"AR-Y","sl":"Jujuy"},{"scode":"AR-L","sl":"La Pampa"},{"scode":"AR-F","sl":"La Rioja"},{"scode":"AR-M","sl":"Mendoza"},{"scode":"AR-N","sl":"Misiones"},{"scode":"AR-Q","sl":"Neuquén"},{"scode":"AR-R","sl":"Río Negro"},{"scode":"AR-A","sl":"Salta"},{"scode":"AR-J","sl":"San Juan"},{"scode":"AR-D","sl":"San Luis"},{"scode":"AR-Z","sl":"Santa Cruz"},{"scode":"AR-S","sl":"Santa Fe"},{"scode":"AR-G","sl":"Santiago del Estero"},{"scode":"AR-V","sl":"Tierra del Fuego"},{"scode":"AR-T","sl":"Tucumán"}]},{"ccode":"AM","cl":"Armenia","states":[{"scode":"AM-AG","sl":"Aragacotn"},{"scode":"AM-AR","sl":"Ararat"},{"scode":"AM-AV","sl":"Armavir"},{"scode":"AM-ER","sl":"Erevan"},{"scode":"AM-GR","sl":"Geģark'unik'"},{"scode":"AM-KT","sl":"Kotayk'"},{"scode":"AM-LO","sl":"Loŕy"},{"scode":"AM-SU","sl":"Syunik'"},{"scode":"AM-TV","sl":"Tavuš"},{"scode":"AM-VD","sl":"Vayoc Jor"},{"scode":"AM-SH","sl":"Širak"}]},{"ccode":"AW","cl":"Aruba","states":null},{"ccode":"AU","cl":"Australia","states":[{"scode":"AU-CT","sl":"Australian Capital Territory"},{"scode":"AU-NS","sl":"New South Wales"},{"scode":"AU-NT","sl":"Northern Territory"},{"scode":"AU-QL","sl":"Queensland"},{"scode":"AU-SA","sl":"South Australia"},{"scode":"AU-TS","sl":"Tasmania"},{"scode":"AU-VI","sl":"Victoria"},{"scode":"AU-WA","sl":"Western Australia"}]},{"ccode":"AT","cl":"Austria","states":[{"scode":"AT-1","sl":"Burgenland"},{"scode":"AT-2","sl":"Kärnten"},{"scode":"AT-3","sl":"Niederösterreich"},{"scode":"AT-4","sl":"Oberösterreich"},{"scode":"AT-5","sl":"Salzburg"},{"scode":"AT-6","sl":"Steiermark"},{"scode":"AT-7","sl":"Tirol"},{"scode":"AT-8","sl":"Vorarlberg"},{"scode":"AT-9","sl":"Wien"}]},{"ccode":"AZ","cl":"Azerbaijan","states":[{"scode":"AZ-ABS","sl":"Abşeron"},{"scode":"AZ-AST","sl":"Astara"},{"scode":"AZ-AGC","sl":"Ağcabädi"},{"scode":"AZ-AGM","sl":"Ağdam"},{"scode":"AZ-AGS","sl":"Ağdas"},{"scode":"AZ-AGA","sl":"Ağstafa"},{"scode":"AZ-AGU","sl":"Ağsu"},{"scode":"AZ-BAB","sl":"Babäk"},{"scode":"AZ-BA","sl":"Baki"},{"scode":"AZ-BAL","sl":"Balakän"},{"scode":"AZ-BEY","sl":"Beyläqan"},{"scode":"AZ-BIL","sl":"Biläsuvar"},{"scode":"AZ-BAR","sl":"Bärdä"},{"scode":"AZ-CUL","sl":"Culfa"},{"scode":"AZ-CAB","sl":"Cäbrayil"},{"scode":"AZ-CAL","sl":"Cälilabad"},{"scode":"AZ-DAS","sl":"Daşkäsän"},{"scode":"AZ-DAV","sl":"Däväçi"},{"scode":"AZ-FUZ","sl":"Füzuli"},{"scode":"AZ-GOR","sl":"Goranboy"},{"scode":"AZ-GAD","sl":"Gädäbäy"},{"scode":"AZ-GA","sl":"Gäncä"},{"scode":"AZ-GOY","sl":"Göyçay"},{"scode":"AZ-HAC","sl":"Haciqabul"},{"scode":"AZ-IMI","sl":"Imişli"},{"scode":"AZ-ISM","sl":"Ismayilli"},{"scode":"AZ-KAL","sl":"Kälbäcär"},{"scode":"AZ-KUR","sl":"Kürdämir"},{"scode":"AZ-LAC","sl":"Laçin"},{"scode":"AZ-LER","sl":"Lerik"},{"scode":"AZ-LAN","sl":"Länkäran"},{"scode":"AZ-LA","sl":"Länkäran"},{"scode":"AZ-MAS","sl":"Masalli"},{"scode":"AZ-MI","sl":"Mingäçevir"},{"scode":"AZ-NA","sl":"Naftalan"},{"scode":"AZ-MM","sl":"Naxçivan"},{"scode":"AZ-NEF","sl":"Neftçala"},{"scode":"AZ-ORD","sl":"Ordubad"},{"scode":"AZ-OGU","sl":"Oğuz"},{"scode":"AZ-QAX","sl":"Qax"},{"scode":"AZ-QAZ","sl":"Qazax"},{"scode":"AZ-QOB","sl":"Qobustan"},{"scode":"AZ-QBA","sl":"Quba"},{"scode":"AZ-QBI","sl":"Qubadlı"},{"scode":"AZ-QUS","sl":"Qusar"},{"scode":"AZ-QAB","sl":"Qäbälä"},{"scode":"AZ-SAT","sl":"Saatli"},{"scode":"AZ-SAB","sl":"Sabirabad"},{"scode":"AZ-SAL","sl":"Salyan"},{"scode":"AZ-SMX","sl":"Samux"},{"scode":"AZ-SIY","sl":"Siyäzän"},{"scode":"AZ-SM","sl":"Sumqayit"},{"scode":"AZ-SAD","sl":"Sädäräk"},{"scode":"AZ-TOV","sl":"Tovuz"},{"scode":"AZ-TAR","sl":"Tärtär"},{"scode":"AZ-UCA","sl":"Ucar"},{"scode":"AZ-XA","sl":"Xankändi"},{"scode":"AZ-XAN","sl":"Xanlar"},{"scode":"AZ-XAC","sl":"Xaçmaz"},{"scode":"AZ-XIZ","sl":"Xizi"},{"scode":"AZ-XCI","sl":"Xocalı"},{"scode":"AZ-XVD","sl":"Xocavänd"},{"scode":"AZ-YAR","sl":"Yardimli"},{"scode":"AZ-YE","sl":"Yevlax"},{"scode":"AZ-YEV","sl":"Yevlax"},{"scode":"AZ-ZAQ","sl":"Zaqatala"},{"scode":"AZ-ZAN","sl":"Zängılan"},{"scode":"AZ-ZAR","sl":"Zärdab"},{"scode":"AZ-AB","sl":"Äli Bayramli"},{"scode":"AZ-SAH","sl":"Şahbuz"},{"scode":"AZ-SMI","sl":"Şamaxı"},{"scode":"AZ-SS","sl":"Şuşa"},{"scode":"AZ-SUS","sl":"Şuşa"},{"scode":"AZ-SA","sl":"Şäki"},{"scode":"AZ-SAK","sl":"Şäki"},{"scode":"AZ-SKR","sl":"Şämkir"},{"scode":"AZ-SAR","sl":"Şärur"}]},{"ccode":"BS","cl":"Bahamas","states":[{"scode":"BS-AC","sl":"Acklins and Crooked Islands"},{"scode":"BS-BI","sl":"Bimini"},{"scode":"BS-CI","sl":"Cat Island"},{"scode":"BS-EX","sl":"Exuma"},{"scode":"BS-FP","sl":"Freeport"},{"scode":"BS-FC","sl":"Fresh Creek"},{"scode":"BS-GH","sl":"Governor's Harbour"},{"scode":"BS-GT","sl":"Green Turtle Cay"},{"scode":"BS-HI","sl":"Harbour Island"},{"scode":"BS-HR","sl":"High Rock"},{"scode":"BS-IN","sl":"Inagua"},{"scode":"BS-KB","sl":"Kemps Bay"},{"scode":"BS-LI","sl":"Long Island"},{"scode":"BS-MH","sl":"Marsh Harbour"},{"scode":"BS-MG","sl":"Mayaguana"},{"scode":"BS-NP","sl":"New Providence"},{"scode":"BS-NB","sl":"Nicholls Town and Berry Islands"},{"scode":"BS-RI","sl":"Ragged Island"},{"scode":"BS-RS","sl":"Rock Sound"},{"scode":"BS-SR","sl":"San Salvador and Rum Cay"},{"scode":"BS-SP","sl":"Sandy Point"}]},{"ccode":"BH","cl":"Bahrain","states":[{"scode":"BH-03","sl":"Al Manāmah"},{"scode":"BH-10","sl":"Al Minţaqah al Gharbīyah"},{"scode":"BH-07","sl":"Al Minţaqah al Wusţa"},{"scode":"BH-05","sl":"Al Minţaqah ash Shamālīyah"},{"scode":"BH-02","sl":"Al Muḩarraq"},{"scode":"BH-01","sl":"Al Ḩadd"},{"scode":"BH-09","sl":"Ar Rifā‘"},{"scode":"BH-04","sl":"Jidd Ḩafş"},{"scode":"BH-12","sl":"Madīnat Ḩamad"},{"scode":"BH-08","sl":"Madīnat ‘Īsá"},{"scode":"BH-11","sl":"Minţaqat Juzur Ḩawār"},{"scode":"BH-06","sl":"Sitrah"}]},{"ccode":"BD","cl":"Bangladesh","states":[{"scode":"BD-2A","sl":"Bandarban anchal"},{"scode":"BD-1B","sl":"Barisal anchal"},{"scode":"BD-1","sl":"Barisal bibhag"},{"scode":"BD-5C","sl":"Bogra anchal"},{"scode":"BD-2E","sl":"Chittagong Hill Tracts"},{"scode":"BD-2D","sl":"Chittagong anchal"},{"scode":"BD-2","sl":"Chittagong bibhag"},{"scode":"BD-2F","sl":"Comilla anchal"},{"scode":"BD-3G","sl":"Dhaka anchal"},{"scode":"BD-3","sl":"Dhaka bibhag"},{"scode":"BD-5H","sl":"Dinajpur anchal"},{"scode":"BD-3I","sl":"Faridpur anchal"},{"scode":"BD-3J","sl":"Jamalpur anchal"},{"scode":"BD-4K","sl":"Jessore anchal"},{"scode":"BD-4L","sl":"Khulna anchal"},{"scode":"BD-4","sl":"Khulna bibhag"},{"scode":"BD-4M","sl":"Khustia anchal"},{"scode":"BD-3N","sl":"Mymensingh anchal"},{"scode":"BD-2O","sl":"Noakhali anchal"},{"scode":"BD-5P","sl":"Pabna anchal"},{"scode":"BD-1Q","sl":"Patuakhali anchal"},{"scode":"BD-5R","sl":"Rajshahi anchal"},{"scode":"BD-5","sl":"Rajshahi bibhag"},{"scode":"BD-5S","sl":"Rangpur anchal"},{"scode":"BD-2T","sl":"Sylhet anchal"},{"scode":"BD-3U","sl":"Tangail anchal"}]},{"ccode":"BB","cl":"Barbados","states":null},{"ccode":"BY","cl":"Belarus","states":[{"scode":"BY-BR","sl":"Brestskaya voblasts'"},{"scode":"BY-HO","sl":"Homyel'skaya voblasts’"},{"scode":"BY-HR","sl":"Hrodnenskaya voblasts'"},{"scode":"BY-MA","sl":"Mahilyowskaya voblasts'"},{"scode":"BY-MI","sl":"Minskaya voblasts'"},{"scode":"BY-VI","sl":"Vitsyebskaya voblasts'"}]},{"ccode":"BE","cl":"Belgium","states":[{"scode":"BE-VAN","sl":"Antwerpen"},{"scode":"BE-WBR","sl":"Brabant Wallon"},{"scode":"BE-BRU","sl":"Bruxelles-Capitale, Region de (fr), Brussels Hoofdstedelijk Gewest"},{"scode":"BE-WHT","sl":"Hainaut"},{"scode":"BE-VLI","sl":"Limburg"},{"scode":"BE-WLG","sl":"Liège"},{"scode":"BE-WLX","sl":"Luxembourg"},{"scode":"BE-WNA","sl":"Namur"},{"scode":"BE-VOV","sl":"Oost-Vlaanderen"},{"scode":"BE-VBR","sl":"Vlaams Brabant"},{"scode":"BE-VLG","sl":"Vlaamse Gewest"},{"scode":"BE-WAL","sl":"Wallonne, Region"},{"scode":"BE-VWV","sl":"West-Vlaanderen"}]},{"ccode":"BZ","cl":"Belize","states":[{"scode":"BZ-CY","sl":"Cayo"},{"scode":"BZ-CZL","sl":"Corozal"},{"scode":"BZ-OW","sl":"Orange Walk"},{"scode":"BZ-SC","sl":"Stann Creek"},{"scode":"BZ-TOL","sl":"Toledo"}]},{"ccode":"BJ","cl":"Benin","states":[{"scode":"BJ-AK","sl":"Atakora"},{"scode":"BJ-AQ","sl":"Atlantique"},{"scode":"BJ-BO","sl":"Borgou"},{"scode":"BJ-MO","sl":"Mono"},{"scode":"BJ-OU","sl":"Ouémé"},{"scode":"BJ-ZO","sl":"Zou"}]},{"ccode":"BM","cl":"Bermuda","states":null},{"ccode":"BT","cl":"Bhutan","states":[{"scode":"BT-33","sl":"Bumthang"},{"scode":"BT-12","sl":"Chhukha"},{"scode":"BT-22","sl":"Dagana"},{"scode":"BT-GA","sl":"Gasa"},{"scode":"BT-13","sl":"Ha"},{"scode":"BT-44","sl":"Lhuentse"},{"scode":"BT-42","sl":"Monggar"},{"scode":"BT-11","sl":"Paro"},{"scode":"BT-43","sl":"Pemagatshel"},{"scode":"BT-23","sl":"Punakha"},{"scode":"BT-45","sl":"Samdrup Jongkha"},{"scode":"BT-14","sl":"Samtse"},{"scode":"BT-31","sl":"Sarpang"},{"scode":"BT-15","sl":"Thimphu"},{"scode":"BT-TY","sl":"Trashi Yangtse"},{"scode":"BT-41","sl":"Trashigang"},{"scode":"BT-32","sl":"Trongsa"},{"scode":"BT-21","sl":"Tsirang"},{"scode":"BT-24","sl":"Wangdue Phodrang"},{"scode":"BT-34","sl":"Zhemgang"}]},{"ccode":"BO","cl":"Bolivia","states":[{"scode":"BO-H","sl":"Chuquisaca"},{"scode":"BO-C","sl":"Cochabamba"},{"scode":"BO-B","sl":"El Beni"},{"scode":"BO-L","sl":"La Paz"},{"scode":"BO-O","sl":"Oruro"},{"scode":"BO-N","sl":"Pando"},{"scode":"BO-P","sl":"Potosi"},{"scode":"BO-S","sl":"Santa Cruz"},{"scode":"BO-T","sl":"Tarija"}]},{"ccode":"BA","cl":"Bosnia & Herzegovina","states":[{"scode":"BA-BIH","sl":"Federacija Bosna i Hercegovina"},{"scode":"BA-SRP","sl":"Republika Srpska"}]},{"ccode":"CW","cl":"Botswana","states":null},{"ccode":"BW","cl":"Botswana","states":[{"scode":"BW-CE","sl":"Central [Serowe-Palapye]"},{"scode":"BW-CH","sl":"Chobe"},{"scode":"BW-GH","sl":"Ghanzi"},{"scode":"BW-KG","sl":"Kgalagadi"},{"scode":"BW-KL","sl":"Kgatleng"},{"scode":"BW-KW","sl":"Kweneng"},{"scode":"BW-NG","sl":"Ngamiland [North-West]"},{"scode":"BW-NE","sl":"North-East"},{"scode":"BW-SE","sl":"South-East"},{"scode":"BW-SO","sl":"Southern [Ngwaketse]"}]},{"ccode":"BV","cl":"Bouvet Island","states":null},{"ccode":"BR","cl":"Brazil","states":[{"scode":"BR-AC","sl":"Acre"},{"scode":"BR-AL","sl":"Alagoas"},{"scode":"BR-AP","sl":"Amapá"},{"scode":"BR-AM","sl":"Amazonas"},{"scode":"BR-BA","sl":"Bahia"},{"scode":"BR-CE","sl":"Ceará"},{"scode":"BR-DF","sl":"Distrito Federal"},{"scode":"BR-ES","sl":"Espírito Santo"},{"scode":"BR-GO","sl":"Goiás"},{"scode":"BR-MA","sl":"Maranhāo"},{"scode":"BR-MT","sl":"Mato Grosso"},{"scode":"BR-MS","sl":"Mato Grosso do Sul"},{"scode":"BR-MG","sl":"Minas Gerais"},{"scode":"BR-PR","sl":"Paraná"},{"scode":"BR-PB","sl":"Paraíba"},{"scode":"BR-PA","sl":"Pará"},{"scode":"BR-PE","sl":"Pernambuco"},{"scode":"BR-PI","sl":"Piauí"},{"scode":"BR-RN","sl":"Rio Grande do Norte"},{"scode":"BR-RS","sl":"Rio Grande do Sul"},{"scode":"BR-RJ","sl":"Rio de Janeiro"},{"scode":"BR-R0","sl":"Rondônia"},{"scode":"BR-RR","sl":"Roraima"},{"scode":"BR-SC","sl":"Santa Catarina"},{"scode":"BR-SE","sl":"Sergipe"},{"scode":"BR-SP","sl":"São Paulo"},{"scode":"BR-TO","sl":"Tocantins"}]},{"ccode":"IO","cl":"British Indian Ocean Territory","states":null},{"ccode":"BN","cl":"Brunei Darussalam","states":[{"scode":"BN-BE","sl":"Belait"},{"scode":"BN-BM","sl":"Brunei-Muara"},{"scode":"BN-TE","sl":"Temburong"},{"scode":"BN-TU","sl":"Tutong"}]},{"ccode":"BG","cl":"Bulgaria","states":[{"scode":"BG-02","sl":"Burgas"},{"scode":"BG-09","sl":"Haskovo"},{"scode":"BG-04","sl":"Loveč"},{"scode":"BG-05","sl":"Montana"},{"scode":"BG-06","sl":"Plovdiv"},{"scode":"BG-07","sl":"Ruse"},{"scode":"BG-08","sl":"Sofija"},{"scode":"BG-01","sl":"Sofija-Grad"},{"scode":"BG-03","sl":"Varna"}]},{"ccode":"BF","cl":"Burkina Faso","states":[{"scode":"BF-BAL","sl":"Balé"},{"scode":"BF-BAM","sl":"Bam"},{"scode":"BF-BAN","sl":"Banwa"},{"scode":"BF-BAZ","sl":"Bazèga"},{"scode":"BF-BGR","sl":"Bougouriba"},{"scode":"BF-BLG","sl":"Boulgou"},{"scode":"BF-BLK","sl":"Boulkiemdé"},{"scode":"BF-COM","sl":"Comoé"},{"scode":"BF-GAN","sl":"Ganzourgou"},{"scode":"BF-GNA","sl":"Gnagna"},{"scode":"BF-GOU","sl":"Gourma"},{"scode":"BF-HOU","sl":"Houet"},{"scode":"BF-IOB","sl":"Ioba"},{"scode":"BF-KAD","sl":"Kadiogo"},{"scode":"BF-KMD","sl":"Komondjari"},{"scode":"BF-KMP","sl":"Kompienga"},{"scode":"BF-KOS","sl":"Kossi"},{"scode":"BF-KOP","sl":"Koulpélogo"},{"scode":"BF-KOT","sl":"Kouritenga"},{"scode":"BF-KOW","sl":"Kourwéogo"},{"scode":"BF-KEN","sl":"Kénédougou"},{"scode":"BF-LOR","sl":"Loroum"},{"scode":"BF-LER","sl":"Léraba"},{"scode":"BF-MOU","sl":"Mouhoun"},{"scode":"BF-NAO","sl":"Nahouri"},{"scode":"BF-NAM","sl":"Namentenga"},{"scode":"BF-NAY","sl":"Nayala"},{"scode":"BF-NOU","sl":"Noumbiel"},{"scode":"BF-OUB","sl":"Oubritenga"},{"scode":"BF-OUD","sl":"Oudalan"},{"scode":"BF-PAS","sl":"Passoré"},{"scode":"BF-PON","sl":"Poni"},{"scode":"BF-SNG","sl":"Sanguié"},{"scode":"BF-SMT","sl":"Sanmatenga"},{"scode":"BF-SIS","sl":"Sissili"},{"scode":"BF-SOM","sl":"Soum"},{"scode":"BF-SOR","sl":"Sourou"},{"scode":"BF-SEN","sl":"Séno"},{"scode":"BF-TAP","sl":"Tapoa"},{"scode":"BF-TUI","sl":"Tui"},{"scode":"BF-YAG","sl":"Yagha"},{"scode":"BF-YAT","sl":"Yatenga"},{"scode":"BF-ZIR","sl":"Ziro"},{"scode":"BF-ZON","sl":"Zondoma"},{"scode":"BF-ZOU","sl":"Zoundwéogo"}]},{"ccode":"BI","cl":"Burundi","states":[{"scode":"BI-BB","sl":"Bubanza"},{"scode":"BI-BJ","sl":"Bujumbura"},{"scode":"BI-BR","sl":"Bururi"},{"scode":"BI-CA","sl":"Cankuzo"},{"scode":"BI-CI","sl":"Cibitoke"},{"scode":"BI-GI","sl":"Gitega"},{"scode":"BI-KR","sl":"Karuzi"},{"scode":"BI-KY","sl":"Kayanza"},{"scode":"BI-KI","sl":"Kirundo"},{"scode":"BI-MA","sl":"Makamba"},{"scode":"BI-MU","sl":"Muramvya"},{"scode":"BI-MY","sl":"Muyinga"},{"scode":"BI-NG","sl":"Ngozi"},{"scode":"BI-RT","sl":"Rutana"},{"scode":"BI-RY","sl":"Ruyigi"}]},{"ccode":"KH","cl":"Cambodia","states":[{"scode":"KH-2","sl":"Baat Dambang [Bătdâmbâng]"},{"scode":"KH-1","sl":"Banteay Mean Chey [Bântéay Méanchey]"},{"scode":"KH-3","sl":"Kampong Chaam [Kâmpóng Cham]"},{"scode":"KH-4","sl":"Kampong Chhnang [Kâmpóng Chhnăng]"},{"scode":"KH-5","sl":"Kampong Spueu [Kâmpóng Spœ]"},{"scode":"KH-6","sl":"Kampong Thum [Kâmpóng Thum]"},{"scode":"KH-7","sl":"Kampot [Kâmpôt]"},{"scode":"KH-8","sl":"Kandaal [Kândal]"},{"scode":"KH-10","sl":"Kracheh [Krâchéh]"},{"scode":"KH-23","sl":"Krong Kaeb [Krŏng Kêb]"},{"scode":"KH-18","sl":"Krong Preah Sihanouk [Krŏng Preăh Sihanouk]"},{"scode":"KH-11","sl":"Mond01 Kiri [Môndól Kiri]"},{"scode":"KH-22","sl":"Otdar Mean Chey [Ŏtdâr Méanchey]"},{"scode":"KH-12","sl":"Phnom Penh [Phnum Pénh]"},{"scode":"KH-15","sl":"Pousaat [Poŭthĭsăt]"},{"scode":"KH-13","sl":"Preah Vihear [Preăh Vihéar]"},{"scode":"KH-14","sl":"Prey Veaeng [Prey Vêng]"},{"scode":"KH-16","sl":"Rotanak Kiri [Rôtânôkiri]"},{"scode":"KH-17","sl":"Siem Reab [Siĕmréab]"},{"scode":"KH-19","sl":"Stueng Traeng [Stœng Trêng]"},{"scode":"KH-20","sl":"Svaay Rieng [Svay Riĕng]"},{"scode":"KH-21","sl":"Taakaev [Takêv]"}]},{"ccode":"CM","cl":"Cameroon","states":[{"scode":"CM-AD","sl":"Adamaoua"},{"scode":"CM-CE","sl":"Centre"},{"scode":"CM-ES","sl":"Est"},{"scode":"CM-EN","sl":"Far North"},{"scode":"CM-LT","sl":"Littoral"},{"scode":"CM-NO","sl":"North"},{"scode":"CM-NW","sl":"North-West"},{"scode":"CM-SU","sl":"South"},{"scode":"CM-SW","sl":"South-West"},{"scode":"CM-OU","sl":"West"}]},{"ccode":"CA","cl":"Canada","states":[{"scode":"CA-AB","sl":"Alberta"},{"scode":"CA-BC","sl":"British Columbia"},{"scode":"CA-MB","sl":"Manitoba"},{"scode":"CA-NB","sl":"New Brunswick"},{"scode":"CA-NF","sl":"Newfoundland"},{"scode":"CA-NT","sl":"Northwest Territories"},{"scode":"CA-NS","sl":"Nova Scotia"},{"scode":"CA-ON","sl":"Ontario"},{"scode":"CA-PE","sl":"Printe Edward Island"},{"scode":"CA-QC","sl":"Quebec"},{"scode":"CA-SK","sl":"Saskatchewan"},{"scode":"CA-YT","sl":"Yukon Territory"}]},{"ccode":"CV","cl":"Cape Verde","states":[{"scode":"CV-BV","sl":"Boa Vista"},{"scode":"CV-BR","sl":"Brava"},{"scode":"CV-FO","sl":"Fogo"},{"scode":"CV-B","sl":"Ilhas de Barlavento"},{"scode":"CV-S","sl":"Ilhas de Sotavento"},{"scode":"CV-MA","sl":"Maio"},{"scode":"CV-PA","sl":"Paul"},{"scode":"CV-PN","sl":"Porto Novo"},{"scode":"CV-PR","sl":"Praia"},{"scode":"CV-RG","sl":"Ribeira Grande"},{"scode":"CV-SL","sl":"Sal"},{"scode":"CV-CA","sl":"Santa Catarina"},{"scode":"CV-CR","sl":"Santa Cruz"},{"scode":"CV-SN","sl":"Sāo Nicolau"},{"scode":"CV-SV","sl":"Sāo Vicente"},{"scode":"CV-TA","sl":"Tarrafal"}]},{"ccode":"BQ","cl":"Caribbean Netherlands","states":null},{"ccode":"KY","cl":"Cayman Islands","states":null},{"ccode":"CF","cl":"Central African Republic","states":[{"scode":"CF-BB","sl":"Bamingui-Bangoran"},{"scode":"CF-BGF","sl":"Bangui"},{"scode":"CF-BK","sl":"Basse-Kotto"},{"scode":"CF-HM","sl":"Haut-Mbomou"},{"scode":"CF-HK","sl":"Haute-Kotto"},{"scode":"CF-KG","sl":"Kémo"},{"scode":"CF-LB","sl":"Lobaye"},{"scode":"CF-HS","sl":"Mambéré-Kadéï"},{"scode":"CF-MB","sl":"Mbomou"},{"scode":"CF-KB","sl":"Nana-Grébizi"},{"scode":"CF-NM","sl":"Nana-Mambéré"},{"scode":"CF-MP","sl":"Ombella-Mpoko"},{"scode":"CF-UK","sl":"Ouaka"},{"scode":"CF-AC","sl":"Ouham"},{"scode":"CF-OP","sl":"Ouham-Pendé"},{"scode":"CF-SE","sl":"Sangha-Mbaéré"},{"scode":"CF-VK","sl":"Vakaga"}]},{"ccode":"TD","cl":"Chad","states":[{"scode":"TD-BA","sl":"Batha"},{"scode":"TD-BI","sl":"Biltine"},{"scode":"TD-BET","sl":"Borkou-Ennedi-Tibesti"},{"scode":"TD-CB","sl":"Chari-Baguirmi"},{"scode":"TD-GR","sl":"Guéra"},{"scode":"TD-KA","sl":"Kanem"},{"scode":"TD-LC","sl":"Lac"},{"scode":"TD-LO","sl":"Logone-Occidental"},{"scode":"TD-LR","sl":"Logone-Oriental"},{"scode":"TD-MK","sl":"Mayo-Kébbi"},{"scode":"TD-MC","sl":"Moyen-Chari"},{"scode":"TD-OD","sl":"Ouaddaï"},{"scode":"TD-SA","sl":"Salamat"},{"scode":"TD-TA","sl":"Tandjilé"}]},{"ccode":"CL","cl":"Chile","states":[{"scode":"CL-AI","sl":"Aisén del General Carlos Ibáñiez del Campo"},{"scode":"CL-AN","sl":"Antofagasta"},{"scode":"CL-AR","sl":"Araucanía"},{"scode":"CL-AT","sl":"Atacama"},{"scode":"CL-BI","sl":"Bío-Bío"},{"scode":"CL-CO","sl":"Coquimbo"},{"scode":"CL-LI","sl":"Libertador General Bernardo O'Higgins"},{"scode":"CL-LL","sl":"Los Lagos"},{"scode":"CL-MA","sl":"Magallanes"},{"scode":"CL-ML","sl":"Maule"},{"scode":"CL-RM","sl":"Regíon Metropolitana de Santiago"},{"scode":"CL-TA","sl":"Tarapacá"},{"scode":"CL-VS","sl":"Valparaiso"}]},{"ccode":"CN","cl":"China","states":[{"scode":"CN-34","sl":"Anhui"},{"scode":"CN-11","sl":"Beijing"},{"scode":"CN-50","sl":"Chongqing"},{"scode":"CN-35","sl":"Fujian"},{"scode":"CN-62","sl":"Gansu"},{"scode":"CN-44","sl":"Guangdong"},{"scode":"CN-45","sl":"Guangxi"},{"scode":"CN-52","sl":"Guizhou"},{"scode":"CN-46","sl":"Hainan"},{"scode":"CN-13","sl":"Hebei"},{"scode":"CN-23","sl":"Heilongjiang"},{"scode":"CN-41","sl":"Henan"},{"scode":"CN-91","sl":"Hong Kong"},{"scode":"CN-42","sl":"Hubei"},{"scode":"CN-43","sl":"Hunan"},{"scode":"CN-32","sl":"Jiangsu"},{"scode":"CN-36","sl":"Jiangxi"},{"scode":"CN-22","sl":"Jilin"},{"scode":"CN-21","sl":"Liaoning"},{"scode":"CN-15","sl":"Nei Monggol"},{"scode":"CN-64","sl":"Ningxia"},{"scode":"CN-63","sl":"Qinghai"},{"scode":"CN-61","sl":"Shaanxi"},{"scode":"CN-37","sl":"Shandong"},{"scode":"CN-31","sl":"Shanghai"},{"scode":"CN-14","sl":"Shanxi"},{"scode":"CN-51","sl":"Sichuan"},{"scode":"CN-71","sl":"Taiwan"},{"scode":"CN-12","sl":"Tianjin"},{"scode":"CN-65","sl":"Xinjiang"},{"scode":"CN-54","sl":"Xizang"},{"scode":"CN-53","sl":"Yunnan"},{"scode":"CN-33","sl":"Zhejiang"}]},{"ccode":"CX","cl":"Christmas Island","states":null},{"ccode":"CC","cl":"Cocos (Keeling) Islands","states":null},{"ccode":"CO","cl":"Colombia","states":[{"scode":"CO-AMA","sl":"Amazonas"},{"scode":"CO-ANT","sl":"Antioguia"},{"scode":"CO-ARA","sl":"Arauca"},{"scode":"CO-ATL","sl":"Atlántico"},{"scode":"CO-BOL","sl":"Bolívar"},{"scode":"CO-BOY","sl":"Boyacá"},{"scode":"CO-CAL","sl":"Caldas"},{"scode":"CO-CAQ","sl":"Caquetá"},{"scode":"CO-CAS","sl":"Casanare"},{"scode":"CO-CAU","sl":"Cauca"},{"scode":"CO-CES","sl":"Cesar"},{"scode":"CO-CHO","sl":"Chocó"},{"scode":"CO-CUN","sl":"Cundinamarca"},{"scode":"CO-COR","sl":"Córdoba"},{"scode":"CO-DC","sl":"Distrito Capital de Santa Fe de Bogota"},{"scode":"CO-GUA","sl":"Guainía"},{"scode":"CO-GUV","sl":"Guaviare"},{"scode":"CO-HUI","sl":"Huila"},{"scode":"CO-LAG","sl":"La Guajira"},{"scode":"CO-MAG","sl":"Magdalena"},{"scode":"CO-MET","sl":"Meta"},{"scode":"CO-NAR","sl":"Nariño"},{"scode":"CO-NSA","sl":"Norte de Santander"},{"scode":"CO-PUT","sl":"Putumayo"},{"scode":"CO-QUI","sl":"Quindío"},{"scode":"CO-RIS","sl":"Risaralda"},{"scode":"CO-SAP","sl":"San Andrés, Providencia y Santa Catalina"},{"scode":"CO-SAN","sl":"Santander"},{"scode":"CO-SUC","sl":"Sucre"},{"scode":"CO-TOL","sl":"Tolima"},{"scode":"CO-VAC","sl":"Valle del Cauca"},{"scode":"CO-VAU","sl":"Vaupés"},{"scode":"CO-VID","sl":"Vichada"}]},{"ccode":"KM","cl":"Comoros","states":[{"scode":"KM-A","sl":"Anjouan"},{"scode":"KM-G","sl":"Grande Comore"},{"scode":"KM-M","sl":"Mohéli"}]},{"ccode":"CG","cl":"Congo","states":[{"scode":"CG-11","sl":"Bouenza"},{"scode":"CG-BZV","sl":"Brazzaville"},{"scode":"CG-8","sl":"Cuvette"},{"scode":"CG-15","sl":"Cuvette-Ouest"},{"scode":"CG-5","sl":"Kouilou"},{"scode":"CG-7","sl":"Likouala"},{"scode":"CG-2","sl":"Lékoumou"},{"scode":"CG-9","sl":"Niari"},{"scode":"CG-14","sl":"Plateaux"},{"scode":"CG-12","sl":"Pool"},{"scode":"CG-13","sl":"Sangha"}]},{"ccode":"CK","cl":"Cook Islands","states":null},{"ccode":"CR","cl":"Costa Rica","states":[{"scode":"CR-A","sl":"Alajuela"},{"scode":"CR-C","sl":"Cartago"},{"scode":"CR-G","sl":"Guanacaste"},{"scode":"CR-H","sl":"Heredia"},{"scode":"CR-L","sl":"Limón"},{"scode":"CR-P","sl":"Puntarenas"},{"scode":"CR-SJ","sl":"San José"}]},{"ccode":"CI","cl":"Cote D'ivoire","states":[{"scode":"CI-06","sl":"18 Montagnes"},{"scode":"CI-16","sl":"Agnébi"},{"scode":"CI-09","sl":"Bas-Sassandra"},{"scode":"CI-10","sl":"Denguélé"},{"scode":"CI-02","sl":"Haut-Sassandra"},{"scode":"CI-07","sl":"Lacs"},{"scode":"CI-01","sl":"Lagunes"},{"scode":"CI-12","sl":"Marahoué"},{"scode":"CI-05","sl":"Moyen-Comoé"},{"scode":"CI-11","sl":"Nzi-Comoé"},{"scode":"CI-03","sl":"Savanes"},{"scode":"CI-15","sl":"Sud-Bandama"},{"scode":"CI-13","sl":"Sud-Comoé"},{"scode":"CI-04","sl":"Vallée du Bandama"},{"scode":"CI-14","sl":"Worodougou"},{"scode":"CI-08","sl":"Zanzan"}]},{"ccode":"HR","cl":"Croatia","states":[{"scode":"HR-07","sl":"Bjelovarsko-bilogorska županija"},{"scode":"HR-12","sl":"Brodsko-posavska županija"},{"scode":"HR-19","sl":"Dubrovačko-neretvanska županija"},{"scode":"HR-18","sl":"Istarska županija"},{"scode":"HR-04","sl":"Karlovačka županija"},{"scode":"HR-06","sl":"Koprivničkco-križevačka županija"},{"scode":"HR-02","sl":"Krapinsko-zagorska županija"},{"scode":"HR-09","sl":"Ličko-senjska županija"},{"scode":"HR-20","sl":"Medjimurska županija"},{"scode":"HR-14","sl":"Osječko-baranjska županija"},{"scode":"HR-11","sl":"Požeško-slavonska županija"},{"scode":"HR-08","sl":"Primorsko-goranska županija"},{"scode":"HR-03","sl":"Sisaško-moslavačka županija"},{"scode":"HR-17","sl":"Splitsko-dalmatinska županija"},{"scode":"HR-05","sl":"Varaždinska županija"},{"scode":"HR-10","sl":"Virovitičko-podravska županija"},{"scode":"HR-16","sl":"Vukovarsko-srijemska županija"},{"scode":"HR-13","sl":"Zadarska županija"},{"scode":"HR-01","sl":"Zagrebačka županija"},{"scode":"HR-15","sl":"Šibensko-kninska županija"}]},{"ccode":"CU","cl":"Cuba","states":[{"scode":"CU-09","sl":"Camagüey"},{"scode":"CU-03","sl":"Ciudad de La Habana"},{"scode":"CU-12","sl":"Granma"},{"scode":"CU-14","sl":"Guantánamo"},{"scode":"CU-11","sl":"Holguín"},{"scode":"CU-99","sl":"Isla de la Juventud"},{"scode":"CU-02","sl":"La Habana"},{"scode":"CU-10","sl":"Las Tunas"},{"scode":"CU-04","sl":"Matanzas"},{"scode":"CU-01","sl":"Pinar del Río"},{"scode":"CU-07","sl":"Sancti Spíritus"},{"scode":"CU-13","sl":"Santiago de Cuba"},{"scode":"CU-05","sl":"Villa Clara"}]},{"ccode":"CW","cl":"Curaçao","states":null},{"ccode":"BW","cl":"Curaçao","states":[{"scode":"BW-CE","sl":"Central [Serowe-Palapye]"},{"scode":"BW-CH","sl":"Chobe"},{"scode":"BW-GH","sl":"Ghanzi"},{"scode":"BW-KG","sl":"Kgalagadi"},{"scode":"BW-KL","sl":"Kgatleng"},{"scode":"BW-KW","sl":"Kweneng"},{"scode":"BW-NG","sl":"Ngamiland [North-West]"},{"scode":"BW-NE","sl":"North-East"},{"scode":"BW-SE","sl":"South-East"},{"scode":"BW-SO","sl":"Southern [Ngwaketse]"}]},{"ccode":"CY","cl":"Cyprus","states":[{"scode":"CY-04","sl":"Ammochostos"},{"scode":"CY-06","sl":"Keryneia"},{"scode":"CY-03","sl":"Larnaka"},{"scode":"CY-01","sl":"Lefkosia"},{"scode":"CY-02","sl":"Lemesos"},{"scode":"CY-05","sl":"Pafos"}]},{"ccode":"CZ","cl":"Czech Republic","states":[{"scode":"CZ-CJM","sl":"Jihomoravský kraj"},{"scode":"CZ-CJC","sl":"Jihočeský kraj"},{"scode":"CZ-PRG","sl":"Praha"},{"scode":"CZ-CSM","sl":"Severomoravský kraj"},{"scode":"CZ-CSC","sl":"Severočeský kraj"},{"scode":"CZ-CST","sl":"Středočeský kraj"},{"scode":"CZ-CVC","sl":"Východočeský kraj"},{"scode":"CZ-CZC","sl":"Západočeský kraj"}]},{"ccode":"DK","cl":"Denmark","states":[{"scode":"DK-040","sl":"Bornholm"},{"scode":"DK-147","sl":"Frederiksberg"},{"scode":"DK-020","sl":"Frederiksborg"},{"scode":"DK-042","sl":"Fyn"},{"scode":"DK-101","sl":"Kǿbenhavn"},{"scode":"DK-015","sl":"Kǿbenhavn"},{"scode":"DK-080","sl":"Nordjylland"},{"scode":"DK-055","sl":"Ribe"},{"scode":"DK-065","sl":"Ringkǿbing"},{"scode":"DK-025","sl":"Roskilde"},{"scode":"DK-035","sl":"Storstrǿm"},{"scode":"DK-050","sl":"Sǿnderjylland"},{"scode":"DK-060","sl":"Vejle"},{"scode":"DK-030","sl":"Vestsjælland"},{"scode":"DK-076","sl":"Viborg"},{"scode":"DK-070","sl":"Århus"}]},{"ccode":"DJ","cl":"Djibouti","states":[{"scode":"DJ-AS","sl":"Ali Sabieh"},{"scode":"DJ-DI","sl":"Dikhil"},{"scode":"DJ-OB","sl":"Obock"},{"scode":"DJ-TA","sl":"Tadjoura"}]},{"ccode":"DM","cl":"Dominica","states":null},{"ccode":"DO","cl":"Dominican Republic","states":[{"scode":"DO-AZ","sl":"Azua"},{"scode":"DO-BR","sl":"Bahoruco"},{"scode":"DO-BH","sl":"Barahona"},{"scode":"DO-DA","sl":"Dajabón"},{"scode":"DO-DN","sl":"Distrito National"},{"scode":"DO-DU","sl":"Duarte"},{"scode":"DO-SE","sl":"El Seibo"},{"scode":"DO-HM","sl":"Hato Mayor"},{"scode":"DO-IN","sl":"Independencia"},{"scode":"DO-AL","sl":"La Altagracia"},{"scode":"DO-EP","sl":"La Estrelleta [Elías Piña]"},{"scode":"DO-RO","sl":"La Romana"},{"scode":"DO-VE","sl":"La Vega"},{"scode":"DO-MT","sl":"María Trinidad Sánchez"},{"scode":"DO-MN","sl":"Monseñor Nouel"},{"scode":"DO-MC","sl":"Monte Cristi"},{"scode":"DO-MP","sl":"Monte Plata"},{"scode":"DO-PN","sl":"Pedernales"},{"scode":"DO-PR","sl":"Peravia"},{"scode":"DO-PP","sl":"Puerto Plata"},{"scode":"DO-SC","sl":"Salcedo"},{"scode":"DO-SM","sl":"Samaná"},{"scode":"DO-CR","sl":"San Cristóbal"},{"scode":"DO-JU","sl":"San Juan"},{"scode":"DO-PM","sl":"San Pedro de Macorís"},{"scode":"DO-SZ","sl":"Sanchez Ramírez"},{"scode":"DO-ST","sl":"Santiago"},{"scode":"DO-SR","sl":"Santiago Rodríguez"},{"scode":"DO-VA","sl":"Valverde"}]},{"ccode":"TP","cl":"East Timor","states":null},{"ccode":"EC","cl":"Ecuador","states":[{"scode":"EC-A","sl":"Azuay"},{"scode":"EC-B","sl":"Bolívar"},{"scode":"EC-C","sl":"Carchi"},{"scode":"EC-F","sl":"Cañar"},{"scode":"EC-H","sl":"Chimborazo"},{"scode":"EC-X","sl":"Cotopaxi"},{"scode":"EC-O","sl":"El Oro"},{"scode":"EC-E","sl":"Esmeraldas"},{"scode":"EC-W","sl":"Galápagos"},{"scode":"EC-G","sl":"Guayas"},{"scode":"EC-I","sl":"Imbabura"},{"scode":"EC-L","sl":"Loja"},{"scode":"EC-R","sl":"Los Ríos"},{"scode":"EC-M","sl":"Manabí"},{"scode":"EC-S","sl":"Morona-Santiago"},{"scode":"EC-N","sl":"Napo"},{"scode":"EC-Y","sl":"Pastaza"},{"scode":"EC-P","sl":"Pichincha"},{"scode":"EC-U","sl":"Sucumbíos"},{"scode":"EC-T","sl":"Tungurahua"},{"scode":"EC-Z","sl":"Zarnora-Chinchipe"}]},{"ccode":"EG","cl":"Egypt","states":[{"scode":"EG-DK","sl":"Ad Daqahlīyah"},{"scode":"EG-BA","sl":"Al Baḩr al Aḩmar"},{"scode":"EG-BH","sl":"Al Buḩayrah"},{"scode":"EG-FYM","sl":"Al Fayyūm"},{"scode":"EG-GH","sl":"Al Gharbīyah"},{"scode":"EG-ALX","sl":"Al Iskandarīyah"},{"scode":"EG-IS","sl":"Al Ismā‘īlīyah"},{"scode":"EG-GZ","sl":"Al Jīzah"},{"scode":"EG-MN","sl":"Al Minyā"},{"scode":"EG-MNF","sl":"Al Minūfīyah"},{"scode":"EG-KB","sl":"Al Qalyūbīyah"},{"scode":"EG-C","sl":"Al Qāhirah"},{"scode":"EG-WAD","sl":"Al Wādī al Jadīd"},{"scode":"EG-SUZ","sl":"As Suways"},{"scode":"EG-SHR","sl":"Ash Sharqīyah"},{"scode":"EG-ASN","sl":"Aswān"},{"scode":"EG-AST","sl":"Asyūţ"},{"scode":"EG-BNS","sl":"Banī Suwayf"},{"scode":"EG-PTS","sl":"Būr Sa‘īd"},{"scode":"EG-DT","sl":"Dumyāţ"},{"scode":"EG-JS","sl":"Janūb Sīnā'"},{"scode":"EG-KFS","sl":"Kafr ash Shaykh"},{"scode":"EG-MT","sl":"Maţrūḩ"},{"scode":"EG-KN","sl":"Qinā"},{"scode":"EG-SIN","sl":"Shamāl Sīnā'"},{"scode":"EG-SHG","sl":"Sūhāj"}]},{"ccode":"SV","cl":"El Salvador","states":[{"scode":"SV-AH","sl":"Ahuachapán"},{"scode":"SV-CA","sl":"Cabañas"},{"scode":"SV-CH","sl":"Chalatenango"},{"scode":"SV-CU","sl":"Cuscatlán"},{"scode":"SV-LI","sl":"La Libertad"},{"scode":"SV-PA","sl":"La Paz"},{"scode":"SV-UN","sl":"La Unión"},{"scode":"SV-MO","sl":"Morazán"},{"scode":"SV-SM","sl":"San Miguel"},{"scode":"SV-SS","sl":"San Salvador"},{"scode":"SV-SV","sl":"San Vicente"},{"scode":"SV-SA","sl":"Santa Ana"},{"scode":"SV-SO","sl":"Sonsonate"},{"scode":"SV-SU","sl":"Usulután"}]},{"ccode":"GQ","cl":"Equatorial Guinea","states":[{"scode":"GQ-AN","sl":"Annobón"},{"scode":"GQ-BN","sl":"Bioko Norte"},{"scode":"GQ-BS","sl":"Bioko Sur"},{"scode":"GQ-CS","sl":"Centro Sur"},{"scode":"GQ-KN","sl":"Kie-Ntem"},{"scode":"GQ-LI","sl":"Litoral"},{"scode":"GQ-C","sl":"Región Continental"},{"scode":"GQ-I","sl":"Región Insular"},{"scode":"GQ-WN","sl":"Wele-Nzás"}]},{"ccode":"ER","cl":"Eritrea","states":[{"scode":"ER-AG","sl":"Akele Guzai [Akalä Guzay]"},{"scode":"ER-AS","sl":"Asmara [Asmära]"},{"scode":"ER-BA","sl":"Barka"},{"scode":"ER-DE","sl":"Denkalia [Dänkali]"},{"scode":"ER-GS","sl":"Gash-Setit [Gaš enna Sätit]"},{"scode":"ER-HA","sl":"Hamasien [Hamasén]"},{"scode":"ER-SA","sl":"Sahel"},{"scode":"ER-SM","sl":"Semhar [Sämhar]"},{"scode":"ER-SN","sl":"Senhit [Sänhet]"},{"scode":"ER-SR","sl":"Seraye [Särayé]"}]},{"ccode":"EE","cl":"Estonia","states":[{"scode":"EE-37","sl":"Harjumaa"},{"scode":"EE-39","sl":"Hiiumaa"},{"scode":"EE-44","sl":"Ida-Virumaa"},{"scode":"EE-51","sl":"Järvamaa"},{"scode":"EE-49","sl":"Jōgevamaa"},{"scode":"EE-59","sl":"Lääne-Virumaa"},{"scode":"EE-57","sl":"Läänemaa"},{"scode":"EE-67","sl":"Pärnumaa"},{"scode":"EE-65","sl":"Pōlvamaa"},{"scode":"EE-70","sl":"Raplamaa"},{"scode":"EE-74","sl":"Saaremaa"},{"scode":"EE-78","sl":"Tartumaa"},{"scode":"EE-82","sl":"Valgamaa"},{"scode":"EE-84","sl":"Viljandimaa"},{"scode":"EE-86","sl":"Vōrumaa"}]},{"ccode":"ET","cl":"Ethiopia","states":[{"scode":"ET-AA","sl":"Addis Ababa [Addis Abeba]"},{"scode":"ET-AF","sl":"Afar"},{"scode":"ET-AM","sl":"Amara [Amhara]"},{"scode":"ET-BE","sl":"Benshangul-Gumaz [Bénishangul]"},{"scode":"ET-GA","sl":"Gambela Peoples [Gambéla]"},{"scode":"ET-HA","sl":"Harari People [Harer]"},{"scode":"ET-OR","sl":"Oromia [Oromo]"},{"scode":"ET-SO","sl":"Somali"},{"scode":"ET-SN","sl":"Southern Nations, Nationalities and Peoples"},{"scode":"ET-TI","sl":"Tigrai [Tegré]"}]},{"ccode":"FK","cl":"Falkland Islands","states":null},{"ccode":"FO","cl":"Faroe Islands","states":null},{"ccode":"FJ","cl":"Fiji","states":[{"scode":"FJ-C","sl":"Central"},{"scode":"FJ-E","sl":"Eastern"},{"scode":"FJ-N","sl":"Northern"},{"scode":"FJ-R","sl":"Rotuma"},{"scode":"FJ-W","sl":"Western"}]},{"ccode":"FI","cl":"Finland","states":[{"scode":"FI-AL","sl":"Ahvenanmaan lääni"},{"scode":"FI-ES","sl":"Etelä-Suomen lääni"},{"scode":"FI-IS","sl":"Itä-Suomen lääni"},{"scode":"FI-LL","sl":"Lapin lääni"},{"scode":"FI-LS","sl":"Länsi-Suomen lääni"},{"scode":"FI-OL","sl":"Oulun lääni"}]},{"ccode":"FR","cl":"France","states":[{"scode":"FR-01","sl":"Ain"},{"scode":"FR-02","sl":"Aisne"},{"scode":"FR-03","sl":"Allier"},{"scode":"FR-06","sl":"Alpes-Maritimes"},{"scode":"FR-04","sl":"Alpes-de-Haute-Provence"},{"scode":"FR-A","sl":"Alsace"},{"scode":"FR-B","sl":"Aquitaine"},{"scode":"FR-08","sl":"Ardennes"},{"scode":"FR-07","sl":"Ardèche"},{"scode":"FR-09","sl":"Ariège"},{"scode":"FR-10","sl":"Aube"},{"scode":"FR-11","sl":"Aude"},{"scode":"FR-C","sl":"Auvergne"},{"scode":"FR-12","sl":"Aveyron"},{"scode":"FR-67","sl":"Bas-Rhin"},{"scode":"FR-P","sl":"Basse-Normandie"},{"scode":"FR-13","sl":"Bauches-du-Rhône"},{"scode":"FR-D","sl":"Bourgogne"},{"scode":"FR-E","sl":"Bretagne"},{"scode":"FR-14","sl":"Calvados"},{"scode":"FR-15","sl":"Cantal"},{"scode":"FR-F","sl":"Centre"},{"scode":"FR-G","sl":"Champagne-Ardenne"},{"scode":"FR-16","sl":"Charente"},{"scode":"FR-17","sl":"Charente-Maritime"},{"scode":"FR-18","sl":"Cher"},{"scode":"FR-19","sl":"Corrèze"},{"scode":"FR-H","sl":"Corse"},{"scode":"FR-2A","sl":"Corse-du-Sud"},{"scode":"FR-22","sl":"Cotes-d'Armor"},{"scode":"FR-23","sl":"Creuse"},{"scode":"FR-21","sl":"Côte-d'Or"},{"scode":"FR-79","sl":"Deux-Sèvres"},{"scode":"FR-24","sl":"Dordogne"},{"scode":"FR-25","sl":"Doubs"},{"scode":"FR-26","sl":"Drôme"},{"scode":"FR-91","sl":"Essonne"},{"scode":"FR-27","sl":"Eure"},{"scode":"FR-28","sl":"Eure-et-Loir"},{"scode":"FR-29","sl":"Finistère"},{"scode":"FR-I","sl":"Franche-Comté"},{"scode":"FR-30","sl":"Gard"},{"scode":"FR-32","sl":"Gers"},{"scode":"FR-33","sl":"Gironde"},{"scode":"FR-GP","sl":"Guadeloupe"},{"scode":"FR-GF","sl":"Guyane"},{"scode":"FR-68","sl":"Haut-Rhin"},{"scode":"FR-2B","sl":"Haute-Corse"},{"scode":"FR-31","sl":"Haute-Garonne"},{"scode":"FR-43","sl":"Haute-Loire"},{"scode":"FR-52","sl":"Haute-Marne"},{"scode":"FR-Q","sl":"Haute-Normandie"},{"scode":"FR-74","sl":"Haute-Savoie"},{"scode":"FR-70","sl":"Haute-Saône"},{"scode":"FR-87","sl":"Haute-Vienne"},{"scode":"FR-05","sl":"Hautes-Alpes"},{"scode":"FR-65","sl":"Hautes-Pyrénées"},{"scode":"FR-92","sl":"Hauts-de-Seine"},{"scode":"FR-34","sl":"Hérault"},{"scode":"FR-35","sl":"Ille-et-Vilaine"},{"scode":"FR-36","sl":"Indre"},{"scode":"FR-37","sl":"Indre-et-Loire"},{"scode":"FR-38","sl":"Isère"},{"scode":"FR-39","sl":"Jura"},{"scode":"FR-40","sl":"Landes"},{"scode":"FR-K","sl":"Languedoc-Roussillon"},{"scode":"FR-L","sl":"Limousin"},{"scode":"FR-41","sl":"Loir-et-Cher"},{"scode":"FR-42","sl":"Loire"},{"scode":"FR-44","sl":"Loire-Atlantique"},{"scode":"FR-45","sl":"Loiret"},{"scode":"FR-M","sl":"Lorraine"},{"scode":"FR-46","sl":"Lot"},{"scode":"FR-47","sl":"Lot-et-Garonne"},{"scode":"FR-48","sl":"Lozère"},{"scode":"FR-49","sl":"Maine-et-Loire"},{"scode":"FR-50","sl":"Manche"},{"scode":"FR-51","sl":"Marne"},{"scode":"FR-MQ","sl":"Martinique"},{"scode":"FR-53","sl":"Mayenne"},{"scode":"FR-YT","sl":"Mayotte"},{"scode":"FR-54","sl":"Meurthe-et-Moselle"},{"scode":"FR-55","sl":"Meuse"},{"scode":"FR-N","sl":"Midi-Pyrénées"},{"scode":"FR-56","sl":"Morbihan"},{"scode":"FR-57","sl":"Moselle"},{"scode":"FR-58","sl":"Nièvre"},{"scode":"FR-59","sl":"Nord"},{"scode":"FR-O","sl":"Nord-Pas-de-Calais"},{"scode":"FR-NC","sl":"Nouvelle-Calédonie"},{"scode":"FR-60","sl":"Oise"},{"scode":"FR-61","sl":"Orne"},{"scode":"FR-75","sl":"Paris"},{"scode":"FR-62","sl":"Pas-de-Calais"},{"scode":"FR-R","sl":"Pays de la Loire"},{"scode":"FR-S","sl":"Picardie"},{"scode":"FR-T","sl":"Poitou-Charentes"},{"scode":"FR-PF","sl":"Polynésie française"},{"scode":"FR-U","sl":"Provence-Alpes-Côte d'Azur"},{"scode":"FR-63","sl":"Puy-de-Dôme"},{"scode":"FR-64","sl":"Pyrénées-Atlantiques"},{"scode":"FR-66","sl":"Pyrénées-Orientales"},{"scode":"FR-69","sl":"Rhône"},{"scode":"FR-V","sl":"Rhône-Alpes"},{"scode":"FR-RE","sl":"Réunion"},{"scode":"FR-PM","sl":"Saint-Pierre-et-Miquelon"},{"scode":"FR-72","sl":"Sarthe"},{"scode":"FR-73","sl":"Savoie"},{"scode":"FR-71","sl":"Saône-et-Loire"},{"scode":"FR-76","sl":"Seine-Maritime"},{"scode":"FR-93","sl":"Seine-Saint-Denis"},{"scode":"FR-77","sl":"Seine-et-Marne"},{"scode":"FR-80","sl":"Somme"},{"scode":"FR-81","sl":"Tarn"},{"scode":"FR-82","sl":"Tarn-et-Garonne"},{"scode":"FR-TF","sl":"Terres Australes"},{"scode":"FR-90","sl":"Territoire de Belfort"},{"scode":"FR-95","sl":"Val-d'Oise"},{"scode":"FR-94","sl":"Val-de-Marne"},{"scode":"FR-83","sl":"Var"},{"scode":"FR-84","sl":"Vaucluse"},{"scode":"FR-85","sl":"Vendée"},{"scode":"FR-86","sl":"Vienne"},{"scode":"FR-88","sl":"Vosges"},{"scode":"FR-WF","sl":"Wallis et Futuna"},{"scode":"FR-89","sl":"Yonne"},{"scode":"FR-78","sl":"Yvelines"},{"scode":"FR-J","sl":"Île-de-France"}]},{"ccode":"GF","cl":"French Guiana","states":null},{"ccode":"PF","cl":"French Polynesia","states":null},{"ccode":"TF","cl":"French Southern Territories","states":null},{"ccode":"GA","cl":"Gabon","states":[{"scode":"GA-1","sl":"Estuaire"},{"scode":"GA-2","sl":"Haut-Ogooué"},{"scode":"GA-3","sl":"Moyen-Ogooué"},{"scode":"GA-4","sl":"Ngounié"},{"scode":"GA-5","sl":"Nyanga"},{"scode":"GA-6","sl":"Ogooué-Ivindo"},{"scode":"GA-7","sl":"Ogooué-Lolo"},{"scode":"GA-8","sl":"Ogooué-Maritime"},{"scode":"GA-9","sl":"Woleu-Ntem"}]},{"ccode":"GM","cl":"Gambia","states":[{"scode":"GM-B","sl":"Banjul"},{"scode":"GM-L","sl":"Lower River"},{"scode":"GM-M","sl":"MacCarthy Island"},{"scode":"GM-N","sl":"North Bank"},{"scode":"GM-U","sl":"Upper River"},{"scode":"GM-W","sl":"Western"}]},{"ccode":"GE","cl":"Georgia","states":[{"scode":"GE-01","sl":"Abashis Raioni"},{"scode":"GE-AJ","sl":"Acharis Avtonomiuri Respublika [Ajaria]"},{"scode":"GE-02","sl":"Adigenis Raioni"},{"scode":"GE-03","sl":"Akhalgoris Raioni"},{"scode":"GE-04","sl":"Akhalk'alak'is Raioni"},{"scode":"GE-05","sl":"Akhalts'ikhis Raioni"},{"scode":"GE-06","sl":"Akhmetis Raioni"},{"scode":"GE-07","sl":"Ambrolauris Raioni"},{"scode":"GE-AB","sl":"Ap'khazet'is Avtonomiuri Respublika [Abkhazia]"},{"scode":"GE-08","sl":"Aspindzis Raioni"},{"scode":"GE-09","sl":"Baghdat'is Raioni"},{"scode":"GE-BUS","sl":"Bat'umi"},{"scode":"GE-10","sl":"Bolnisis Raioni"},{"scode":"GE-11","sl":"Borjomis Raioni"},{"scode":"GE-12","sl":"Ch'khorotsqus Raioni"},{"scode":"GE-13","sl":"Ch'okhatauris Raioni"},{"scode":"GE-CHI","sl":"Chiat'ura"},{"scode":"GE-14","sl":"Dedop'listsqaros Raioni"},{"scode":"GE-15","sl":"Dmanisis Raioni"},{"scode":"GE-16","sl":"Dushet'is Raioni"},{"scode":"GE-GAG","sl":"Gagra"},{"scode":"GE-17","sl":"Galis Raioni"},{"scode":"GE-18","sl":"Gardabnis Raioni"},{"scode":"GE-GOR","sl":"Gori"},{"scode":"GE-19","sl":"Goris Raioni"},{"scode":"GE-20","sl":"Gudaut'is Raioni"},{"scode":"GE-21","sl":"Gulrip'shis Raioni"},{"scode":"GE-22","sl":"Gurjaanis Raioni"},{"scode":"GE-23","sl":"Javis Raioni"},{"scode":"GE-24","sl":"K'arelis Raioni"},{"scode":"GE-26","sl":"K'edis Raioni"},{"scode":"GE-33","sl":"K'obuletis Raioni"},{"scode":"GE-KUT","sl":"K'ut'aisi"},{"scode":"GE-25","sl":"Kaspis Raioni"},{"scode":"GE-27","sl":"Kharagaulis Raioni"},{"scode":"GE-28","sl":"Khashuris Raioni"},{"scode":"GE-29","sl":"Khelvach'auris Raioni"},{"scode":"GE-30","sl":"Khobis Raioni"},{"scode":"GE-31","sl":"Khonis Raioni"},{"scode":"GE-32","sl":"Khulos Raioni"},{"scode":"GE-34","sl":"Lagodekhis Raioni"},{"scode":"GE-35","sl":"Lanch'khut'is Raioni"},{"scode":"GE-36","sl":"Lentekhis Raioni"},{"scode":"GE-37","sl":"Marneulis Raioni"},{"scode":"GE-38","sl":"Martvilis Raioni"},{"scode":"GE-39","sl":"Mestiis Raioni"},{"scode":"GE-40","sl":"Mts'khet'is Raioni"},{"scode":"GE-41","sl":"Ninotsmindis Raioni"},{"scode":"GE-42","sl":"Och'amch'iris Raioni"},{"scode":"GE-43","sl":"Onis Raioni"},{"scode":"GE-44","sl":"Ozurget'is Raioni"},{"scode":"GE-PTI","sl":"P'ot'i"},{"scode":"GE-45","sl":"Qazbegis Raioni"},{"scode":"GE-46","sl":"Qvarlis Raioni"},{"scode":"GE-RUS","sl":"Rust'avi"},{"scode":"GE-47","sl":"Sach'kheris Raioni"},{"scode":"GE-48","sl":"Sagarejos Raioni"},{"scode":"GE-49","sl":"Samtrediis Raioni"},{"scode":"GE-50","sl":"Senakis Raioni"},{"scode":"GE-51","sl":"Shuakhevis Raioni"},{"scode":"GE-52","sl":"Sighnaghis Raioni"},{"scode":"GE-SUI","sl":"Sokhumi"},{"scode":"GE-53","sl":"Sokhumis Raioni"},{"scode":"GE-TBS","sl":"T'bilisi"},{"scode":"GE-54","sl":"T'elavis Raioni"},{"scode":"GE-55","sl":"T'erjolis Raioni"},{"scode":"GE-56","sl":"T'et'ritsqaros Raioni"},{"scode":"GE-57","sl":"T'ianet'is Raioni"},{"scode":"GE-TQI","sl":"Tqibuli"},{"scode":"GE-TQV","sl":"Tqvarch'eli"},{"scode":"GE-58","sl":"Ts'ageris Raioni"},{"scode":"GE-59","sl":"Tsalenjikhis Raioni"},{"scode":"GE-60","sl":"Tsalkis Raioni"},{"scode":"GE-TSQ","sl":"Tsqalmbo"},{"scode":"GE-61","sl":"Vanis Raioni"},{"scode":"GE-62","sl":"Zestap'onis Raioni"},{"scode":"GE-ZUG","sl":"Zugdidi"},{"scode":"GE-63","sl":"Zugdidis Raioni"}]},{"ccode":"DE","cl":"Germany","states":[{"scode":"DE-BW","sl":"Baden-Württemberg"},{"scode":"DE-BY","sl":"Bayern"},{"scode":"DE-BE","sl":"Berlin"},{"scode":"DE-BB","sl":"Brandenburg"},{"scode":"DE-HB","sl":"Bremen"},{"scode":"DE-HH","sl":"Hamburg"},{"scode":"DE-HE","sl":"Hessen"},{"scode":"DE-MV","sl":"Mecklenburg-Vorpommern"},{"scode":"DE-NI","sl":"Niedersachsen"},{"scode":"DE-NW","sl":"Nordrhein-Westfalen"},{"scode":"DE-RP","sl":"Rheinland-Pfalz"},{"scode":"DE-SL","sl":"Saarland"},{"scode":"DE-SN","sl":"Sachsen"},{"scode":"DE-ST","sl":"Sachsen-Anhalt"},{"scode":"DE-SH","sl":"Schleswig-Holstein"},{"scode":"DE-TH","sl":"Thüringen"}]},{"ccode":"GH","cl":"Ghana","states":[{"scode":"GH-AH","sl":"Ashanti"},{"scode":"GH-BA","sl":"Brong-Ahafo"},{"scode":"GH-CP","sl":"Central"},{"scode":"GH-EP","sl":"Eastern"},{"scode":"GH-AA","sl":"Greater Accra"},{"scode":"GH-NP","sl":"Northern"},{"scode":"GH-UE","sl":"Upper East"},{"scode":"GH-UW","sl":"Upper West"},{"scode":"GH-TV","sl":"Volta"},{"scode":"GH-WP","sl":"Western"}]},{"ccode":"GI","cl":"Gibraltar","states":null},{"ccode":"GR","cl":"Greece","states":[{"scode":"GR-13","sl":"Achaïa"},{"scode":"GR-01","sl":"Aitolia-Akarnania"},{"scode":"GR-I","sl":"Anatoliki Makedonia kai Thraki"},{"scode":"GR-11","sl":"Argolis"},{"scode":"GR-12","sl":"Arkadia"},{"scode":"GR-31","sl":"Arta"},{"scode":"GR-IX","sl":"Attiki"},{"scode":"GR-A1","sl":"Attiki"},{"scode":"GR-64","sl":"Chalkidiki"},{"scode":"GR-94","sl":"Chania"},{"scode":"GR-85","sl":"Chios"},{"scode":"GR-81","sl":"Dodekanisos"},{"scode":"GR-52","sl":"Drama"},{"scode":"GR-VII","sl":"Dytiki Ellada"},{"scode":"GR-III","sl":"Dytiki Makedonia"},{"scode":"GR-71","sl":"Evros"},{"scode":"GR-05","sl":"Evrytania"},{"scode":"GR-04","sl":"Evvoia"},{"scode":"GR-63","sl":"Florina"},{"scode":"GR-07","sl":"Fokis"},{"scode":"GR-06","sl":"Fthiotis"},{"scode":"GR-51","sl":"Grevena"},{"scode":"GR-14","sl":"Ileia"},{"scode":"GR-53","sl":"Imathia"},{"scode":"GR-33","sl":"Ioannina"},{"scode":"GR-VI","sl":"Ionioi Nisoi"},{"scode":"GR-IV","sl":"Ipeiros"},{"scode":"GR-91","sl":"Irakleion"},{"scode":"GR-41","sl":"Karditsa"},{"scode":"GR-56","sl":"Kastoria"},{"scode":"GR-55","sl":"Kavalla"},{"scode":"GR-23","sl":"Kefallinia"},{"scode":"GR-II","sl":"Kentriki Makedonia"},{"scode":"GR-22","sl":"Kerkyra"},{"scode":"GR-57","sl":"Kilkis"},{"scode":"GR-15","sl":"Korinthia"},{"scode":"GR-58","sl":"Kozani"},{"scode":"GR-XIII","sl":"Kriti"},{"scode":"GR-82","sl":"Kyklades"},{"scode":"GR-16","sl":"Lakonia"},{"scode":"GR-42","sl":"Larisa"},{"scode":"GR-92","sl":"Lasithion"},{"scode":"GR-24","sl":"Lefkas"},{"scode":"GR-83","sl":"Lesvos"},{"scode":"GR-43","sl":"Magnisia"},{"scode":"GR-17","sl":"Messinia"},{"scode":"GR-XII","sl":"Notio Aigaio"},{"scode":"GR-59","sl":"Pella"},{"scode":"GR-X","sl":"Peloponnisos"},{"scode":"GR-61","sl":"Pieria"},{"scode":"GR-34","sl":"Preveza"},{"scode":"GR-93","sl":"Rethymnon"},{"scode":"GR-73","sl":"Rodopi"},{"scode":"GR-84","sl":"Samos"},{"scode":"GR-62","sl":"Serrai"},{"scode":"GR-VIII","sl":"Sterea Ellada"},{"scode":"GR-32","sl":"Thesprotia"},{"scode":"GR-V","sl":"Thessalia"},{"scode":"GR-54","sl":"Thessaloniki"},{"scode":"GR-44","sl":"Trikala"},{"scode":"GR-03","sl":"Voiotia"},{"scode":"GR-XI","sl":"Voreio Aigaio"},{"scode":"GR-72","sl":"Xanthi"},{"scode":"GR-21","sl":"Zakynthos"}]},{"ccode":"GL","cl":"Greenland","states":null},{"ccode":"GD","cl":"Grenada","states":null},{"ccode":"GP","cl":"Guadeloupe","states":null},{"ccode":"GU","cl":"Guam","states":null},{"ccode":"GT","cl":"Guatemala","states":[{"scode":"GT-AV","sl":"Alta Verapaz"},{"scode":"GT-BV","sl":"Baja Verapaz"},{"scode":"GT-CM","sl":"Chimaltenango"},{"scode":"GT-CQ","sl":"Chiquimula"},{"scode":"GT-PR","sl":"El Progreso"},{"scode":"GT-ES","sl":"Escuintla"},{"scode":"GT-GU","sl":"Guatemala"},{"scode":"GT-HU","sl":"Huehuetenango"},{"scode":"GT-IZ","sl":"Izabal"},{"scode":"GT-JA","sl":"Jalapa"},{"scode":"GT-JU","sl":"Jutiapa"},{"scode":"GT-PE","sl":"Petén"},{"scode":"GT-QZ","sl":"Quezaltenango"},{"scode":"GT-QC","sl":"Quiché"},{"scode":"GT-RE","sl":"Retalhuleu"},{"scode":"GT-SA","sl":"Sacatepéquez"},{"scode":"GT-SM","sl":"San Marcos"},{"scode":"GT-SR","sl":"Santa Rosa"},{"scode":"GT-SO","sl":"Sololá"},{"scode":"GT-SU","sl":"Suchitepéquez"},{"scode":"GT-TO","sl":"Totonicapán"},{"scode":"GT-ZA","sl":"Zacapa"}]},{"ccode":"GN","cl":"Guinea","states":[{"scode":"GN-B","sl":"Bake, Gouvernorat de"},{"scode":"GN-BE","sl":"Beyla"},{"scode":"GN-BF","sl":"Boffa"},{"scode":"GN-BK","sl":"Boké"},{"scode":"GN-C","sl":"Conakry, Gouvernorat de"},{"scode":"GN-CO","sl":"Coyah"},{"scode":"GN-DB","sl":"Dabola"},{"scode":"GN-DL","sl":"Dalaba"},{"scode":"GN-DI","sl":"Dinguiraye"},{"scode":"GN-DU","sl":"Dubréka"},{"scode":"GN-FA","sl":"Faranah"},{"scode":"GN-F","sl":"Faranah, Gouvernorat de"},{"scode":"GN-FO","sl":"Forécariah"},{"scode":"GN-FR","sl":"Fria"},{"scode":"GN-GA","sl":"Gaoual"},{"scode":"GN-GU","sl":"Guékédou"},{"scode":"GN-KA","sl":"Kankan"},{"scode":"GN-K","sl":"Kankan, Gouvernorat de"},{"scode":"GN-KD","sl":"Kindia"},{"scode":"GN-D","sl":"Kindia, Gouvernorat de"},{"scode":"GN-KS","sl":"Kissidougou"},{"scode":"GN-KB","sl":"Koubia"},{"scode":"GN-KD","sl":"Koundara"},{"scode":"GN-KO","sl":"Kouroussa"},{"scode":"GN-KE","sl":"Kérouané"},{"scode":"GN-LA","sl":"Labé"},{"scode":"GN-L","sl":"Labé, Gouvernorat de"},{"scode":"GN-LO","sl":"Lola"},{"scode":"GN-LE","sl":"Lélouma"},{"scode":"GN-MC","sl":"Macenta"},{"scode":"GN-ML","sl":"Mali"},{"scode":"GN-MM","sl":"Mamou"},{"scode":"GN-M","sl":"Mamou, Gouvernorat de"},{"scode":"GN-MD","sl":"Mandiana"},{"scode":"GN-NZ","sl":"Nzérékoré"},{"scode":"GN-N","sl":"Nzérékoré, Gouvernorat de"},{"scode":"GN-PI","sl":"Pita"},{"scode":"GN-SI","sl":"Siguiri"},{"scode":"GN-TO","sl":"Tougué"},{"scode":"GN-TE","sl":"Télimélé"},{"scode":"GN-YO","sl":"Yomou"}]},{"ccode":"GW","cl":"Guinea-Bissau","states":[{"scode":"GW-BA","sl":"Bafatá"},{"scode":"GW-BM","sl":"Biombo"},{"scode":"GW-BS","sl":"Bissau"},{"scode":"GW-BL","sl":"Bolama"},{"scode":"GW-CA","sl":"Cacheu"},{"scode":"GW-GA","sl":"Gabú"},{"scode":"GW-OI","sl":"Oio"},{"scode":"GW-QU","sl":"Quinara"}]},{"ccode":"GY","cl":"Guyana","states":[{"scode":"GY-BA","sl":"Barima-Waini"},{"scode":"GY-CU","sl":"Cuyuni-Mazaruni"},{"scode":"GY-DE","sl":"Demerara-Mahaica"},{"scode":"GY-EB","sl":"East Berbice-Corentyne"},{"scode":"GY-ES","sl":"Essequibo Islands-West Demerara"},{"scode":"GY-MA","sl":"Mahaica-Berbice"},{"scode":"GY-PM","sl":"Pomeroon-Supenaam"},{"scode":"GY-PT","sl":"Potaro-Siparuni"},{"scode":"GY-UD","sl":"Upper Demerara-Berbice"},{"scode":"GY-UT","sl":"Upper Takutu-Upper Essequibo"}]},{"ccode":"HT","cl":"Haiti","states":[{"scode":"HT-AR","sl":"Artibonite"},{"scode":"HT-CE","sl":"Centre"},{"scode":"HT-GA","sl":"Grande-Anse"},{"scode":"HT-ND","sl":"Nord"},{"scode":"HT-NE","sl":"Nord-Est"},{"scode":"HT-NO","sl":"Nord-Ouest"},{"scode":"HT-OU","sl":"Ouest"},{"scode":"HT-SD","sl":"Sud"},{"scode":"HT-SE","sl":"Sud-Est"}]},{"ccode":"HM","cl":"Heard & McDonald Islands","states":null},{"ccode":"HN","cl":"Honduras","states":[{"scode":"HN-AT","sl":"Atlántida"},{"scode":"HN-CH","sl":"Choluteca"},{"scode":"HN-CL","sl":"Colón"},{"scode":"HN-CM","sl":"Comayagua"},{"scode":"HN-CP","sl":"Copán"},{"scode":"HN-CR","sl":"Cortés"},{"scode":"HN-EP","sl":"El Paraíso"},{"scode":"HN-FM","sl":"Francisco Morazán"},{"scode":"HN-GD","sl":"Gracias a Dios"},{"scode":"HN-IN","sl":"Intibucá"},{"scode":"HN-IB","sl":"Islas de la Bahía"},{"scode":"HN-LP","sl":"La Paz"},{"scode":"HN-LE","sl":"Lempira"},{"scode":"HN-OC","sl":"Ocotepeque"},{"scode":"HN-OL","sl":"Olancho"},{"scode":"HN-SB","sl":"Santa Bárbara"},{"scode":"HN-VA","sl":"Valle"},{"scode":"HN-YO","sl":"Yoro"}]},{"ccode":"HK","cl":"Hong Kong","states":null},{"ccode":"HU","cl":"Hungary","states":[{"scode":"HU-BA","sl":"Baranya"},{"scode":"HU-BZ","sl":"Borsod-Abaúj-Zemplén"},{"scode":"HU-BU","sl":"Budapest"},{"scode":"HU-BK","sl":"Bács-Kiskun"},{"scode":"HU-BE","sl":"Békés"},{"scode":"HU-BC","sl":"Békéscsaba"},{"scode":"HU-CS","sl":"Csongrád"},{"scode":"HU-DE","sl":"Debrecen"},{"scode":"HU-DU","sl":"Dunaújváros"},{"scode":"HU-EG","sl":"Eger"},{"scode":"HU-FE","sl":"Fejér"},{"scode":"HU-GY","sl":"Gyór"},{"scode":"HU-GS","sl":"Gyór-Moson-Sopron"},{"scode":"HU-HB","sl":"Hajdú-Bihar"},{"scode":"HU-HE","sl":"Heves"},{"scode":"HU-HV","sl":"Hódmezóvásárhely"},{"scode":"HU-JN","sl":"Jasz-Nagykun-Szolnok"},{"scode":"HU-KV","sl":"Kaposvár"},{"scode":"HU-KM","sl":"Kecskemét"},{"scode":"HU-KE","sl":"Komárom-Esztergom"},{"scode":"HU-MI","sl":"Miskolc"},{"scode":"HU-NK","sl":"Nagykanizsa"},{"scode":"HU-NY","sl":"Nyíregyháza"},{"scode":"HU-NO","sl":"Nógrád"},{"scode":"HU-PE","sl":"Pest"},{"scode":"HU-PS","sl":"Pécs"},{"scode":"HU-ST","sl":"Salgótarján"},{"scode":"HU-SO","sl":"Somogy"},{"scode":"HU-SN","sl":"Sopron"},{"scode":"HU-SZ","sl":"Szabolcs-Szatmár-Bereg"},{"scode":"HU-SD","sl":"Szeged"},{"scode":"HU-SS","sl":"Szekszárd"},{"scode":"HU-SK","sl":"Szolnok"},{"scode":"HU-SH","sl":"Szombathely"},{"scode":"HU-SF","sl":"Székesfehérvár"},{"scode":"HU-TB","sl":"Tatabánya"},{"scode":"HU-TO","sl":"Tolna"},{"scode":"HU-VA","sl":"Vas"},{"scode":"HU-VE","sl":"Veszprém"},{"scode":"HU-VM","sl":"Veszprém"},{"scode":"HU-ZA","sl":"Zala"},{"scode":"HU-ZE","sl":"Zalaegerszeg"}]},{"ccode":"IS","cl":"Iceland","states":[{"scode":"IS-7","sl":"Austurland"},{"scode":"IS-1","sl":"Höfudborgarsvædi utan Reykjavíkur"},{"scode":"IS-6","sl":"Nordurland eystra"},{"scode":"IS-5","sl":"Nordurland vestra"},{"scode":"IS-0","sl":"Reykjavīk"},{"scode":"IS-8","sl":"Sudurland"},{"scode":"IS-2","sl":"Sudurnes"},{"scode":"IS-4","sl":"Vestfirdir"},{"scode":"IS-3","sl":"Vesturland"}]},{"ccode":"IN","cl":"India","states":[{"scode":"IN-AN","sl":"Andaman and Nicobar Islands"},{"scode":"IN-AP","sl":"Andhra Pradesh"},{"scode":"IN-AR","sl":"Arunachal Pradesh"},{"scode":"IN-AS","sl":"Assam"},{"scode":"IN-BR","sl":"Bihar"},{"scode":"IN-CH","sl":"Chandigarh"},{"scode":"IN-DN","sl":"Dadra and Nagar Haveli"},{"scode":"IN-DD","sl":"Daman and Diu"},{"scode":"IN-DL","sl":"Delhi"},{"scode":"IN-GA","sl":"Goa"},{"scode":"IN-GJ","sl":"Gujarat"},{"scode":"IN-HR","sl":"Haryana"},{"scode":"IN-HP","sl":"Himachal Pradesh"},{"scode":"IN-JK","sl":"Jammu and Kashmir"},{"scode":"IN-KA","sl":"Karnataka"},{"scode":"IN-KL","sl":"Kerala"},{"scode":"IN-LD","sl":"Lakshadweep"},{"scode":"IN-MP","sl":"Madhya Pradesh"},{"scode":"IN-MH","sl":"Maharashtra"},{"scode":"IN-MN","sl":"Manipur"},{"scode":"IN-ML","sl":"Meghalaya"},{"scode":"IN-MZ","sl":"Mizoram"},{"scode":"IN-NL","sl":"Nagaland"},{"scode":"IN-OR","sl":"Orissa"},{"scode":"IN-PY","sl":"Pondicherry"},{"scode":"IN-PB","sl":"Punjab"},{"scode":"IN-RJ","sl":"Rajasthan"},{"scode":"IN-SK","sl":"Sikkim"},{"scode":"IN-TN","sl":"Tamil Nadu"},{"scode":"IN-TR","sl":"Tripura"},{"scode":"IN-UP","sl":"Uttar Pradesh"},{"scode":"IN-WB","sl":"West Bengal"}]},{"ccode":"ID","cl":"Indonesia","states":[{"scode":"ID-AC","sl":"Aceh"},{"scode":"ID-BA","sl":"Bali"},{"scode":"ID-BE","sl":"Bengkulu"},{"scode":"ID-IJ","sl":"Irian Jaya"},{"scode":"ID-IJU","sl":"Irian Jaya"},{"scode":"ID-JK","sl":"Jakarta Raya"},{"scode":"ID-JA","sl":"Jambi"},{"scode":"ID-JWU","sl":"Jawa"},{"scode":"ID-JB","sl":"Jawa Barat"},{"scode":"ID-JT","sl":"Jawa Tengah"},{"scode":"ID-JI","sl":"Jawa Timur"},{"scode":"ID-KAU","sl":"Kalimantan"},{"scode":"ID-KB","sl":"Kalimantan Barat"},{"scode":"ID-KS","sl":"Kalimantan Selatan"},{"scode":"ID-KT","sl":"Kalimantan Tengah"},{"scode":"ID-KI","sl":"Kalimantan Timur"},{"scode":"ID-LA","sl":"Lampung"},{"scode":"ID-MA","sl":"Maluku"},{"scode":"ID-MAU","sl":"Maluku"},{"scode":"ID-NUU","sl":"Nusa Tenggara"},{"scode":"ID-NB","sl":"Nusa Tenggara Barat"},{"scode":"ID-NT","sl":"Nusa Tenggara Timur"},{"scode":"ID-RI","sl":"Riau"},{"scode":"ID-SLU","sl":"Sulawesi"},{"scode":"ID-SN","sl":"Sulawesi Selatan"},{"scode":"ID-ST","sl":"Sulawesi Tengah"},{"scode":"ID-SG","sl":"Sulawesi Tenggara"},{"scode":"ID-SA","sl":"Sulawesi Utara"},{"scode":"ID-SMU","sl":"Sumatera"},{"scode":"ID-SB","sl":"Sumatera Barat"},{"scode":"ID-SS","sl":"Sumatera Selatan"},{"scode":"ID-SU","sl":"Sumatera Utara"},{"scode":"ID-TT","sl":"Timor Timur"},{"scode":"ID-YO","sl":"Yogyakarta"}]},{"ccode":"IR","cl":"Iran","states":[{"scode":"IR-03","sl":"Ardabīl"},{"scode":"IR-06","sl":"Būshehr"},{"scode":"IR-08","sl":"Chahār Maḩāll vā Bakhtīārī"},{"scode":"IR-04","sl":"Eşfahān"},{"scode":"IR-14","sl":"Fārs"},{"scode":"IR-19","sl":"Gīlān"},{"scode":"IR-24","sl":"Hamadān"},{"scode":"IR-23","sl":"Hormozgān"},{"scode":"IR-15","sl":"Kermān"},{"scode":"IR-17","sl":"Kermānshāhān"},{"scode":"IR-09","sl":"Khorāsān"},{"scode":"IR-10","sl":"Khūzestān"},{"scode":"IR-18","sl":"Kohkīlūyeh va Būyer Aḩmadī"},{"scode":"IR-16","sl":"Kordestān"},{"scode":"IR-20","sl":"Lorestān"},{"scode":"IR-22","sl":"Markazī"},{"scode":"IR-21","sl":"Māzandarān"},{"scode":"IR-26","sl":"Qom"},{"scode":"IR-12","sl":"Semnān"},{"scode":"IR-13","sl":"Sīstān va Balūchestān"},{"scode":"IR-07","sl":"Tehrān"},{"scode":"IR-25","sl":"Yazd"},{"scode":"IR-11","sl":"Zanjān"},{"scode":"IR-02","sl":"Āzarbāyjān-e-Gharbī"},{"scode":"IR-01","sl":"Āzarbāyjān-e-Sharqī"},{"scode":"IR-05","sl":"Īlām"}]},{"ccode":"IQ","cl":"Iraq","states":[{"scode":"IQ-AN","sl":"Al Anbār"},{"scode":"IQ-BA","sl":"Al Başrah"},{"scode":"IQ-MU","sl":"Al Muthanná"},{"scode":"IQ-QA","sl":"Al Qādisīyah"},{"scode":"IQ-NA","sl":"An Najaf"},{"scode":"IQ-AR","sl":"Arbīl"},{"scode":"IQ-SU","sl":"As Sulaymānīyah"},{"scode":"IQ-TS","sl":"At Ta'mīm"},{"scode":"IQ-BG","sl":"Baghdād"},{"scode":"IQ-BB","sl":"Bābil"},{"scode":"IQ-DA","sl":"Dahūk"},{"scode":"IQ-DQ","sl":"Dhī Qār"},{"scode":"IQ-DI","sl":"Diyālá"},{"scode":"IQ-KA","sl":"Karbalā'"},{"scode":"IQ-MA","sl":"Maysān"},{"scode":"IQ-NI","sl":"Nīnawá"},{"scode":"IQ-WA","sl":"Wāsiţ"},{"scode":"IQ-SD","sl":"Şalāḩ ad Dīn"}]},{"ccode":"IE","cl":"Ireland","states":[{"scode":"IE-CW","sl":"Carlow"},{"scode":"IE-CN","sl":"Cavan"},{"scode":"IE-CP","sl":"Connaught"},{"scode":"IE-DL","sl":"Donegal"},{"scode":"IE-D","sl":"Dublin"},{"scode":"IE-G","sl":"Galway"},{"scode":"IE-KE","sl":"Kildare"},{"scode":"IE-KK","sl":"Kilkenny"},{"scode":"IE-LS","sl":"Laois"},{"scode":"IE-LP","sl":"Leinster"},{"scode":"IE-LM","sl":"Leitrim"},{"scode":"IE-LD","sl":"Longford"},{"scode":"IE-LH","sl":"Louth"},{"scode":"IE-MO","sl":"Mayo"},{"scode":"IE-MH","sl":"Meath"},{"scode":"IE-MN","sl":"Monaghan"},{"scode":"IE-M","sl":"Munster"},{"scode":"IE-OY","sl":"Offaly"},{"scode":"IE-RN","sl":"Roscommon"},{"scode":"IE-SO","sl":"Sligo"},{"scode":"IE-UP","sl":"Ulster"},{"scode":"IE-WH","sl":"Westmeath"},{"scode":"IE-WX","sl":"Wexford"},{"scode":"IE-WW","sl":"Wicklow"}]},{"ccode":"IL","cl":"Israel","states":[{"scode":"IL-D","sl":"HaDarom"},{"scode":"IL-M","sl":"HaMerkaz"},{"scode":"IL-2","sl":"HaZafon"},{"scode":"IL-HA","sl":"Hefa"},{"scode":"IL-TA","sl":"Tel-Aviv"},{"scode":"IL-JM","sl":"Yerushalayim"}]},{"ccode":"IT","cl":"Italy","states":[{"scode":"IT-65","sl":"Abruzzo"},{"scode":"IT-AG","sl":"Agrigento"},{"scode":"IT-AL","sl":"Alessandria"},{"scode":"IT-AN","sl":"Ancona"},{"scode":"IT-AO","sl":"Aosta"},{"scode":"IT-AR","sl":"Arezzo"},{"scode":"IT-AP","sl":"Ascoli Piceno"},{"scode":"IT-AT","sl":"Asti"},{"scode":"IT-AV","sl":"Avellino"},{"scode":"IT-BA","sl":"Bari"},{"scode":"IT-77","sl":"Basilicata"},{"scode":"IT-BL","sl":"Belluno"},{"scode":"IT-BN","sl":"Benevento"},{"scode":"IT-BG","sl":"Bergamo"},{"scode":"IT-BI","sl":"Biella"},{"scode":"IT-BO","sl":"Bologna"},{"scode":"IT-BZ","sl":"Bolzano"},{"scode":"IT-BS","sl":"Brescia"},{"scode":"IT-BR","sl":"Brindisi"},{"scode":"IT-CA","sl":"Cagliari"},{"scode":"IT-78","sl":"Calabria"},{"scode":"IT-CL","sl":"Caltanissetta"},{"scode":"IT-72","sl":"Campania"},{"scode":"IT-CB","sl":"Campobasso"},{"scode":"IT-CE","sl":"Caserta"},{"scode":"IT-CT","sl":"Catania"},{"scode":"IT-CZ","sl":"Catanzaro"},{"scode":"IT-CH","sl":"Chieti"},{"scode":"IT-CO","sl":"Como"},{"scode":"IT-CS","sl":"Cosenza"},{"scode":"IT-CR","sl":"Cremona"},{"scode":"IT-KR","sl":"Crotone"},{"scode":"IT-CN","sl":"Cuneo"},{"scode":"IT-45","sl":"Emilia-Romagna"},{"scode":"IT-EN","sl":"Enna"},{"scode":"IT-FE","sl":"Ferrara"},{"scode":"IT-FI","sl":"Firenze"},{"scode":"IT-FG","sl":"Foggia"},{"scode":"IT-FO","sl":"Forlì"},{"scode":"IT-36","sl":"Friuli-Venezia Giulia"},{"scode":"IT-FR","sl":"Frosinone"},{"scode":"IT-GE","sl":"Genova"},{"scode":"IT-GO","sl":"Gorizia"},{"scode":"IT-GR","sl":"Grosseto"},{"scode":"IT-IM","sl":"Imperia"},{"scode":"IT-IS","sl":"Isernia"},{"scode":"IT-AQ","sl":"L'Aquila"},{"scode":"IT-SP","sl":"La Spezia"},{"scode":"IT-LT","sl":"Latina"},{"scode":"IT-62","sl":"Lazio"},{"scode":"IT-LE","sl":"Lecce"},{"scode":"IT-LC","sl":"Lecco"},{"scode":"IT-42","sl":"Liguria"},{"scode":"IT-LI","sl":"Livorno"},{"scode":"IT-LO","sl":"Lodi"},{"scode":"IT-25","sl":"Lombardia"},{"scode":"IT-LU","sl":"Lucca"},{"scode":"IT-MC","sl":"Macerata"},{"scode":"IT-MN","sl":"Mantova"},{"scode":"IT-57","sl":"Marche"},{"scode":"IT-MS","sl":"Massa"},{"scode":"IT-MT","sl":"Matera"},{"scode":"IT-ME","sl":"Mesaina"},{"scode":"IT-MI","sl":"Milano"},{"scode":"IT-MO","sl":"Modena"},{"scode":"IT-67","sl":"Molise"},{"scode":"IT-NA","sl":"Napoli"},{"scode":"IT-NO","sl":"Novara"},{"scode":"IT-NU","sl":"Nuoro"},{"scode":"IT-OR","sl":"Oristano"},{"scode":"IT-PD","sl":"Padova"},{"scode":"IT-PA","sl":"Palermo"},{"scode":"IT-PR","sl":"Parma"},{"scode":"IT-PV","sl":"Pavia"},{"scode":"IT-PG","sl":"Perugia"},{"scode":"IT-PS","sl":"Pesaro"},{"scode":"IT-PE","sl":"Pescara"},{"scode":"IT-PC","sl":"Piacenza"},{"scode":"IT-21","sl":"Piemonte"},{"scode":"IT-PI","sl":"Pisa"},{"scode":"IT-PT","sl":"Pistoia"},{"scode":"IT-PN","sl":"Pordenone"},{"scode":"IT-PZ","sl":"Potenza"},{"scode":"IT-PO","sl":"Prato"},{"scode":"IT-75","sl":"Puglia"},{"scode":"IT-RG","sl":"Ragusa"},{"scode":"IT-RA","sl":"Ravenna"},{"scode":"IT-RC","sl":"Reggio Calabria"},{"scode":"IT-RE","sl":"Reggio Emilia"},{"scode":"IT-RI","sl":"Rieti"},{"scode":"IT-RN","sl":"Rimini"},{"scode":"IT-RM","sl":"Roma"},{"scode":"IT-RO","sl":"Rovigo"},{"scode":"IT-SA","sl":"Salerno"},{"scode":"IT-88","sl":"Sardegna"},{"scode":"IT-SS","sl":"Sassari"},{"scode":"IT-SV","sl":"Savona"},{"scode":"IT-82","sl":"Sicilia"},{"scode":"IT-SI","sl":"Siena"},{"scode":"IT-SR","sl":"Siracusa"},{"scode":"IT-SO","sl":"Sondrio"},{"scode":"IT-TA","sl":"Taranto"},{"scode":"IT-TE","sl":"Teramo"},{"scode":"IT-TR","sl":"Terni"},{"scode":"IT-TO","sl":"Torino"},{"scode":"IT-52","sl":"Toscana"},{"scode":"IT-TP","sl":"Trapani"},{"scode":"IT-32","sl":"Trentino-Alte Adige"},{"scode":"IT-TN","sl":"Trento"},{"scode":"IT-TV","sl":"Treviso"},{"scode":"IT-TS","sl":"Trieste"},{"scode":"IT-UD","sl":"Udine"},{"scode":"IT-55","sl":"Umbria"},{"scode":"IT-23","sl":"Valle d'Aosta"},{"scode":"IT-VA","sl":"Varese"},{"scode":"IT-34","sl":"Veneto"},{"scode":"IT-VE","sl":"Venezia"},{"scode":"IT-VB","sl":"Verbano-Cusio-Ossola"},{"scode":"IT-VC","sl":"Vercelli"},{"scode":"IT-VR","sl":"Verona"},{"scode":"IT-W","sl":"Vibo Valentia"},{"scode":"IT-VI","sl":"Vicenza"},{"scode":"IT-VT","sl":"Viterbo"}]},{"ccode":"JM","cl":"Jamaica","states":[{"scode":"JM-13","sl":"Clarendon"},{"scode":"JM-09","sl":"Hanover"},{"scode":"JM-01","sl":"Kingston"},{"scode":"JM-12","sl":"Manchester"},{"scode":"JM-04","sl":"Portland"},{"scode":"JM-02","sl":"Saint Andrew"},{"scode":"JM-06","sl":"Saint Ann"},{"scode":"JM-14","sl":"Saint Catherine"},{"scode":"JM-11","sl":"Saint Elizabeth"},{"scode":"JM-08","sl":"Saint James"},{"scode":"JM-05","sl":"Saint Mary"},{"scode":"JM-03","sl":"Saint Thomas"},{"scode":"JM-07","sl":"Trelawny"},{"scode":"JM-10","sl":"Westmoreland"}]},{"ccode":"JP","cl":"Japan","states":[{"scode":"JP-23","sl":"Aiti [Aichi]"},{"scode":"JP-05","sl":"Akita"},{"scode":"JP-02","sl":"Aomori"},{"scode":"JP-38","sl":"Ehime"},{"scode":"JP-21","sl":"Gihu [Gifu]"},{"scode":"JP-10","sl":"Gunma"},{"scode":"JP-34","sl":"Hirosima [Hiroshima]"},{"scode":"JP-01","sl":"Hokkaidô [Hokkaido]"},{"scode":"JP-18","sl":"Hukui [Fukui]"},{"scode":"JP-40","sl":"Hukuoka [Fukuoka]"},{"scode":"JP-07","sl":"Hukusima [Fukushima]"},{"scode":"JP-28","sl":"Hyôgo [Hyogo]"},{"scode":"JP-08","sl":"Ibaraki"},{"scode":"JP-17","sl":"Isikawa [Ishikawa]"},{"scode":"JP-03","sl":"Iwate"},{"scode":"JP-37","sl":"Kagawa"},{"scode":"JP-46","sl":"Kagosima [Kagoshima]"},{"scode":"JP-14","sl":"Kanagawa"},{"scode":"JP-43","sl":"Kumamoto"},{"scode":"JP-26","sl":"Kyôto [Kyoto]"},{"scode":"JP-39","sl":"Kôti [Kochi]"},{"scode":"JP-24","sl":"Mie"},{"scode":"JP-04","sl":"Miyagi"},{"scode":"JP-45","sl":"Miyazaki"},{"scode":"JP-20","sl":"Nagano"},{"scode":"JP-42","sl":"Nagasaki"},{"scode":"JP-29","sl":"Nara"},{"scode":"JP-15","sl":"Niigata"},{"scode":"JP-33","sl":"Okayama"},{"scode":"JP-47","sl":"Okinawa"},{"scode":"JP-41","sl":"Saga"},{"scode":"JP-11","sl":"Saitama"},{"scode":"JP-25","sl":"Siga [Shiga]"},{"scode":"JP-22","sl":"Sizuoka [Shizuoka]"},{"scode":"JP-12","sl":"Tiba [Chiba]"},{"scode":"JP-36","sl":"Tokusima [Tokushima]"},{"scode":"JP-09","sl":"Totigi [Tochigi]"},{"scode":"JP-31","sl":"Tottori"},{"scode":"JP-16","sl":"Toyama"},{"scode":"JP-13","sl":"Tôkyô [Tokyo]"},{"scode":"JP-30","sl":"Wakayama"},{"scode":"JP-06","sl":"Yamagata"},{"scode":"JP-35","sl":"Yamaguti [Yamaguchi]"},{"scode":"JP-19","sl":"Yamanasi [Yamanashi]"},{"scode":"JP-44","sl":"Ôita [Oita]"},{"scode":"JP-27","sl":"Ôsaka [Osaka]"}]},{"ccode":"JO","cl":"Jordan","states":[{"scode":"JO-AQ","sl":"Al 'Aqaba"},{"scode":"JO-BA","sl":"Al Balqā'"},{"scode":"JO-KA","sl":"Al Karak"},{"scode":"JO-MA","sl":"Al Mafraq"},{"scode":"JO-AZ","sl":"Az Zarqā'"},{"scode":"JO-AT","sl":"Aţ Ţafīlah"},{"scode":"JO-IR","sl":"Irbid"},{"scode":"JO-JA","sl":"Jarash"},{"scode":"JO-MN","sl":"Ma‘ān"},{"scode":"JO-MD","sl":"Mādaba"},{"scode":"JO-AJ","sl":"‘Ajlūn"},{"scode":"JO-AM","sl":"‘Ammān"}]},{"ccode":"KZ","cl":"Kazakhstan","states":[{"scode":"KZ-ALA","sl":"Almaty"},{"scode":"KZ-ALM","sl":"Almaty oblysy"},{"scode":"KZ-AKM","sl":"Aqmola oblysy"},{"scode":"KZ-AKT","sl":"Aqtöbe oblysy"},{"scode":"KZ-ATY","sl":"Atyraü oblysy"},{"scode":"KZ-ZAP","sl":"Batys Kazakstan oblysy"},{"scode":"KZ-BAY","sl":"Bayqonyr"},{"scode":"KZ-MAN","sl":"Mangghystaū oblysy"},{"scode":"KZ-YUZ","sl":"Ongtüstik Kazakstan oblysy"},{"scode":"KZ-PAV","sl":"Pavlodar oblysy"},{"scode":"KZ-KAR","sl":"Qaraghandy oblysy"},{"scode":"KZ-KUS","sl":"Qostanay oblysy"},{"scode":"KZ-KZY","sl":"Qyzylorda oblysy"},{"scode":"KZ-VOS","sl":"Shyghys Kazakstan oblysy"},{"scode":"KZ-SEV","sl":"Soltüstik Kazakstan oblysy"},{"scode":"KZ-ZHA","sl":"Zhambyl oblysy"}]},{"ccode":"KE","cl":"Kenya","states":[{"scode":"KE-200","sl":"Central"},{"scode":"KE-300","sl":"Coast"},{"scode":"KE-400","sl":"Eastern"},{"scode":"KE-110","sl":"Nairobi Municipality"},{"scode":"KE-500","sl":"North-Eastern"},{"scode":"KE-600","sl":"Nyanza"},{"scode":"KE-700","sl":"Rift Valley"},{"scode":"KE-900","sl":"Western"}]},{"ccode":"KI","cl":"Kiribati","states":[{"scode":"KI-G","sl":"Gilbert Islands"},{"scode":"KI-L","sl":"Line Islands"},{"scode":"KI-P","sl":"Phoenix Islands"}]},{"ccode":"KP","cl":"Korea","states":[{"scode":"KP-CHA","sl":"Chagang-do"},{"scode":"KP-HAB","sl":"Hamgyongbuk-do"},{"scode":"KP-HAN","sl":"Hamgyongnam-do"},{"scode":"KP-HWB","sl":"Hwanghaebuk-do"},{"scode":"KP-HWN","sl":"Hwanghaenam-do"},{"scode":"KP-KAE","sl":"Kaesong-si"},{"scode":"KP-KAN","sl":"Kangwon-do"},{"scode":"KP-NAM","sl":"Nampo-si"},{"scode":"KP-PYB","sl":"Pyonganbuk-do"},{"scode":"KP-PYN","sl":"Pyongannam-do"},{"scode":"KP-PYO","sl":"Pyongyang-si"},{"scode":"KP-YAN","sl":"Yanggang-do"}]},{"ccode":"KR","cl":"Korea","states":[{"scode":"KR-26","sl":"Busan Gwang'yeogsi [Pusan-Kwangyŏkshi]"},{"scode":"KR-43","sl":"Chungcheongbugdo [Ch'ungch'ŏngbuk-do]"},{"scode":"KR-44","sl":"Chungcheongnamdo [Ch'ungch'ŏngnam-do]"},{"scode":"KR-27","sl":"Daegu Gwang'yeogsi [Taegu-Kwangyŏkshi)"},{"scode":"KR-30","sl":"Daejeon Gwang'yeogsi [Taejŏn-Kwangyŏkshi]"},{"scode":"KR-42","sl":"Gang'weondo [Kang-won-do]"},{"scode":"KR-29","sl":"Gwangju Gwang'yeogsi [Kwangju-Kwangyŏkshi]"},{"scode":"KR-41","sl":"Gyeonggido [Kyŏnggi-do]"},{"scode":"KR-47","sl":"Gyeongsangbugdo [Kyŏngsangbuk-do]"},{"scode":"KR-48","sl":"Gyeongsangnamdo [Kyŏngsangnam-do]"},{"scode":"KR-28","sl":"Incheon Gwang'yeogsi [Inchŏn-Kwangyŏkshi]"},{"scode":"KR-49","sl":"Jejudo [Cheju-do]"},{"scode":"KR-45","sl":"Jeonrabugdo [Chŏllabuk-do)"},{"scode":"KR-46","sl":"Jeonranamdo [Chŏllanam-do]"},{"scode":"KR-11","sl":"Seoul Teugbyeolsi [ Seoul-T’ŭkpyŏlshi]"},{"scode":"KR-31","sl":"Ulsan Gwang'yeogsi [Ulsan-Kwangyŏkshi]"}]},{"ccode":"XK","cl":"Kosovo","states":null},{"ccode":"KW","cl":"Kuwait","states":[{"scode":"KW-AH","sl":"Al Aḩmadi"},{"scode":"KW-FA","sl":"Al Farwānīyah"},{"scode":"KW-JA","sl":"Al Jahrah"},{"scode":"KW-KU","sl":"Al Kuwayt"},{"scode":"KW-HA","sl":"Ḩawallī"}]},{"ccode":"KG","cl":"Kyrgyzstan","states":[{"scode":"KG-C","sl":"Chu"},{"scode":"KG-J","sl":"Jalal-Abad"},{"scode":"KG-N","sl":"Naryn"},{"scode":"KG-O","sl":"Osh"},{"scode":"KG-T","sl":"Talas"},{"scode":"KG-Y","sl":"Ysyk-Köl"}]},{"ccode":"LA","cl":"Laos","states":[{"scode":"LA-AT","sl":"Attapu [Attopeu]"},{"scode":"LA-BK","sl":"Bokèo"},{"scode":"LA-BL","sl":"Bolikhamxai [Borikhane]"},{"scode":"LA-CH","sl":"Champasak [Champassak]"},{"scode":"LA-HO","sl":"Houaphan"},{"scode":"LA-KH","sl":"Khammouan"},{"scode":"LA-LM","sl":"Louang Namtha"},{"scode":"LA-LP","sl":"Louangphabang [Louang Prabang]"},{"scode":"LA-OU","sl":"Oudômxai [Oudomsai]"},{"scode":"LA-PH","sl":"Phôngsali [Phong Saly]"},{"scode":"LA-SL","sl":"Salavan [Saravane]"},{"scode":"LA-SV","sl":"Savannakhét"},{"scode":"LA-VI","sl":"Vientiane"},{"scode":"LA-VT","sl":"Vientiane"},{"scode":"LA-XA","sl":"Xaignabouli [Sayaboury]"},{"scode":"LA-XI","sl":"Xiangkhoang [Xieng Khouang]"},{"scode":"LA-XE","sl":"Xékong [Sékong]"}]},{"ccode":"LV","cl":"Latvia","states":[{"scode":"LV-AI","sl":"Aizkraukles Aprinkis"},{"scode":"LV-AL","sl":"Alūksnes Aprinkis"},{"scode":"LV-BL","sl":"Balvu Aprinkis"},{"scode":"LV-BU","sl":"Bauskas Aprinkis"},{"scode":"LV-CE","sl":"Cēsu Aprinkis"},{"scode":"LV-DGV","sl":"Daugavpils"},{"scode":"LV-DA","sl":"Daugavpils Aprinkis"},{"scode":"LV-DO","sl":"Dobeles Aprinkis"},{"scode":"LV-GU","sl":"Gulbenes Aprinkis"},{"scode":"LV-JEL","sl":"Jelgava"},{"scode":"LV-JL","sl":"Jelgavas Aprinkis"},{"scode":"LV-JK","sl":"Jēkabpils Aprinkis"},{"scode":"LV-JUR","sl":"Jūrmala"},{"scode":"LV-KR","sl":"Krāslavas Aprinkis"},{"scode":"LV-KU","sl":"Kuldīgas Aprinkis"},{"scode":"LV-LPX","sl":"Liepāja"},{"scode":"LV-LE","sl":"Liepājas Aprinkis"},{"scode":"LV-LM","sl":"Limbažu Aprinkis"},{"scode":"LV-LU","sl":"Ludzas Aprinkis"},{"scode":"LV-MA","sl":"Madonas Aprinkis"},{"scode":"LV-OG","sl":"Ogres Aprinkis"},{"scode":"LV-PR","sl":"Preilu Aprinkis"},{"scode":"LV-REZ","sl":"Rēzekne"},{"scode":"LV-RE","sl":"Rēzeknes Aprinkis"},{"scode":"LV-RIX","sl":"Rīga"},{"scode":"LV-RI","sl":"Rīgas Aprinkis"},{"scode":"LV-SA","sl":"Saldus Aprinkis"},{"scode":"LV-TA","sl":"Talsu Aprinkis"},{"scode":"LV-TU","sl":"Tukuma Aprinkis"},{"scode":"LV-VK","sl":"Valkas Aprinkis"},{"scode":"LV-VM","sl":"Valmieras Aprinkis"},{"scode":"LV-VEN","sl":"Ventspils"},{"scode":"LV-VE","sl":"Ventspils Aprinkis"}]},{"ccode":"LB","cl":"Lebanon","states":[{"scode":"LB-BA","sl":"Beiroût"},{"scode":"LB-BI","sl":"El Béqaa"},{"scode":"LB-JL","sl":"Jabal Loubnâne"},{"scode":"LB-AS","sl":"Loubnâne ech Chemâli"},{"scode":"LB-JA","sl":"Loubnâne ej Jnoûbi"},{"scode":"LB-NA","sl":"Nabatîyé (An Nabaţīyah"}]},{"ccode":"LS","cl":"Lesotho","states":[{"scode":"LS-D","sl":"Berea"},{"scode":"LS-B","sl":"Butha-Buthe"},{"scode":"LS-C","sl":"Leribe"},{"scode":"LS-E","sl":"Mafeteng"},{"scode":"LS-A","sl":"Maseru"},{"scode":"LS-F","sl":"Mohale's Hoek"},{"scode":"LS-J","sl":"Mokhotlong"},{"scode":"LS-H","sl":"Qacha's Nek"},{"scode":"LS-G","sl":"Quthing"},{"scode":"LS-K","sl":"Thaba-Tseka"}]},{"ccode":"LR","cl":"Liberia","states":[{"scode":"LR-BM","sl":"Bomi"},{"scode":"LR-BG","sl":"Bong"},{"scode":"LR-GB","sl":"Grand Bassa"},{"scode":"LR-CM","sl":"Grand Cape Mount"},{"scode":"LR-GG","sl":"Grand Gedeh"},{"scode":"LR-GK","sl":"Grand Kru"},{"scode":"LR-LO","sl":"Lofa"},{"scode":"LR-MG","sl":"Margibi"},{"scode":"LR-MY","sl":"Maryland"},{"scode":"LR-MO","sl":"Montserrado"},{"scode":"LR-NI","sl":"Nimba"},{"scode":"LR-RI","sl":"Rivercess"},{"scode":"LR-SI","sl":"Sinoe"}]},{"ccode":"LY","cl":"Libya","states":[{"scode":"LY-BU","sl":"Al Buţnān"},{"scode":"LY-JA","sl":"Al Jabal al Akhḑar"},{"scode":"LY-JG","sl":"Al Jabal al Gharbī"},{"scode":"LY-Ju","sl":"Al Jufrah"},{"scode":"LY-Wu","sl":"Al Wusţá"},{"scode":"LY-WA","sl":"Al Wāḩah"},{"scode":"LY-ZA","sl":"Az Zāwiyah"},{"scode":"LY-BA","sl":"Banghāzī"},{"scode":"LY-FA","sl":"Fazzān"},{"scode":"LY-MI","sl":"Mişrātah"},{"scode":"LY-NA","sl":"Naggaza"},{"scode":"LY-SF","sl":"Sawfajjin"},{"scode":"LY-TB","sl":"Ţarābulus"}]},{"ccode":"LI","cl":"Liechtenstein","states":null},{"ccode":"LT","cl":"Lithuania","states":[{"scode":"LT-AL","sl":"Alytaus Apskritis"},{"scode":"LT-KU","sl":"Kauno Apskritis"},{"scode":"LT-KL","sl":"Klaipėdos Apskritis"},{"scode":"LT-MR","sl":"Marijampolės Apskritis"},{"scode":"LT-PN","sl":"Panevėžio Apskritis"},{"scode":"LT-TA","sl":"Tauragės Apskritis"},{"scode":"LT-TE","sl":"Telšiu Apskritis"},{"scode":"LT-UT","sl":"Utenos Apskritis"},{"scode":"LT-VL","sl":"Vilniaus Apskritis"},{"scode":"LT-SA","sl":"Šiauliu Apskritis"}]},{"ccode":"LU","cl":"Luxembourg","states":[{"scode":"LU-D","sl":"Diekirch"},{"scode":"LU-G","sl":"Grevenmacher"},{"scode":"LU-L","sl":"Luxembourg"}]},{"ccode":"MO","cl":"Macau","states":null},{"ccode":"MK","cl":"Macedonia","states":null},{"ccode":"MG","cl":"Madagascar","states":[{"scode":"MG-T","sl":"Antananarivo"},{"scode":"MG-D","sl":"Antsiranana"},{"scode":"MG-F","sl":"Fianarantsoa"},{"scode":"MG-M","sl":"Mahajanga"},{"scode":"MG-A","sl":"Toamasina"},{"scode":"MG-U","sl":"Toliara"}]},{"ccode":"MW","cl":"Malawi","states":[{"scode":"MW-BL","sl":"Blantyre"},{"scode":"MW-C","sl":"Central"},{"scode":"MW-CK","sl":"Chikwawa"},{"scode":"MW-CR","sl":"Chiradzulu"},{"scode":"MW-CT","sl":"Chitipa"},{"scode":"MW-DE","sl":"Dedza"},{"scode":"MW-DO","sl":"Dowa"},{"scode":"MW-KR","sl":"Karonga"},{"scode":"MW-KS","sl":"Kasungu"},{"scode":"MW-LI","sl":"Lilongwe"},{"scode":"MW-MH","sl":"Machinga"},{"scode":"MW-MG","sl":"Mangochi"},{"scode":"MW-MC","sl":"Mchinji"},{"scode":"MW-MU","sl":"Mulanje"},{"scode":"MW-MW","sl":"Mwanza"},{"scode":"MW-MZ","sl":"Mzimba"},{"scode":"MW-NB","sl":"Nkhata Bay"},{"scode":"MW-NK","sl":"Nkhotakota"},{"scode":"MW-N","sl":"Northern"},{"scode":"MW-NS","sl":"Nsanje"},{"scode":"MW-NU","sl":"Ntcheu"},{"scode":"MW-NI","sl":"Ntchisi"},{"scode":"MW-RU","sl":"Rumphi"},{"scode":"MW-SA","sl":"Salima"},{"scode":"MW-S","sl":"Southern"},{"scode":"MW-TH","sl":"Thyolo"},{"scode":"MW-ZO","sl":"Zomba"}]},{"ccode":"MY","cl":"Malaysia","states":[{"scode":"MY-J","sl":"Johor"},{"scode":"MY-K","sl":"Kedah"},{"scode":"MY-D","sl":"Kelantan"},{"scode":"MY-M","sl":"Melaka"},{"scode":"MY-N","sl":"Negeri Sembilan"},{"scode":"MY-C","sl":"Pahang"},{"scode":"MY-A","sl":"Perak"},{"scode":"MY-R","sl":"Perlis"},{"scode":"MY-P","sl":"Pulau Pinang"},{"scode":"MY-SA","sl":"Sabah"},{"scode":"MY-SK","sl":"Sarawak"},{"scode":"MY-B","sl":"Selangor"},{"scode":"MY-T","sl":"Terengganu"},{"scode":"MY-W","sl":"Wilayah Persekutuan Kuala Lumpur"},{"scode":"MY-L","sl":"Wilayah Persekutuan Labuan"}]},{"ccode":"MV","cl":"Maldives","states":[{"scode":"MV-02","sl":"Alif"},{"scode":"MV-20","sl":"Baa"},{"scode":"MV-17","sl":"Dhaalu"},{"scode":"MV-14","sl":"Faafu"},{"scode":"MV-27","sl":"Gaaf Alif"},{"scode":"MV-28","sl":"Gaafu Dhaalu"},{"scode":"MV-29","sl":"Gnaviyani"},{"scode":"MV-07","sl":"Haa Alif"},{"scode":"MV-23","sl":"Haa Dhaalu"},{"scode":"MV-26","sl":"Kaafu"},{"scode":"MV-05","sl":"Laamu"},{"scode":"MV-03","sl":"Lhaviyani"},{"scode":"MV-MLE","sl":"Male"},{"scode":"MV-12","sl":"Meemu"},{"scode":"MV-25","sl":"Noonu"},{"scode":"MV-13","sl":"Raa"},{"scode":"MV-01","sl":"Seenu"},{"scode":"MV-24","sl":"Shaviyani"},{"scode":"MV-08","sl":"Thaa"},{"scode":"MV-04","sl":"Vaavu"}]},{"ccode":"ML","cl":"Mali","states":[{"scode":"ML-BKO","sl":"Bamako"},{"scode":"ML-7","sl":"Gao"},{"scode":"ML-1","sl":"Kayes"},{"scode":"ML-8","sl":"Kidal"},{"scode":"ML-2","sl":"Koulikoro"},{"scode":"ML-5","sl":"Mopti"},{"scode":"ML-3","sl":"Sikasso"},{"scode":"ML-4","sl":"Ségou"},{"scode":"ML-6","sl":"Tombouctou"}]},{"ccode":"MT","cl":"Malta","states":null},{"ccode":"MH","cl":"Marshall Islands","states":[{"scode":"MH-ALL","sl":"Ailinglapalap"},{"scode":"MH-ALK","sl":"Ailuk"},{"scode":"MH-ARN","sl":"Arno"},{"scode":"MH-AUR","sl":"Aur"},{"scode":"MH-EBO","sl":"Ebon"},{"scode":"MH-ENI","sl":"Eniwetok"},{"scode":"MH-JAL","sl":"Jaluit"},{"scode":"MH-KIL","sl":"Kili"},{"scode":"MH-KWA","sl":"Kwajalein"},{"scode":"MH-LAE","sl":"Lae"},{"scode":"MH-LIB","sl":"Lib"},{"scode":"MH-LIK","sl":"Likiep"},{"scode":"MH-MAJ","sl":"Majuro"},{"scode":"MH-MAL","sl":"Maloelap"},{"scode":"MH-MEJ","sl":"Mejit"},{"scode":"MH-MIL","sl":"Mili"},{"scode":"MH-NMK","sl":"Namorik"},{"scode":"MH-NMU","sl":"Namu"},{"scode":"MH-L","sl":"Ralik chain"},{"scode":"MH-T","sl":"Ratak chain"},{"scode":"MH-RON","sl":"Rongelap"},{"scode":"MH-UJA","sl":"Ujae"},{"scode":"MH-UJL","sl":"Ujelang"},{"scode":"MH-UTI","sl":"Utirik"},{"scode":"MH-WTH","sl":"Wotho"},{"scode":"MH-WTJ","sl":"Wotje"}]},{"ccode":"MQ","cl":"Martinique","states":null},{"ccode":"MR","cl":"Mauritania","states":[{"scode":"MR-07","sl":"Adrar"},{"scode":"MR-03","sl":"Assaba"},{"scode":"MR-05","sl":"Brakna"},{"scode":"MR-08","sl":"Dakhlet Nouādhibou"},{"scode":"MR-04","sl":"Gorgol"},{"scode":"MR-10","sl":"Guidimaka"},{"scode":"MR-01","sl":"Hodh ech Chargui"},{"scode":"MR-02","sl":"Hodh el Gharbi"},{"scode":"MR-12","sl":"Inchiri"},{"scode":"MR-NKC","sl":"Nouakchott"},{"scode":"MR-09","sl":"Tagant"},{"scode":"MR-11","sl":"Tiris Zemmour"},{"scode":"MR-06","sl":"Trarza"}]},{"ccode":"MU","cl":"Mauritius","states":[{"scode":"MU-AG","sl":"Agalega Islands"},{"scode":"MU-BR","sl":"Beau Bassin-Rose Hill"},{"scode":"MU-BL","sl":"Black River"},{"scode":"MU-CC","sl":"Cargados Carajos Shoals [Saint Brandon Islands]"},{"scode":"MU-CU","sl":"Curepipe"},{"scode":"MU-FL","sl":"Flacq"},{"scode":"MU-GP","sl":"Grand Port"},{"scode":"MU-MO","sl":"Moka"},{"scode":"MU-PA","sl":"Pamplemousses"},{"scode":"MU-PW","sl":"Plaines Wilhems"},{"scode":"MU-PL","sl":"Port Louis"},{"scode":"MU-QB","sl":"Quatre Bornes"},{"scode":"MU-RR","sl":"Rivière du Rempart"},{"scode":"MU-RO","sl":"Rodrigues Island"},{"scode":"MU-SA","sl":"Savanne"},{"scode":"MU-VP","sl":"Vacoas-Phoenix"}]},{"ccode":"YT","cl":"Mayotte","states":null},{"ccode":"MX","cl":"Mexico","states":[{"scode":"MX-AGU","sl":"Aguascalientes"},{"scode":"MX-BCN","sl":"Baja California"},{"scode":"MX-BCS","sl":"Baja California Sur"},{"scode":"MX-CAM","sl":"Campeche"},{"scode":"MX-CHP","sl":"Chiapas"},{"scode":"MX-CHH","sl":"Chihuahua"},{"scode":"MX-COA","sl":"Coahuila"},{"scode":"MX-COL","sl":"Colima"},{"scode":"MX-DIF","sl":"Distrito Federal"},{"scode":"MX-DUR","sl":"Durango"},{"scode":"MX-GUA","sl":"Guanajuato"},{"scode":"MX-GRO","sl":"Guerrero"},{"scode":"MX-HID","sl":"Hidalgo"},{"scode":"MX-JAL","sl":"Jalisco"},{"scode":"MX-MIC","sl":"Michoacán"},{"scode":"MX-MOR","sl":"Morelos"},{"scode":"MX-MEX","sl":"México"},{"scode":"MX-NAY","sl":"Nayarit"},{"scode":"MX-NLE","sl":"Nuevo León"},{"scode":"MX-OAX","sl":"Oaxaca"},{"scode":"MX-PUE","sl":"Puebla"},{"scode":"MX-QUE","sl":"Queretaro"},{"scode":"MX-ROO","sl":"Quintana Roo"},{"scode":"MX-SLP","sl":"San Luis Potosí"},{"scode":"MX-SIN","sl":"Sinaloa"},{"scode":"MX-SON","sl":"Sonora"},{"scode":"MX-TAB","sl":"Tabasco"},{"scode":"MX-TAM","sl":"Tamaulipas"},{"scode":"MX-TLA","sl":"Tlaxcala"},{"scode":"MX-VER","sl":"Veracruz"},{"scode":"MX-YUC","sl":"Yucatán"},{"scode":"MX-ZAC","sl":"Zacatecas"}]},{"ccode":"FM","cl":"Micronesia","states":[{"scode":"FM-KSA","sl":"Kosrae"},{"scode":"FM-PNI","sl":"Pohnpei"},{"scode":"FM-YAP","sl":"Yap"},{"scode":"FM-TRK","sl":"chuuk"}]},{"ccode":"MD","cl":"Moldova","states":[{"scode":"MD-ANE","sl":"Anenii Noi"},{"scode":"MD-BAS","sl":"Basarabeasca"},{"scode":"MD-BRI","sl":"Brinceni"},{"scode":"MD-BAL","sl":"Bălţi"},{"scode":"MD-CHL","sl":"Cahul"},{"scode":"MD-CAH","sl":"Cahul"},{"scode":"MD-CAM","sl":"Camenca"},{"scode":"MD-CAN","sl":"Cantemir"},{"scode":"MD-CHI","sl":"Chişinău"},{"scode":"MD-CIA","sl":"Ciadîr-Lunga"},{"scode":"MD-CIM","sl":"Cimişlia"},{"scode":"MD-COM","sl":"Comrat"},{"scode":"MD-CRI","sl":"Criuleni"},{"scode":"MD-CAI","sl":"Căinari"},{"scode":"MD-CAL","sl":"Călăraşi"},{"scode":"MD-CAS","sl":"Căuşeni"},{"scode":"MD-DON","sl":"Donduşeni"},{"scode":"MD-DRO","sl":"Drochia"},{"scode":"MD-DBI","sl":"Dubăsari"},{"scode":"MD-DUB","sl":"Dubăsari"},{"scode":"MD-EDI","sl":"Edineţ"},{"scode":"MD-FLO","sl":"Floreşti"},{"scode":"MD-FAL","sl":"Făleşti"},{"scode":"MD-GLO","sl":"Glodeni"},{"scode":"MD-GRI","sl":"Grigoriopol"},{"scode":"MD-HIN","sl":"Hînceşti"},{"scode":"MD-IAL","sl":"Ialoveni"},{"scode":"MD-LEO","sl":"Leova"},{"scode":"MD-NIS","sl":"Nisporeni"},{"scode":"MD-OCN","sl":"Ocniţa"},{"scode":"MD-ORH","sl":"Orhei"},{"scode":"MD-OHI","sl":"Orhei"},{"scode":"MD-REZ","sl":"Rezina"},{"scode":"MD-RIB","sl":"Rîbniţa"},{"scode":"MD-RIT","sl":"Rîbniţa"},{"scode":"MD-RIS","sl":"Rîşcani"},{"scode":"MD-SLO","sl":"Slobozia"},{"scode":"MD-SOC","sl":"Soroca"},{"scode":"MD-SOA","sl":"Soroca"},{"scode":"MD-STR","sl":"Străşeni"},{"scode":"MD-SIN","sl":"Sîngerei"},{"scode":"MD-TAR","sl":"Taraclia"},{"scode":"MD-TEL","sl":"Teleneşti"},{"scode":"MD-TIG","sl":"Tighina"},{"scode":"MD-TIR","sl":"Tiraspol"},{"scode":"MD-UGI","sl":"Ungheni"},{"scode":"MD-UNG","sl":"Ungheni"},{"scode":"MD-VUL","sl":"Vulcăneşti"},{"scode":"MD-SOL","sl":"Şoldăneşti"},{"scode":"MD-STE","sl":"Ştefan Vodă"}]},{"ccode":"MC","cl":"Monaco","states":null},{"ccode":"MN","cl":"Mongolia","states":[{"scode":"MN-073","sl":"Arhangay"},{"scode":"MN-071","sl":"Bayan-Ölgiy"},{"scode":"MN-069","sl":"Bayanhongor"},{"scode":"MN-067","sl":"Bulgan"},{"scode":"MN-037","sl":"Darhan uul"},{"scode":"MN-061","sl":"Dornod"},{"scode":"MN-063","sl":"Dornogovĭ"},{"scode":"MN-059","sl":"Dundgovĭ"},{"scode":"MN-057","sl":"Dzavhan"},{"scode":"MN-065","sl":"Govĭ-Altay"},{"scode":"MN-064","sl":"Govĭ-Sümber"},{"scode":"MN-039","sl":"Hentiy"},{"scode":"MN-043","sl":"Hovd"},{"scode":"MN-041","sl":"Hövsgöl"},{"scode":"MN-035","sl":"Orhon"},{"scode":"MN-049","sl":"Selenge"},{"scode":"MN-051","sl":"Sühbaatar"},{"scode":"MN-047","sl":"Töv"},{"scode":"MN-1","sl":"Ulaanbaatar"},{"scode":"MN-046","sl":"Uvs"},{"scode":"MN-053","sl":"Ömnögovĭ"},{"scode":"MN-055","sl":"Övörhangay"}]},{"ccode":"ME","cl":"Montenegro","states":null},{"ccode":"MS","cl":"Montserrat","states":null},{"ccode":"MA","cl":"Morocco","states":[{"scode":"MA-AGD","sl":"Agadir"},{"scode":"MA-HAO","sl":"Al Haouz"},{"scode":"MA-HOC","sl":"Al Hoceïma"},{"scode":"MA-ASZ","sl":"Assa-Zag"},{"scode":"MA-AZI","sl":"Azilal"},{"scode":"MA-BAH","sl":"Aït Baha"},{"scode":"MA-MEL","sl":"Aït Melloul"},{"scode":"MA-BES","sl":"Ben Slimane"},{"scode":"MA-BEM","sl":"Beni Mellal"},{"scode":"MA-BER","sl":"Berkane"},{"scode":"MA-BOD","sl":"Boujdour"},{"scode":"MA-BOM","sl":"Boulemane"},{"scode":"MA-CAS","sl":"Casablanca [Dar el Beïda]"},{"scode":"MA-CE","sl":"Centre"},{"scode":"MA-CN","sl":"Centre-Nord"},{"scode":"MA-CS","sl":"Centre-Sud"},{"scode":"MA-CHE","sl":"Chefchaouene"},{"scode":"MA-CHI","sl":"Chichaoua"},{"scode":"MA-HAJ","sl":"El Hajeb"},{"scode":"MA-JDI","sl":"El Jadida"},{"scode":"MA-ERR","sl":"Errachidia"},{"scode":"MA-ESM","sl":"Es Semara"},{"scode":"MA-ESI","sl":"Essaouira"},{"scode":"MA-ES","sl":"Est"},{"scode":"MA-FIG","sl":"Figuig"},{"scode":"MA-FES","sl":"Fès"},{"scode":"MA-GUE","sl":"Guelmim"},{"scode":"MA-IFR","sl":"Ifrane"},{"scode":"MA-IRA","sl":"Jrada"},{"scode":"MA-KES","sl":"Kelaat Sraghna"},{"scode":"MA-KHE","sl":"Khemisset"},{"scode":"MA-KHN","sl":"Khenifra"},{"scode":"MA-KHO","sl":"Khouribga"},{"scode":"MA-KEN","sl":"Kénitra"},{"scode":"MA-LAA","sl":"Laayoune"},{"scode":"MA-LAR","sl":"Larache"},{"scode":"MA-MAR","sl":"Marrakech"},{"scode":"MA-MEK","sl":"Meknès"},{"scode":"MA-NAD","sl":"Nador"},{"scode":"MA-NO","sl":"Nord-Ouest"},{"scode":"MA-OUA","sl":"Ouarzazate"},{"scode":"MA-OUD","sl":"Oued ed Dahab"},{"scode":"MA-OUJ","sl":"Oujda"},{"scode":"MA-RBA","sl":"Rabat-Salé"},{"scode":"MA-SAF","sl":"Safi"},{"scode":"MA-SEF","sl":"Sefrou"},{"scode":"MA-SET","sl":"Settat"},{"scode":"MA-SIK","sl":"Sidi Kacem"},{"scode":"MA-SU","sl":"Sud"},{"scode":"MA-TNT","sl":"Tan-Tan"},{"scode":"MA-TNG","sl":"Tanger"},{"scode":"MA-TAO","sl":"Taounate"},{"scode":"MA-TAR","sl":"Taroudannt"},{"scode":"MA-TAT","sl":"Tata"},{"scode":"MA-TAZ","sl":"Taza"},{"scode":"MA-TS","sl":"Tensift"},{"scode":"MA-TIZ","sl":"Tiznit"},{"scode":"MA-TET","sl":"Tétouan"}]},{"ccode":"MZ","cl":"Mozambique","states":[{"scode":"MZ-P","sl":"Cabo Delgado"},{"scode":"MZ-G","sl":"Gaza"},{"scode":"MZ-I","sl":"Inhambane"},{"scode":"MZ-B","sl":"Manica"},{"scode":"MZ-L","sl":"Maputo"},{"scode":"MZ-MPM","sl":"Maputo"},{"scode":"MZ-N","sl":"Nampula"},{"scode":"MZ-A","sl":"Niassa"},{"scode":"MZ-S","sl":"Sofala"},{"scode":"MZ-T","sl":"Tete"},{"scode":"MZ-Q","sl":"Zambézia"}]},{"ccode":"MM","cl":"Myanmar","states":[{"scode":"MM-07","sl":"Ayeyarwady"},{"scode":"MM-02","sl":"Bago"},{"scode":"MM-14","sl":"Chin"},{"scode":"MM-11","sl":"Kachin"},{"scode":"MM-12","sl":"Kayah"},{"scode":"MM-13","sl":"Kayin"},{"scode":"MM-03","sl":"Magway"},{"scode":"MM-04","sl":"Mandalay"},{"scode":"MM-15","sl":"Mon"},{"scode":"MM-16","sl":"Rakhine"},{"scode":"MM-01","sl":"Sagaing"},{"scode":"MM-17","sl":"Shan"},{"scode":"MM-05","sl":"Tanintharyi"},{"scode":"MM-06","sl":"Yangon"}]},{"ccode":"NA","cl":"Namibia","states":[{"scode":"NA-CA","sl":"Caprivi"},{"scode":"NA-ER","sl":"Erongo"},{"scode":"NA-HA","sl":"Hardap"},{"scode":"NA-KA","sl":"Karas"},{"scode":"NA-KH","sl":"Khomas"},{"scode":"NA-KU","sl":"Kunene"},{"scode":"NA-OW","sl":"Ohangwena"},{"scode":"NA-OK","sl":"Okavango"},{"scode":"NA-OH","sl":"Omaheke"},{"scode":"NA-OS","sl":"Omusati"},{"scode":"NA-ON","sl":"Oshana"},{"scode":"NA-OT","sl":"Oshikoto"},{"scode":"NA-OD","sl":"Otjozondjupa"}]},{"ccode":"NR","cl":"Nauru","states":null},{"ccode":"NP","cl":"Nepal","states":[{"scode":"NP-BA","sl":"Bagmati"},{"scode":"NP-BH","sl":"Bheri"},{"scode":"NP-DH","sl":"Dhawalagiri"},{"scode":"NP-GA","sl":"Gandaki"},{"scode":"NP-JA","sl":"Janakpur"},{"scode":"NP-KA","sl":"Karnali"},{"scode":"NP-KO","sl":"Kosi [Koshi]"},{"scode":"NP-LU","sl":"Lumbini"},{"scode":"NP-2","sl":"Madhya Pashchimanchal"},{"scode":"NP-1","sl":"Madhyamanchal"},{"scode":"NP-MA","sl":"Mahakali"},{"scode":"NP-ME","sl":"Mechi"},{"scode":"NP-NA","sl":"Narayani"},{"scode":"NP-3","sl":"Pashchimanchal"},{"scode":"NP-4","sl":"Purwanchal"},{"scode":"NP-RA","sl":"Rapti"},{"scode":"NP-SA","sl":"Sagarmatha"},{"scode":"NP-SE","sl":"Seti"},{"scode":"NP-5","sl":"Sudur Pashchimanchal"}]},{"ccode":"NL","cl":"Netherlands","states":[{"scode":"NL-DR","sl":"Drenthe"},{"scode":"NL-FL","sl":"Flevoland"},{"scode":"NL-FR","sl":"Friesland"},{"scode":"NL-GE","sl":"Gelderland"},{"scode":"NL-GR","sl":"Groningen"},{"scode":"NL-LI","sl":"Limburg"},{"scode":"NL-NB","sl":"Noord-Brabant"},{"scode":"NL-NH","sl":"Noord-Holland"},{"scode":"NL-OV","sl":"Overijssel"},{"scode":"NL-UT","sl":"Utrecht"},{"scode":"NL-ZE","sl":"Zeeland"},{"scode":"NL-ZH","sl":"Zuid-Holland"}]},{"ccode":"AN","cl":"Netherlands Antilles","states":null},{"ccode":"NC","cl":"New Caledonia","states":null},{"ccode":"NZ","cl":"New Zealand","states":[{"scode":"NZ-AUK","sl":"Auckland"},{"scode":"NZ-BOP","sl":"Bay of Plenty"},{"scode":"NZ-CAN","sl":"Canterbury"},{"scode":"NZ-GIS","sl":"Gisborne"},{"scode":"NZ-HKB","sl":"Hawkes's Bay"},{"scode":"NZ-MWT","sl":"Manawatu-Wanganui"},{"scode":"NZ-MBH","sl":"Marlborough"},{"scode":"NZ-NSN","sl":"Nelson"},{"scode":"NZ-N","sl":"North Island"},{"scode":"NZ-NTL","sl":"Northland"},{"scode":"NZ-OTA","sl":"Otago"},{"scode":"NZ-S","sl":"South Island"},{"scode":"NZ-STL","sl":"Southland"},{"scode":"NZ-TKI","sl":"Taranaki"},{"scode":"NZ-TAS","sl":"Tasman"},{"scode":"NZ-WKO","sl":"Waikato"},{"scode":"NZ-WGN","sl":"Wellington"},{"scode":"NZ-WTC","sl":"West Coast"}]},{"ccode":"NI","cl":"Nicaragua","states":[{"scode":"NI-BO","sl":"Boaco"},{"scode":"NI-CA","sl":"Carazo"},{"scode":"NI-CI","sl":"Chinandega"},{"scode":"NI-CO","sl":"Chontales"},{"scode":"NI-ES","sl":"Estelí"},{"scode":"NI-GR","sl":"Granada"},{"scode":"NI-JI","sl":"Jinotega"},{"scode":"NI-LE","sl":"León"},{"scode":"NI-MD","sl":"Madriz"},{"scode":"NI-MN","sl":"Manaqua"},{"scode":"NI-MS","sl":"Masaya"},{"scode":"NI-MT","sl":"Matagalpa"},{"scode":"NI-NS","sl":"Nueva Segovia"},{"scode":"NI-RI","sl":"Rivas"},{"scode":"NI-SJ","sl":"Río San Juan"},{"scode":"NI-ZE","sl":"Zelaya"}]},{"ccode":"NE","cl":"Niger","states":[{"scode":"NE-1","sl":"Agadez"},{"scode":"NE-2","sl":"Diffa"},{"scode":"NE-3","sl":"Dosso"},{"scode":"NE-4","sl":"Maradi"},{"scode":"NE-8","sl":"Niamey"},{"scode":"NE-5","sl":"Tahoua"},{"scode":"NE-6","sl":"Tillaberi"},{"scode":"NE-7","sl":"Zinder"}]},{"ccode":"NG","cl":"Nigeria","states":[{"scode":"NG-AB","sl":"Abia"},{"scode":"NG-FC","sl":"Abuja Capital Territory"},{"scode":"NG-AD","sl":"Adamawa"},{"scode":"NG-AK","sl":"Akwa Ibom"},{"scode":"NG-AN","sl":"Anambra"},{"scode":"NG-BA","sl":"Bauchi"},{"scode":"NG-BE","sl":"Benue"},{"scode":"NG-BO","sl":"Borno"},{"scode":"NG-CR","sl":"Cross River"},{"scode":"NG-DE","sl":"Delta"},{"scode":"NG-ED","sl":"Edo"},{"scode":"NG-EN","sl":"Enugu"},{"scode":"NG-IM","sl":"Imo"},{"scode":"NG-JI","sl":"Jigawa"},{"scode":"NG-KD","sl":"Kaduna"},{"scode":"NG-KN","sl":"Kano"},{"scode":"NG-KT","sl":"Katsina"},{"scode":"NG-KE","sl":"Kebbi"},{"scode":"NG-KO","sl":"Kogi"},{"scode":"NG-KW","sl":"Kwara"},{"scode":"NG-LA","sl":"Lagos"},{"scode":"NG-NI","sl":"Niger"},{"scode":"NG-OG","sl":"Ogun"},{"scode":"NG-ON","sl":"Ondo"},{"scode":"NG-OS","sl":"Osun"},{"scode":"NG-OY","sl":"Oyo"},{"scode":"NG-PL","sl":"Plateau"},{"scode":"NG-RI","sl":"Rivers"},{"scode":"NG-SO","sl":"Sokoto"},{"scode":"NG-TA","sl":"Taraba"},{"scode":"NG-YO","sl":"Yobe"}]},{"ccode":"NU","cl":"Niue","states":null},{"ccode":"NF","cl":"Norfolk Island","states":null},{"ccode":"MP","cl":"Northern Mariana Islands","states":null},{"ccode":"NO","cl":"Norway","states":[{"scode":"NO-02","sl":"Akershus"},{"scode":"NO-09","sl":"Aust-Agder"},{"scode":"NO-06","sl":"Buskerud"},{"scode":"NO-20","sl":"Finnmark"},{"scode":"NO-04","sl":"Hedmark"},{"scode":"NO-12","sl":"Hordaland"},{"scode":"NO-22","sl":"Jan Mayen"},{"scode":"NO-15","sl":"Møre og Romsdal"},{"scode":"NO-17","sl":"Nord-Trøndelag"},{"scode":"NO-18","sl":"Nordland"},{"scode":"NO-05","sl":"Oppland"},{"scode":"NO-03","sl":"Oslo"},{"scode":"NO-11","sl":"Rogaland"},{"scode":"NO-14","sl":"Sogn og Fjordane"},{"scode":"NO-21","sl":"Svalbard"},{"scode":"NO-16","sl":"Sør-Trøndelag"},{"scode":"NO-08","sl":"Telemark"},{"scode":"NO-19","sl":"Troms"},{"scode":"NO-10","sl":"Vest-Agder"},{"scode":"NO-07","sl":"Vestfold"},{"scode":"NO-01","sl":"Østfold"}]},{"ccode":"OM","cl":"Oman","states":[{"scode":"OM-DA","sl":"Ad Dākhilīyah"},{"scode":"OM-BA","sl":"Al Bāţinah"},{"scode":"OM-JA","sl":"Al Janūbīyah [Zufār]"},{"scode":"OM-WU","sl":"Al Wusţā"},{"scode":"OM-SH","sl":"Ash Sharqīyah"},{"scode":"OM-ZA","sl":"Az Zāhirah"},{"scode":"OM-MA","sl":"Masqaţ"},{"scode":"OM-MU","sl":"Musandam"}]},{"ccode":"PK","cl":"Pakistan","states":[{"scode":"PK-JK","sl":"Azad Kashmir"},{"scode":"PK-BA","sl":"Baluchistan"},{"scode":"PK-TA","sl":"Federally Administered Tribal Areas"},{"scode":"PK-IS","sl":"Islamabad"},{"scode":"PK-NW","sl":"North-West Frontier"},{"scode":"PK-NA","sl":"Northern Areas"},{"scode":"PK-PB","sl":"Punjab"},{"scode":"PK-SD","sl":"Sind"}]},{"ccode":"PW","cl":"Palau","states":null},{"ccode":"PA","cl":"Panama","states":[{"scode":"PA-1","sl":"Botas del Toro"},{"scode":"PA-4","sl":"Chiriquī"},{"scode":"PA-2","sl":"Coclé"},{"scode":"PA-3","sl":"Colón"},{"scode":"PA-0","sl":"Comarca de San Blas"},{"scode":"PA-5","sl":"Darién"},{"scode":"PA-6","sl":"Herrera"},{"scode":"PA-7","sl":"Los Santos"},{"scode":"PA-8","sl":"Panamá"},{"scode":"PA-9","sl":"Veraguas"}]},{"ccode":"PG","cl":"Papua New Guinea","states":[{"scode":"PG-CPM","sl":"Central"},{"scode":"PG-CPK","sl":"Chimbu"},{"scode":"PG-EBR","sl":"East New Britain"},{"scode":"PG-ESW","sl":"East Sepik"},{"scode":"PG-EHG","sl":"Eastern Highlands"},{"scode":"PG-EPW","sl":"Enga"},{"scode":"PG-GPK","sl":"Gulf"},{"scode":"PG-MPM","sl":"Madang"},{"scode":"PG-MRL","sl":"Manus"},{"scode":"PG-MBA","sl":"Milne Bay"},{"scode":"PG-MPL","sl":"Morobe"},{"scode":"PG-NCD","sl":"National Capital District"},{"scode":"PG-NIK","sl":"New Ireland"},{"scode":"PG-NSA","sl":"North Solomons"},{"scode":"PG-NPP","sl":"Northern"},{"scode":"PG-SAN","sl":"Sandaun [West Sepik]"},{"scode":"PG-SHM","sl":"Southern Highlands"},{"scode":"PG-WBK","sl":"West New Britain"},{"scode":"PG-WPD","sl":"Western"},{"scode":"PG-WHM","sl":"Western Highlands"}]},{"ccode":"PY","cl":"Paraguay","states":[{"scode":"PY-16","sl":"Alto Paraguay"},{"scode":"PY-10","sl":"Alto Parang"},{"scode":"PY-13","sl":"Amambay"},{"scode":"PY-ASU","sl":"Asunción"},{"scode":"PY-19","sl":"Boquerón"},{"scode":"PY-5","sl":"Caaguazú"},{"scode":"PY-6","sl":"Caazapá"},{"scode":"PY-14","sl":"Canindeyú"},{"scode":"PY-11","sl":"Central"},{"scode":"PY-1","sl":"Concepción"},{"scode":"PY-3","sl":"Cordillera"},{"scode":"PY-4","sl":"Guairá"},{"scode":"PY-7","sl":"Itapúa"},{"scode":"PY-8","sl":"Misiones"},{"scode":"PY-12","sl":"Neembucú"},{"scode":"PY-9","sl":"Paraguarī"},{"scode":"PY-15","sl":"Presidente Hayes"},{"scode":"PY-2","sl":"San Pedro"}]},{"ccode":"PE","cl":"Peru","states":[{"scode":"PE-AMA","sl":"Amazonas"},{"scode":"PE-ANC","sl":"Ancash"},{"scode":"PE-APU","sl":"Apurímac"},{"scode":"PE-ARE","sl":"Arequipa"},{"scode":"PE-AYA","sl":"Ayacucho"},{"scode":"PE-CAJ","sl":"Cajamarca"},{"scode":"PE-CUS","sl":"Cuzco [Cusco]"},{"scode":"PE-CAL","sl":"El Callao"},{"scode":"PE-HUV","sl":"Huancavelica"},{"scode":"PE-HUC","sl":"Huánuco"},{"scode":"PE-ICA","sl":"Ica"},{"scode":"PE-JUN","sl":"Junín"},{"scode":"PE-LAL","sl":"La Libertad"},{"scode":"PE-LAM","sl":"Lambayeque"},{"scode":"PE-LIM","sl":"Lima"},{"scode":"PE-LOR","sl":"Loreto"},{"scode":"PE-MDD","sl":"Madre de Dios"},{"scode":"PE-MOQ","sl":"Moquegua"},{"scode":"PE-PAS","sl":"Pasco"},{"scode":"PE-PIU","sl":"Piura"},{"scode":"PE-PUN","sl":"Puno"},{"scode":"PE-SAM","sl":"San Martín"},{"scode":"PE-TAC","sl":"Tacna"},{"scode":"PE-TUM","sl":"Tumbes"},{"scode":"PE-UCA","sl":"Ucayali"}]},{"ccode":"PH","cl":"Philippines","states":null},{"ccode":"PN","cl":"Pitcairn","states":null},{"ccode":"PL","cl":"Poland","states":[{"scode":"PL-BP","sl":"Biała Podlaska"},{"scode":"PL-BK","sl":"Białystok"},{"scode":"PL-BB","sl":"Bielsko"},{"scode":"PL-BY","sl":"Bydgoszcz"},{"scode":"PL-CH","sl":"Chełm"},{"scode":"PL-CI","sl":"Ciechanów"},{"scode":"PL-CZ","sl":"Czestochowa"},{"scode":"PL-EL","sl":"Elblag"},{"scode":"PL-GD","sl":"Gdańsk"},{"scode":"PL-GO","sl":"Gorzów"},{"scode":"PL-JG","sl":"Jelenia Gera"},{"scode":"PL-KL","sl":"Kalisz"},{"scode":"PL-KA","sl":"Katowice"},{"scode":"PL-KI","sl":"Kielce"},{"scode":"PL-KN","sl":"Konin"},{"scode":"PL-KO","sl":"Koszalin"},{"scode":"PL-KR","sl":"Kraków"},{"scode":"PL-KS","sl":"Krosno"},{"scode":"PL-LG","sl":"Legnica"},{"scode":"PL-LE","sl":"Leszno"},{"scode":"PL-LU","sl":"Lublin"},{"scode":"PL-NS","sl":"Nowy Sacz"},{"scode":"PL-OL","sl":"Olsztyn"},{"scode":"PL-OP","sl":"Opole"},{"scode":"PL-OS","sl":"Ostrołeka"},{"scode":"PL-PT","sl":"Piotrków"},{"scode":"PL-PI","sl":"Piła"},{"scode":"PL-PO","sl":"Poznań"},{"scode":"PL-PR","sl":"Przemyśl"},{"scode":"PL-PL","sl":"Płock"},{"scode":"PL-RA","sl":"Radom"},{"scode":"PL-RZ","sl":"Rzeszów"},{"scode":"PL-SE","sl":"Siedlce"},{"scode":"PL-SI","sl":"Sieradz"},{"scode":"PL-SK","sl":"Skierniewice"},{"scode":"PL-SU","sl":"Suwałki"},{"scode":"PL-SZ","sl":"Szczecin"},{"scode":"PL-SL","sl":"Słupsk"},{"scode":"PL-TG","sl":"Tarnobrzeg"},{"scode":"PL-TA","sl":"Tarnów"},{"scode":"PL-TO","sl":"Toruń"},{"scode":"PL-WA","sl":"Warszawa"},{"scode":"PL-WB","sl":"Wałbrzych"},{"scode":"PL-WR","sl":"Wrocław"},{"scode":"PL-WL","sl":"Włocławek"},{"scode":"PL-ZA","sl":"Zamość"},{"scode":"PL-ZG","sl":"Zielona Góra"},{"scode":"PL-LO","sl":"Łomia"},{"scode":"PL-LD","sl":"Łódź"}]},{"ccode":"PT","cl":"Portugal","states":[{"scode":"PT-01","sl":"Aveiro"},{"scode":"PT-02","sl":"Beja"},{"scode":"PT-03","sl":"Braga"},{"scode":"PT-04","sl":"Bragança"},{"scode":"PT-05","sl":"Castelo Branco"},{"scode":"PT-06","sl":"Coimbra"},{"scode":"PT-08","sl":"Faro"},{"scode":"PT-09","sl":"Guarda"},{"scode":"PT-10","sl":"Leiria"},{"scode":"PT-11","sl":"Lisboa"},{"scode":"PT-12","sl":"Portalegre"},{"scode":"PT-13","sl":"Porto"},{"scode":"PT-30","sl":"Regiāo Autónoma da Madeira"},{"scode":"PT-20","sl":"Regiāo Autónoma dos Açores"},{"scode":"PT-14","sl":"Santarém"},{"scode":"PT-15","sl":"Setúbal"},{"scode":"PT-16","sl":"Viana do Castelo"},{"scode":"PT-17","sl":"Vila Real"},{"scode":"PT-18","sl":"Viseu"},{"scode":"PT-07","sl":"Évora"}]},{"ccode":"PR","cl":"Puerto Rico","states":null},{"ccode":"QA","cl":"Qatar","states":[{"scode":"QA-DA","sl":"Ad Dawḩah"},{"scode":"QA-GH","sl":"Al Ghuwayrīyah"},{"scode":"QA-JU","sl":"Al Jumaylīyah"},{"scode":"QA-KH","sl":"Al Khawr"},{"scode":"QA-WA","sl":"Al Wakrah"},{"scode":"QA-RA","sl":"Ar Rayyān"},{"scode":"QA-JB","sl":"Jarīyān al Bāţnah"},{"scode":"QA-MS","sl":"Madīnat ash Shamāl"},{"scode":"QA-US","sl":"Umm Şalāl"}]},{"ccode":"RE","cl":"Reunion","states":null},{"ccode":"RO","cl":"Romania","states":[{"scode":"RO-AB","sl":"Alba"},{"scode":"RO-AR","sl":"Arad"},{"scode":"RO-AG","sl":"Argeş"},{"scode":"RO-BC","sl":"Bacău"},{"scode":"RO-BH","sl":"Bihor"},{"scode":"RO-BN","sl":"Bistriţa-Năsăud"},{"scode":"RO-BT","sl":"Botoşani"},{"scode":"RO-BV","sl":"Braşov"},{"scode":"RO-BR","sl":"Brăila"},{"scode":"RO-B","sl":"Bucureşti"},{"scode":"RO-BZ","sl":"Buzău"},{"scode":"RO-CS","sl":"Caraş-Severin"},{"scode":"RO-CJ","sl":"Cluj"},{"scode":"RO-CT","sl":"Constanţa"},{"scode":"RO-CV","sl":"Covasna"},{"scode":"RO-CL","sl":"Călăraşi"},{"scode":"RO-DJ","sl":"Dolj"},{"scode":"RO-DB","sl":"Dâmboviţa"},{"scode":"RO-GL","sl":"Galaţi"},{"scode":"RO-GR","sl":"Giurgiu"},{"scode":"RO-GJ","sl":"Gorj"},{"scode":"RO-HR","sl":"Harghita"},{"scode":"RO-HD","sl":"Hunedoara"},{"scode":"RO-IL","sl":"Ialomiţa"},{"scode":"RO-IS","sl":"Iaşi"},{"scode":"RO-MM","sl":"Maramureş"},{"scode":"RO-MH","sl":"Mehedinţi"},{"scode":"RO-MS","sl":"Mureş"},{"scode":"RO-NT","sl":"Neamţ"},{"scode":"RO-OT","sl":"Olt"},{"scode":"RO-PH","sl":"Prahova"},{"scode":"RO-SM","sl":"Satu Mare"},{"scode":"RO-SB","sl":"Sibiu"},{"scode":"RO-SV","sl":"Suceava"},{"scode":"RO-SJ","sl":"Sălaj"},{"scode":"RO-TR","sl":"Teleorman"},{"scode":"RO-TM","sl":"Timiş"},{"scode":"RO-TL","sl":"Tulcea"},{"scode":"RO-VS","sl":"Vaslui"},{"scode":"RO-VN","sl":"Vrancea"},{"scode":"RO-VL","sl":"Vâlcea"}]},{"ccode":"RU","cl":"Russian Federation","states":[{"scode":"RU-AD","sl":"Adygeya, Respublika"},{"scode":"RU-AGB","sl":"Aginskiy Buryatskiy avtonomnyy okrug"},{"scode":"RU-AL","sl":"Altay, Respublika"},{"scode":"RU-ALT","sl":"Altayskiy kray"},{"scode":"RU-AMU","sl":"Amurskaya Oblast'"},{"scode":"RU-ARK","sl":"Arkhangel'skaya Oblast'"},{"scode":"RU-AST","sl":"Astrakhanskaya Oblast'"},{"scode":"RU-BA","sl":"Bashkortostan, Respublika"},{"scode":"RU-BEL","sl":"Belgorodskaya Oblast'"},{"scode":"RU-BRY","sl":"Bryanskaya Oblast'"},{"scode":"RU-BU","sl":"Buryatiya, Respublika"},{"scode":"RU-CE","sl":"Chechenskaya Respublika"},{"scode":"RU-CHE","sl":"Chelyabinskaya Oblast'"},{"scode":"RU-CHI","sl":"Chitinskaya Oblast'"},{"scode":"RU-CHU","sl":"Chukotskiy avtonomnyy okrug"},{"scode":"RU-CU","sl":"Chuvashskaya Respublika"},{"scode":"RU-DA","sl":"Dagestan, Respublika"},{"scode":"RU-EVE","sl":"Evenkiyskiy avtonomnyy okrug"},{"scode":"RU-IN","sl":"Ingushskaya Respublika"},{"scode":"RU-IRK","sl":"Irkutskaya Oblast'"},{"scode":"RU-IVA","sl":"Ivanovskaya Oblast'"},{"scode":"RU-KB","sl":"Kabardino-Balkarskaya Respublika"},{"scode":"RU-KGD","sl":"Kaliningradskaya Oblast'"},{"scode":"RU-KL","sl":"Kalmykiya, Respublika"},{"scode":"RU-KLU","sl":"Kaluzhskaya Oblast'"},{"scode":"RU-KAM","sl":"Kamchatskaya Oblast'"},{"scode":"RU-KC","sl":"Karachayevo-Cherkesskaya Respublika"},{"scode":"RU-KR","sl":"Kareliya, Respublika"},{"scode":"RU-KEM","sl":"Kemerovskaya Oblast'"},{"scode":"RU-KHA","sl":"Khabarovskiy kray"},{"scode":"RU-KK","sl":"Khakasiya, Respublika"},{"scode":"RU-KHM","sl":"Khanty-Mansiyskiy avtonomnyy okrug"},{"scode":"RU-KIR","sl":"Kirovskaya Oblast'"},{"scode":"RU-KO","sl":"Komi, Respublika"},{"scode":"RU-KOP","sl":"Komi-Permyatskiy avtonomnyy okrug"},{"scode":"RU-KOR","sl":"Koryakskiy avtonomnyy okrug"},{"scode":"RU-KOS","sl":"Kostromskaya Oblast'"},{"scode":"RU-KDA","sl":"Krasnodarskiy kray"},{"scode":"RU-KYA","sl":"Krasnoyarskiy kray"},{"scode":"RU-KGN","sl":"Kurganskaya Oblast'"},{"scode":"RU-KRS","sl":"Kurskaya Oblast'"},{"scode":"RU-LEN","sl":"Leningradskaya Oblast'"},{"scode":"RU-LIP","sl":"Lipetskaya Oblast'"},{"scode":"RU-MAG","sl":"Magadanskaya Oblast'"},{"scode":"RU-ME","sl":"Mariy El, Respublika"},{"scode":"RU-MO","sl":"Mordoviya, Respublika"},{"scode":"RU-MOS","sl":"Moskovskaya Oblast'"},{"scode":"RU-MOW","sl":"Moskva"},{"scode":"RU-MUR","sl":"Murmanskaya Oblast'"},{"scode":"RU-NEN","sl":"Nenetskiy avtonomnyy okrug"},{"scode":"RU-NIZ","sl":"Nizhegorodskaya Oblast'"},{"scode":"RU-NGR","sl":"Novgorodskaya Oblast'"},{"scode":"RU-NVS","sl":"Novosibirskaya Oblast'"},{"scode":"RU-OMS","sl":"Omskaya Oblast'"},{"scode":"RU-ORE","sl":"Orenburgskaya Oblast'"},{"scode":"RU-ORL","sl":"Orlovskaya Oblast'"},{"scode":"RU-PNZ","sl":"Penzenskaya Oblast'"},{"scode":"RU-PER","sl":"Permskaya Oblast'"},{"scode":"RU-PRI","sl":"Primorskiy kray"},{"scode":"RU-PSK","sl":"Pskovskaya Oblast'"},{"scode":"RU-ROS","sl":"Rostovskaya Oblast'"},{"scode":"RU-RYA","sl":"Ryazanskaya Oblast'"},{"scode":"RU-SA","sl":"Sakha, Respublika [Yakutiya]"},{"scode":"RU-SAK","sl":"Sakhalinskaya Oblast'"},{"scode":"RU-SAM","sl":"Samarskaya Oblast’"},{"scode":"RU-SPE","sl":"Sankt-Peterburg"},{"scode":"RU-SAR","sl":"Saratovskaya Oblast'"},{"scode":"RU-SE","sl":"Severnaya Osetiya, Respublika [Alaniya]"},{"scode":"RU-SMO","sl":"Smolenskaya Oblast'"},{"scode":"RU-STA","sl":"Stavropol 'skiy kray"},{"scode":"RU-SVE","sl":"Sverdlovskaya Oblast'"},{"scode":"RU-TAM","sl":"Tambovskaya Oblast'"},{"scode":"RU-TA","sl":"Tatarstan, Respublika"},{"scode":"RU-TAY","sl":"Taymyrskiy (Dolgano-Nenetskiy) avtonomnyy okrug"},{"scode":"RU-TOM","sl":"Tomskaya Oblast’"},{"scode":"RU-TUL","sl":"Tul'skaya Oblast'"},{"scode":"RU-TVE","sl":"Tverskaya Oblast'"},{"scode":"RU-TYU","sl":"Tyumenskaya Oblast'"},{"scode":"RU-TY","sl":"Tyva, Respublika [Tuva]"},{"scode":"RU-UD","sl":"Udmurtskaya Respublika"},{"scode":"RU-ULY","sl":"Ul'yanovskaya Oblast'"},{"scode":"RU-UOB","sl":"Ust’-Ordynskiy Buryatskiy avtonomnyy okrug"},{"scode":"RU-VLA","sl":"Vladimirskaya Oblast'"},{"scode":"RU-VGG","sl":"Volgogradskaya Oblast'"},{"scode":"RU-VLG","sl":"Vologodskaya Oblast'"},{"scode":"RU-VOR","sl":"Voronezhskaya Oblast'"},{"scode":"RU-YAN","sl":"Yamalo-Nenetskiy avtonomnyy okrug"},{"scode":"RU-YAR","sl":"Yaroslavskaya Oblast'"},{"scode":"RU-YEV","sl":"Yevreyskaya avtonomnaya oblast'"}]},{"ccode":"RW","cl":"Rwanda","states":[{"scode":"RW-C","sl":"Butare"},{"scode":"RW-I","sl":"Byumba"},{"scode":"RW-E","sl":"Cyangugu"},{"scode":"RW-D","sl":"Gikongoro"},{"scode":"RW-G","sl":"Gisenyi"},{"scode":"RW-B","sl":"Gitarama"},{"scode":"RW-J","sl":"Kibungo"},{"scode":"RW-F","sl":"Kibuye"},{"scode":"RW-K","sl":"Kigali-Rural"},{"scode":"RW-L","sl":"Kigali-Ville"},{"scode":"RW-M","sl":"Mutara"},{"scode":"RW-H","sl":"Ruhengeri"}]},{"ccode":"GS","cl":"S.Georgia & S.Sandwich Islands","states":null},{"ccode":"SH","cl":"Saint Helena, Ascension and Tristan da Cunha","states":[{"scode":"SH-AC","sl":"Ascension"},{"scode":"SH-SH","sl":"Saint Helena"},{"scode":"SH-TA","sl":"Tristan da Cunha"}]},{"ccode":"KN","cl":"Saint Kitts & Nevis","states":null},{"ccode":"LC","cl":"Saint Lucia","states":null},{"ccode":"WS","cl":"Samoa","states":[{"scode":"WS-AA","sl":"A'ana"},{"scode":"WS-AL","sl":"Aiga-i-le-Tai"},{"scode":"WS-AT","sl":"Atua"},{"scode":"WS-FA","sl":"Fa'asaleleaga"},{"scode":"WS-GE","sl":"Gaga'emauga"},{"scode":"WS-GI","sl":"Gagaifomauga"},{"scode":"WS-PA","sl":"Palauli"},{"scode":"WS-SA","sl":"Satupa'itea"},{"scode":"WS-TU","sl":"Tuamasaga"},{"scode":"WS-VF","sl":"Va'a-o-Fonoti"},{"scode":"WS-VS","sl":"Vaisigano"}]},{"ccode":"SM","cl":"San Marino","states":null},{"ccode":"ST","cl":"Sao Tome & Principe","states":[{"scode":"ST-P","sl":"Príncipe"},{"scode":"ST-S","sl":"Sāo Tomé"}]},{"ccode":"SA","cl":"Saudi Arabia","states":[{"scode":"SA-11","sl":"Al Bāḩah"},{"scode":"SA-12","sl":"Al Jawf"},{"scode":"SA-03","sl":"Al Madīnah"},{"scode":"SA-05","sl":"Al Qaşim"},{"scode":"SA-08","sl":"Al Ḩudūd ash Shamālīyah"},{"scode":"SA-O1","sl":"Ar Riyāḑ"},{"scode":"SA-04","sl":"Ash Sharqīyah"},{"scode":"SA-09","sl":"Jīzān"},{"scode":"SA-02","sl":"Makkah"},{"scode":"SA-10","sl":"Najrān"},{"scode":"SA-07","sl":"Tabūk"},{"scode":"SA-06","sl":"Ḩā'il"},{"scode":"SA-14","sl":"‘Asīr"}]},{"ccode":"SN","cl":"Senegal","states":[{"scode":"SN-DK","sl":"Dakar"},{"scode":"SN-DB","sl":"Diourbel"},{"scode":"SN-FK","sl":"Fatick"},{"scode":"SN-KL","sl":"Kaolack"},{"scode":"SN-KD","sl":"Kolda"},{"scode":"SN-LG","sl":"Louga"},{"scode":"SN-SL","sl":"Saint-Louis"},{"scode":"SN-TC","sl":"Tambacounda"},{"scode":"SN-TH","sl":"Thiès"},{"scode":"SN-ZG","sl":"Ziguinchor"}]},{"ccode":"RS","cl":"Serbia","states":null},{"ccode":"SC","cl":"Seychelles","states":null},{"ccode":"SL","cl":"Sierra Leone","states":[{"scode":"SL-E","sl":"Eastern"},{"scode":"SL-N","sl":"Northern"},{"scode":"SL-S","sl":"Southern"},{"scode":"SL-W","sl":"Western Area"}]},{"ccode":"SG","cl":"Singapore","states":null},{"ccode":"SX","cl":"Sint Maarten","states":null},{"ccode":"SK","cl":"Slovak Republic","states":[{"scode":"SK-BC","sl":"Banskobystrický kraj"},{"scode":"SK-BL","sl":"Bratislavský kraj"},{"scode":"SK-KI","sl":"Košický kraj"},{"scode":"SK-NI","sl":"Nitriansky kraj"},{"scode":"SK-PV","sl":"Prešovský kraj"},{"scode":"SK-TC","sl":"Trenčiansky kraj"},{"scode":"SK-TA","sl":"Trnavský kraj"},{"scode":"SK-ZI","sl":"Žilinský kraj"}]},{"ccode":"SI","cl":"Slovenia","states":[{"scode":"SI-07","sl":"Dolenjska"},{"scode":"SI-09","sl":"Gorenjska"},{"scode":"SI-11","sl":"Goriška"},{"scode":"SI-03","sl":"Koroška"},{"scode":"SI-10","sl":"Notranjsko-kraška"},{"scode":"SI-12","sl":"Obalno-kraška"},{"scode":"SI-08","sl":"Osrednjeslovenska"},{"scode":"SI-02","sl":"Podravska"},{"scode":"SI-01","sl":"Pomurska"},{"scode":"SI-04","sl":"Savinjska"},{"scode":"SI-06","sl":"Spodnjeposavska"},{"scode":"SI-05","sl":"Zasavska"}]},{"ccode":"SB","cl":"Solomon Islands","states":[{"scode":"SB-CT","sl":"Capital Territory"},{"scode":"SB-CE","sl":"Central"},{"scode":"SB-GU","sl":"Guadalcanal"},{"scode":"SB-IS","sl":"Isabel"},{"scode":"SB-MK","sl":"Makira"},{"scode":"SB-ML","sl":"Malaita"},{"scode":"SB-TE","sl":"Temotu"},{"scode":"SB-WE","sl":"Western"}]},{"ccode":"SO","cl":"Somalia","states":[{"scode":"SO-AW","sl":"Awdal"},{"scode":"SO-BY","sl":"BaY"},{"scode":"SO-BK","sl":"Bakool"},{"scode":"SO-BN","sl":"Banaadir"},{"scode":"SO-BR","sl":"Bari"},{"scode":"SO-GA","sl":"Galguduud"},{"scode":"SO-GE","sl":"Gedo"},{"scode":"SO-HI","sl":"Hiiraan"},{"scode":"SO-JD","sl":"Jubbada Dhexe"},{"scode":"SO-JH","sl":"Jubbada Hoose"},{"scode":"SO-MU","sl":"Mudug"},{"scode":"SO-NU","sl":"Nugaal"},{"scode":"SO-SA","sl":"Sanaag"},{"scode":"SO-SD","sl":"Shabeellaha Dhexe"},{"scode":"SO-SH","sl":"Shabeellaha Hoose"},{"scode":"SO-SO","sl":"Sool"},{"scode":"SO-TO","sl":"Togdheer"},{"scode":"SO-WO","sl":"Woqooyi Galbeed"}]},{"ccode":"ZA","cl":"South Africa","states":[{"scode":"ZA-EC","sl":"Eastern Cape"},{"scode":"ZA-FS","sl":"Free State"},{"scode":"ZA-GT","sl":"Gauteng"},{"scode":"ZA-NL","sl":"Kwazulu-Natal"},{"scode":"ZA-MP","sl":"Mpumalanga"},{"scode":"ZA-NW","sl":"North-West"},{"scode":"ZA-NC","sl":"Northern Cape"},{"scode":"ZA-NP","sl":"Northern Province"},{"scode":"ZA-WC","sl":"Western Cape"}]},{"ccode":"SS","cl":"South Sudan","states":null},{"ccode":"ES","cl":"Spain","states":[{"scode":"ES-AB","sl":"Albacete"},{"scode":"ES-A","sl":"Alicante"},{"scode":"ES-AL","sl":"Almería"},{"scode":"ES-AN","sl":"Andalucía"},{"scode":"ES-AR","sl":"Aragón"},{"scode":"ES-O","sl":"Asturias"},{"scode":"ES-O","sl":"Asturias, Principado de"},{"scode":"ES-BA","sl":"Badajoz"},{"scode":"ES-PM","sl":"Baleares"},{"scode":"ES-B","sl":"Barcelona"},{"scode":"ES-BU","sl":"Burgos"},{"scode":"ES-CN","sl":"Canarias"},{"scode":"ES-S","sl":"Cantabria"},{"scode":"ES-CS","sl":"Castellón"},{"scode":"ES-CL","sl":"Castilla y León"},{"scode":"ES-CM","sl":"Castilla-La Mancha"},{"scode":"ES-CT","sl":"Cataluña"},{"scode":"ES-CR","sl":"Ciudad Real"},{"scode":"ES-CU","sl":"Cuenca"},{"scode":"ES-CC","sl":"Cáceres"},{"scode":"ES-CA","sl":"Cádiz"},{"scode":"ES-CO","sl":"Córdoba"},{"scode":"ES-EX","sl":"Extremadura"},{"scode":"ES-GA","sl":"Galicia"},{"scode":"ES-GE","sl":"Gerona"},{"scode":"ES-GR","sl":"Granada"},{"scode":"ES-GU","sl":"Guadalajara"},{"scode":"ES-SS","sl":"Guipúzcoa"},{"scode":"ES-H","sl":"Huelva"},{"scode":"ES-HU","sl":"Huesca"},{"scode":"ES-PM","sl":"Islas Baleares"},{"scode":"ES-J","sl":"Jaén"},{"scode":"ES-C","sl":"La Coruña"},{"scode":"ES-LO","sl":"La Rioja"},{"scode":"ES-GC","sl":"Las Palmas"},{"scode":"ES-LE","sl":"León"},{"scode":"ES-LU","sl":"Lugo"},{"scode":"ES-L","sl":"Lérida"},{"scode":"ES-M","sl":"Madrid"},{"scode":"ES-M","sl":"Madrid, Comunidad de"},{"scode":"ES-MU","sl":"Murcia"},{"scode":"ES-MU","sl":"Murcia, Región de"},{"scode":"ES-MA","sl":"Málaga"},{"scode":"ES-NA","sl":"Navarra"},{"scode":"ES-NA","sl":"Navarra, Comunidad Foral de"},{"scode":"ES-OR","sl":"Orense"},{"scode":"ES-P","sl":"Palencia"},{"scode":"ES-PV","sl":"País Vasco"},{"scode":"ES-PO","sl":"Pontevedra"},{"scode":"ES-SA","sl":"Salamanca"},{"scode":"ES-TF","sl":"Santa Cruz De Tenerife"},{"scode":"ES-SG","sl":"Segovia"},{"scode":"ES-SE","sl":"Sevilla"},{"scode":"ES-SO","sl":"Soria"},{"scode":"ES-T","sl":"Tarragona"},{"scode":"ES-TE","sl":"Teruel"},{"scode":"ES-TO","sl":"Toledo"},{"scode":"ES-V","sl":"Valencia"},{"scode":"ES-VC","sl":"Valenciana, Comunidad"},{"scode":"ES-VA","sl":"Valladolid"},{"scode":"ES-BI","sl":"Vizcaya"},{"scode":"ES-ZA","sl":"Zamora"},{"scode":"ES-Z","sl":"Zaragoza"},{"scode":"ES-VI","sl":"Álava"},{"scode":"ES-AV","sl":"Ávila"}]},{"ccode":"LK","cl":"Sri Lanka","states":[{"scode":"LK-71","sl":"Anuradhapura"},{"scode":"LK-52","sl":"Arnpara"},{"scode":"LK-81","sl":"Badulla"},{"scode":"LK-1","sl":"Basnahira Palata"},{"scode":"LK-51","sl":"Batticaloa"},{"scode":"LK-11","sl":"Colombo"},{"scode":"LK-3","sl":"Dakunu Palata"},{"scode":"LK-31","sl":"Galle"},{"scode":"LK-12","sl":"Gampaha"},{"scode":"LK-33","sl":"Hambantota"},{"scode":"LK-41","sl":"Jaffna"},{"scode":"LK-13","sl":"Kalutara"},{"scode":"LK-21","sl":"Kandy"},{"scode":"LK-92","sl":"Kegalla"},{"scode":"LK-42","sl":"Kilinochchi"},{"scode":"LK-61","sl":"Kurunegala"},{"scode":"LK-2","sl":"Madhyama Palata"},{"scode":"LK-43","sl":"Mannar"},{"scode":"LK-22","sl":"Matale"},{"scode":"LK-32","sl":"Matara"},{"scode":"LK-82","sl":"Monaragala"},{"scode":"LK-45","sl":"Mullaittivu"},{"scode":"LK-5","sl":"Negenahira Palata"},{"scode":"LK-23","sl":"Nuwara Eliya"},{"scode":"LK-72","sl":"Polonnaruwa"},{"scode":"LK-62","sl":"Puttalam"},{"scode":"LK-91","sl":"Ratnapura"},{"scode":"LK-9","sl":"Sabaragamuwa Palata"},{"scode":"LK-53","sl":"Trincomalee"},{"scode":"LK-4","sl":"Uturu Palata"},{"scode":"LK-7","sl":"Uturumeda Palata"},{"scode":"LK-8","sl":"Uva Palata"},{"scode":"LK-44","sl":"Vavuniya"},{"scode":"LK-6","sl":"Wayamba Palata"}]},{"ccode":"PM","cl":"St. Pierre & Miquelon","states":null},{"ccode":"VC","cl":"St. Vincent & the Grenadines","states":null},{"ccode":"SD","cl":"Sudan","states":[{"scode":"SD-26","sl":"Al Baḩr al Aḩmar"},{"scode":"SD-18","sl":"Al Buḩayrāt"},{"scode":"SD-07","sl":"Al Jazīrah"},{"scode":"SD-03","sl":"Al Kharţūm"},{"scode":"SD-06","sl":"Al Qaḑārif"},{"scode":"SD-22","sl":"Al Waḩdah"},{"scode":"SD-04","sl":"An Nīl"},{"scode":"SD-08","sl":"An Nīl al Abyaḑ"},{"scode":"SD-24","sl":"An Nīl al Azraq"},{"scode":"SD-01","sl":"Ash Shamālīyah"},{"scode":"SD-23","sl":"A‘ālī an Nīl"},{"scode":"SD-17","sl":"Baḩr al Jabal"},{"scode":"SD-14","sl":"Gharb Baḩr al Ghazāl"},{"scode":"SD-12","sl":"Gharb Dārfūr"},{"scode":"SD-10","sl":"Gharb Kurdufān"},{"scode":"SD-16","sl":"Gharb al Istiwā'īyah"},{"scode":"SD-11","sl":"Janūb Dārfūr"},{"scode":"SD-13","sl":"Janūb Kurdufān"},{"scode":"SD-20","sl":"Jūnqalī"},{"scode":"SD-05","sl":"Kassalā"},{"scode":"SD-15","sl":"Shamāl Baḩr al Ghazāl"},{"scode":"SD-02","sl":"Shamāl Dārfūr"},{"scode":"SD-09","sl":"Shamāl Kurdufān"},{"scode":"SD-19","sl":"Sharq al Istiwā'iyah"},{"scode":"SD-25","sl":"Sinnār"},{"scode":"SD-21","sl":"Wārāb"}]},{"ccode":"SR","cl":"Suriname","states":[{"scode":"SR-BR","sl":"Brokopondo"},{"scode":"SR-CM","sl":"Commewijne"},{"scode":"SR-CR","sl":"Coronie"},{"scode":"SR-MA","sl":"Marowijne"},{"scode":"SR-NI","sl":"Nickerie"},{"scode":"SR-PR","sl":"Para"},{"scode":"SR-PM","sl":"Paramaribo"},{"scode":"SR-SA","sl":"Saramacca"},{"scode":"SR-SI","sl":"Sipaliwini"},{"scode":"SR-WA","sl":"Wanica"}]},{"ccode":"SJ","cl":"Svalbard & Jan Mayen Islands","states":null},{"ccode":"SZ","cl":"Swaziland","states":[{"scode":"SZ-HH","sl":"Hhohho"},{"scode":"SZ-LU","sl":"Lubombo"},{"scode":"SZ-MA","sl":"Manzini"},{"scode":"SZ-SH","sl":"Shiselweni"}]},{"ccode":"SE","cl":"Sweden","states":[{"scode":"SE-K","sl":"Blekinge län"},{"scode":"SE-W","sl":"Dalarnas län"},{"scode":"SE-I","sl":"Gotlands län"},{"scode":"SE-X","sl":"Gävleborgs län"},{"scode":"SE-N","sl":"Hallands län"},{"scode":"SE-Z","sl":"Jämtlands län"},{"scode":"SE-F","sl":"Jönköpings län"},{"scode":"SE-H","sl":"Kalmar län"},{"scode":"SE-G","sl":"Kronobergs län"},{"scode":"SE-BD","sl":"Norrbottens län"},{"scode":"SE-M","sl":"Skåne län"},{"scode":"SE-AB","sl":"Stockholms län"},{"scode":"SE-D","sl":"Södermanlands län"},{"scode":"SE-C","sl":"Uppsala län"},{"scode":"SE-S","sl":"Värmlands län"},{"scode":"SE-AC","sl":"Västerbottens län"},{"scode":"SE-Y","sl":"Västernorrlands län"},{"scode":"SE-U","sl":"Västmanlands län"},{"scode":"SE-O","sl":"Västra Götalands län"},{"scode":"SE-T","sl":"Örebro län"},{"scode":"SE-E","sl":"Östergötlands län"}]},{"ccode":"CH","cl":"Switzerland","states":[{"scode":"CH-AG","sl":"Aargau"},{"scode":"CH-AR","sl":"Appenzell Ausser-Rhoden"},{"scode":"CH-AI","sl":"Appenzell Inner-Rhoden"},{"scode":"CH-BL","sl":"Basel-Landschaft"},{"scode":"CH-BS","sl":"Basel-Stadt"},{"scode":"CH-BE","sl":"Bern"},{"scode":"CH-FR","sl":"Freiburg"},{"scode":"CH-GE","sl":"Geneve"},{"scode":"CH-GL","sl":"Glarus"},{"scode":"CH-GR","sl":"Graubünden"},{"scode":"CH-JU","sl":"Jura"},{"scode":"CH-LU","sl":"Luzern"},{"scode":"CH-NE","sl":"Neuchatel"},{"scode":"CH-NW","sl":"Nidwalden"},{"scode":"CH-OW","sl":"Obwalden"},{"scode":"CH-SG","sl":"Sankt Gallen"},{"scode":"CH-SH","sl":"Schaffhausen"},{"scode":"CH-SZ","sl":"Schwyz"},{"scode":"CH-SO","sl":"Solothurn"},{"scode":"CH-TG","sl":"Thurgau"},{"scode":"CH-TI","sl":"Ticino"},{"scode":"CH-UR","sl":"Uri"},{"scode":"CH-VD","sl":"Vaud"},{"scode":"CH-VS","sl":"Wallis"},{"scode":"CH-ZG","sl":"Zug"},{"scode":"CH-ZH","sl":"Zürich"}]},{"ccode":"SY","cl":"Syria","states":[{"scode":"SY-LA","sl":"Al Lādhiqīyah"},{"scode":"SY-QU","sl":"Al Qunayţirah"},{"scode":"SY-HA","sl":"Al Ḩasakah"},{"scode":"SY-RA","sl":"Ar Raqqah"},{"scode":"SY-SU","sl":"As Suwaydā'"},{"scode":"SY-DR","sl":"Dar’ā"},{"scode":"SY-DY","sl":"Dayr az Zawr"},{"scode":"SY-DI","sl":"Dimashq"},{"scode":"SY-ID","sl":"Idlib"},{"scode":"SY-RD","sl":"Rīf Dimashq"},{"scode":"SY-TA","sl":"Ţarţūs"},{"scode":"SY-HL","sl":"Ḩalab"},{"scode":"SY-HM","sl":"Ḩamāh"},{"scode":"SY-HI","sl":"Ḩimş"}]},{"ccode":"TW","cl":"Taiwan","states":[{"scode":"TW-CHA","sl":"Changhua"},{"scode":"TW-CYI","sl":"Chiayi"},{"scode":"TW-HSZ","sl":"Hsinchu"},{"scode":"TW-HUA","sl":"Hualien"},{"scode":"TW-ILA","sl":"Ilan"},{"scode":"TW-KHH","sl":"Kaohsiung"},{"scode":"TW-KEE","sl":"Keelung"},{"scode":"TW-MIA","sl":"Miaoli"},{"scode":"TW-NAN","sl":"Nantou"},{"scode":"TW-PEN","sl":"Penghu"},{"scode":"TW-PIF","sl":"Pingtung"},{"scode":"TW-TXG","sl":"Taichung"},{"scode":"TW-TNN","sl":"Tainan"},{"scode":"TW-TPE","sl":"Taipei"},{"scode":"TW-TTT","sl":"Taitung"},{"scode":"TW-TAO","sl":"Taoyuan"},{"scode":"TW-YUN","sl":"Yunlin"}]},{"ccode":"TJ","cl":"Tajikistan","states":[{"scode":"TJ-GB","sl":"Gorno-Badakhshan"},{"scode":"TJ-KR","sl":"Karategin"},{"scode":"TJ-KT","sl":"Khatlon"},{"scode":"TJ-LN","sl":"Leninabad"}]},{"ccode":"TZ","cl":"Tanzania","states":[{"scode":"TZ-01","sl":"Arusha"},{"scode":"TZ-02","sl":"Dar-es-Salaam"},{"scode":"TZ-03","sl":"Dodoma"},{"scode":"TZ-04","sl":"Iringa"},{"scode":"TZ-05","sl":"Kagera"},{"scode":"TZ-06","sl":"Kaskazini Pemba"},{"scode":"TZ-07","sl":"Kaskazini Unguja"},{"scode":"TZ-08","sl":"Kigoma"},{"scode":"TZ-09","sl":"Kilimanjaro"},{"scode":"TZ-10","sl":"Kusini Pemba"},{"scode":"TZ-11","sl":"Kusini Unguja"},{"scode":"TZ-12","sl":"Lindi"},{"scode":"TZ-13","sl":"Mara"},{"scode":"TZ-14","sl":"Mbeya"},{"scode":"TZ-15","sl":"Mjini Magharibi"},{"scode":"TZ-16","sl":"Morogoro"},{"scode":"TZ-17","sl":"Mtwara"},{"scode":"TZ-18","sl":"Mwanza"},{"scode":"TZ-19","sl":"Pwani"},{"scode":"TZ-20","sl":"Rukwa"},{"scode":"TZ-21","sl":"Ruvuma"},{"scode":"TZ-22","sl":"Shinyanga"},{"scode":"TZ-23","sl":"Singida"},{"scode":"TZ-24","sl":"Tabora"},{"scode":"TZ-25","sl":"Tanga"}]},{"ccode":"TH","cl":"Thailand","states":[{"scode":"TH-37","sl":"Amnat Charoen"},{"scode":"TH-15","sl":"Ang Thong"},{"scode":"TH-31","sl":"Buri Ram"},{"scode":"TH-24","sl":"Chachoengsao"},{"scode":"TH-18","sl":"Chai Nat"},{"scode":"TH-36","sl":"Chaiyaphum"},{"scode":"TH-22","sl":"Chanthaburi"},{"scode":"TH-50","sl":"Chiang Mai"},{"scode":"TH-57","sl":"Chiang Rai"},{"scode":"TH-20","sl":"Chon Buri"},{"scode":"TH-86","sl":"Chumphon"},{"scode":"TH-46","sl":"Kalasin"},{"scode":"TH-62","sl":"Kamphaeng Phet"},{"scode":"TH-71","sl":"Kanchanaburi"},{"scode":"TH-40","sl":"Khon Kaen"},{"scode":"TH-81","sl":"Krabi"},{"scode":"TH-10","sl":"Krung Thep Maha Nakhon [Bangkok]"},{"scode":"TH-52","sl":"Lampang"},{"scode":"TH-51","sl":"Lamphun"},{"scode":"TH-42","sl":"Loei"},{"scode":"TH-16","sl":"Lop Buri"},{"scode":"TH-58","sl":"Mae Hong Son"},{"scode":"TH-44","sl":"Maha Sarakham"},{"scode":"TH-49","sl":"Mukdahan"},{"scode":"TH-26","sl":"Nakhon Nayok"},{"scode":"TH-73","sl":"Nakhon Pathom"},{"scode":"TH-48","sl":"Nakhon Phanom"},{"scode":"TH-30","sl":"Nakhon Ratchasima"},{"scode":"TH-60","sl":"Nakhon Sawan"},{"scode":"TH-80","sl":"Nakhon Si Thammarat"},{"scode":"TH-55","sl":"Nan"},{"scode":"TH-96","sl":"Narathiwat"},{"scode":"TH-39","sl":"Nong Bua Lam Phu"},{"scode":"TH-43","sl":"Nong Khai"},{"scode":"TH-12","sl":"Nonthaburi"},{"scode":"TH-13","sl":"Pathum Thani"},{"scode":"TH-94","sl":"Pattani"},{"scode":"TH-82","sl":"Phangnga"},{"scode":"TH-93","sl":"Phatthalung"},{"scode":"TH-S","sl":"Phatthaya"},{"scode":"TH-56","sl":"Phayao"},{"scode":"TH-67","sl":"Phetchabun"},{"scode":"TH-76","sl":"Phetchaburi"},{"scode":"TH-66","sl":"Phichit"},{"scode":"TH-65","sl":"Phitsanulok"},{"scode":"TH-14","sl":"Phra Nakhon Si Ayutthaya"},{"scode":"TH-54","sl":"Phrae"},{"scode":"TH-83","sl":"Phuket"},{"scode":"TH-25","sl":"Prachin Buri"},{"scode":"TH-77","sl":"Prachuap Khiri Khan"},{"scode":"TH-85","sl":"Ranong"},{"scode":"TH-70","sl":"Ratchaburi"},{"scode":"TH-21","sl":"Rayong"},{"scode":"TH-45","sl":"Roi Et"},{"scode":"TH-27","sl":"Sa Kaeo"},{"scode":"TH-47","sl":"Sakon Nakhon"},{"scode":"TH-11","sl":"Samut Prakan"},{"scode":"TH-74","sl":"Samut Sakhon"},{"scode":"TH-75","sl":"Samut Songkhram"},{"scode":"TH-19","sl":"Saraburi"},{"scode":"TH-91","sl":"Satun"},{"scode":"TH-33","sl":"Si Sa Ket"},{"scode":"TH-17","sl":"Sing Buri"},{"scode":"TH-90","sl":"Songkhla"},{"scode":"TH-64","sl":"Sukhothai"},{"scode":"TH-72","sl":"Suphan Buri"},{"scode":"TH-84","sl":"Surat Thani"},{"scode":"TH-32","sl":"Surin"},{"scode":"TH-63","sl":"Tak"},{"scode":"TH-92","sl":"Trang"},{"scode":"TH-23","sl":"Trat"},{"scode":"TH-34","sl":"Ubon Ratchathani"},{"scode":"TH-41","sl":"Udon Thani"},{"scode":"TH-61","sl":"Uthai Thani"},{"scode":"TH-53","sl":"Uttaradit"},{"scode":"TH-95","sl":"Yala"},{"scode":"TH-35","sl":"Yasothon"}]},{"ccode":"TL","cl":"Timor-Leste","states":null},{"ccode":"TG","cl":"Togo","states":[{"scode":"TG-C","sl":"Centre"},{"scode":"TG-K","sl":"Kara"},{"scode":"TG-M","sl":"Maritime"},{"scode":"TG-P","sl":"Plateaux"},{"scode":"TG-S","sl":"Savannes"}]},{"ccode":"TK","cl":"Tokelau","states":null},{"ccode":"TO","cl":"Tonga","states":null},{"ccode":"TT","cl":"Trinidad & Tobago","states":[{"scode":"TT-ARI","sl":"Arima"},{"scode":"TT-CHA","sl":"Chaguanas"},{"scode":"TT-CTT","sl":"Couva-Tabaquite-Talparo"},{"scode":"TT-DMN","sl":"Diego Martin"},{"scode":"TT-ETO","sl":"Eastern Tobago"},{"scode":"TT-PED","sl":"Penal-Debe"},{"scode":"TT-PTF","sl":"Point Fortin"},{"scode":"TT-POS","sl":"Port of Spain"},{"scode":"TT-PRT","sl":"Princes Town"},{"scode":"TT-RCM","sl":"Rio Claro-Mayaro"},{"scode":"TT-SFO","sl":"San Fernando"},{"scode":"TT-SJL","sl":"San Juan-Laventille"},{"scode":"TT-SGE","sl":"Sangre Grande"},{"scode":"TT-SIP","sl":"Siparia"},{"scode":"TT-TUP","sl":"Tunapuna-Piarco"},{"scode":"TT-WTO","sl":"Western Tobago"}]},{"ccode":"TN","cl":"Tunisia","states":[{"scode":"TN-13","sl":"Ben Arous"},{"scode":"TN-23","sl":"Bizerte"},{"scode":"TN-31","sl":"Béja"},{"scode":"TN-81","sl":"Gabès"},{"scode":"TN-71","sl":"Gafsa"},{"scode":"TN-32","sl":"Jendouba"},{"scode":"TN-41","sl":"Kairouan"},{"scode":"TN-42","sl":"Kasserine"},{"scode":"TN-73","sl":"Kebili"},{"scode":"TN-12","sl":"L'Ariana"},{"scode":"TN-33","sl":"Le Kef"},{"scode":"TN-53","sl":"Mahdia"},{"scode":"TN-82","sl":"Medenine"},{"scode":"TN-52","sl":"Monastir"},{"scode":"TN-21","sl":"Nabeul"},{"scode":"TN-61","sl":"Sfax"},{"scode":"TN-43","sl":"Sidi Bouzid"},{"scode":"TN-34","sl":"Siliana"},{"scode":"TN-51","sl":"Sousse"},{"scode":"TN-83","sl":"Tataouine"},{"scode":"TN-72","sl":"Tozeur"},{"scode":"TN-11","sl":"Tunis"},{"scode":"TN-22","sl":"Zaghouan"}]},{"ccode":"TR","cl":"Turkey","states":[{"scode":"TR-01","sl":"Adana"},{"scode":"TR-02","sl":"Adiyaman"},{"scode":"TR-03","sl":"Afyon"},{"scode":"TR-68","sl":"Aksaray"},{"scode":"TR-05","sl":"Amasya"},{"scode":"TR-06","sl":"Ankara"},{"scode":"TR-07","sl":"Antalya"},{"scode":"TR-75","sl":"Ardahan"},{"scode":"TR-08","sl":"Artvin"},{"scode":"TR-09","sl":"Aydin"},{"scode":"TR-04","sl":"Ağrı"},{"scode":"TR-10","sl":"Balıkesir"},{"scode":"TR-74","sl":"Bartın"},{"scode":"TR-72","sl":"Batman"},{"scode":"TR-69","sl":"Bayburt"},{"scode":"TR-11","sl":"Bilecik"},{"scode":"TR-12","sl":"Bingöl"},{"scode":"TR-13","sl":"Bitlis"},{"scode":"TR-14","sl":"Bolu"},{"scode":"TR-15","sl":"Burdur"},{"scode":"TR-16","sl":"Bursa"},{"scode":"TR-20","sl":"Denizli"},{"scode":"TR-21","sl":"Diyarbakır"},{"scode":"TR-22","sl":"Edirne"},{"scode":"TR-23","sl":"Elaziğ"},{"scode":"TR-24","sl":"Erzincan"},{"scode":"TR-25","sl":"Erzurum"},{"scode":"TR-26","sl":"Eskişehir"},{"scode":"TR-27","sl":"Gaziantep"},{"scode":"TR-28","sl":"Giresun"},{"scode":"TR-29","sl":"Gümüşhane"},{"scode":"TR-30","sl":"Hakkari"},{"scode":"TR-31","sl":"Hatay"},{"scode":"TR-32","sl":"Isparta"},{"scode":"TR-76","sl":"Iğdir"},{"scode":"TR-46","sl":"Kahramanmaraş"},{"scode":"TR-78","sl":"Karabük"},{"scode":"TR-70","sl":"Karaman"},{"scode":"TR-36","sl":"Kars"},{"scode":"TR-37","sl":"Kastamonu"},{"scode":"TR-38","sl":"Kayseri"},{"scode":"TR-79","sl":"Kilis"},{"scode":"TR-41","sl":"Kocaeli"},{"scode":"TR-42","sl":"Konya"},{"scode":"TR-43","sl":"Kütahya"},{"scode":"TR-39","sl":"Kırklareli"},{"scode":"TR-71","sl":"Kırıkkale"},{"scode":"TR-40","sl":"Kırşehir"},{"scode":"TR-44","sl":"Malatya"},{"scode":"TR-4S","sl":"Manisa"},{"scode":"TR-47","sl":"Mardin"},{"scode":"TR-48","sl":"Muğla"},{"scode":"TR-49","sl":"Muş"},{"scode":"TR-SO","sl":"Nevşehir"},{"scode":"TR-51","sl":"Niğde"},{"scode":"TR-52","sl":"Ordu"},{"scode":"TR-53","sl":"Rize"},{"scode":"TR-54","sl":"Sakarya"},{"scode":"TR-SS","sl":"Samsun"},{"scode":"TR-56","sl":"Siirt"},{"scode":"TR-57","sl":"Sinop"},{"scode":"TR-S8","sl":"Sivas"},{"scode":"TR-59","sl":"Tekirdağ"},{"scode":"TR-60","sl":"Tokat"},{"scode":"TR-61","sl":"Trabzon"},{"scode":"TR-62","sl":"Tunceli"},{"scode":"TR-64","sl":"Uşak"},{"scode":"TR-65","sl":"Van"},{"scode":"TR-77","sl":"Yalova"},{"scode":"TR-66","sl":"Yozgat"},{"scode":"TR-67","sl":"Zonguldak"},{"scode":"TR-17","sl":"Çanakkale"},{"scode":"TR-18","sl":"Çankırı"},{"scode":"TR-19","sl":"Çorum"},{"scode":"TR-34","sl":"İstanbul"},{"scode":"TR-35","sl":"İzmir"},{"scode":"TR-33","sl":"İçel"},{"scode":"TR-63","sl":"Şanlıurfa"},{"scode":"TR-73","sl":"Şirnak"}]},{"ccode":"TM","cl":"Turkmenistan","states":[{"scode":"TM-A","sl":"Ahal"},{"scode":"TM-B","sl":"Balkan"},{"scode":"TM-D","sl":"Daşhowuz"},{"scode":"TM-L","sl":"Lebap"},{"scode":"TM-M","sl":"Mary"}]},{"ccode":"TC","cl":"Turks & Caicos Islands","states":null},{"ccode":"TV","cl":"Tuvalu","states":null},{"ccode":"UG","cl":"Uganda","states":[{"scode":"UG-APA","sl":"Apac"},{"scode":"UG-ARU","sl":"Arua"},{"scode":"UG-BUN","sl":"Bundibugyo"},{"scode":"UG-BUS","sl":"Bushenyi"},{"scode":"UG-GUL","sl":"Gulu"},{"scode":"UG-HOI","sl":"Hoima"},{"scode":"UG-IGA","sl":"Iganga"},{"scode":"UG-JIN","sl":"Jinja"},{"scode":"UG-KBL","sl":"Kabale"},{"scode":"UG-KBR","sl":"Kabarole"},{"scode":"UG-KLG","sl":"Kalangala"},{"scode":"UG-KLA","sl":"Kampala"},{"scode":"UG-KLI","sl":"Kamuli"},{"scode":"UG-KAP","sl":"Kapchorwa"},{"scode":"UG-KAS","sl":"Kasese"},{"scode":"UG-KLE","sl":"Kibaale"},{"scode":"UG-KIB","sl":"Kiboga"},{"scode":"UG-KIS","sl":"Kisoro"},{"scode":"UG-KIT","sl":"Kitgum"},{"scode":"UG-KOT","sl":"Kotido"},{"scode":"UG-KUM","sl":"Kumi"},{"scode":"UG-LIR","sl":"Lira"},{"scode":"UG-LUW","sl":"Luwero"},{"scode":"UG-MSK","sl":"Masaka"},{"scode":"UG-MSI","sl":"Masindi"},{"scode":"UG-MBL","sl":"Mbale"},{"scode":"UG-MBR","sl":"Mbarara"},{"scode":"UG-MOR","sl":"Moroto"},{"scode":"UG-MOY","sl":"Moyo"},{"scode":"UG-MPI","sl":"Mpigi"},{"scode":"UG-MUB","sl":"Mubende"},{"scode":"UG-MUK","sl":"Mukono"},{"scode":"UG-NEB","sl":"Nebbi"},{"scode":"UG-NTU","sl":"Ntungamo"},{"scode":"UG-PAL","sl":"Pallisa"},{"scode":"UG-RAK","sl":"Rakai"},{"scode":"UG-RUK","sl":"Rukungiri"},{"scode":"UG-SOR","sl":"Soroti"},{"scode":"UG-TOR","sl":"Tororo"}]},{"ccode":"UA","cl":"Ukraine","states":[{"scode":"UA-71","sl":"Cherkas'ka Oblast'"},{"scode":"UA-74","sl":"Chernihivs'ka Oblast'"},{"scode":"UA-77","sl":"Chernivets'ka Oblast'"},{"scode":"UA-12","sl":"Dnipropetrovs'ka Oblast'"},{"scode":"UA-14","sl":"Donets'ka Oblast'"},{"scode":"UA-26","sl":"Ivano-Frankivs'ka Oblast'"},{"scode":"UA-63","sl":"Kharkivs'ka Oblast'"},{"scode":"UA-65","sl":"Khersons'ka Oblast'"},{"scode":"UA-68","sl":"Khmel'nyts'ka Oblast'"},{"scode":"UA-35","sl":"Kirovohrads'ka Oblast'"},{"scode":"UA-30","sl":"Kyïv"},{"scode":"UA-32","sl":"Kyïvs'ka Oblast'"},{"scode":"UA-46","sl":"L'vivs'ka Oblast'"},{"scode":"UA-09","sl":"Luhans'ka Oblast'"},{"scode":"UA-48","sl":"Mykolaïvs'ka Oblast'"},{"scode":"UA-51","sl":"Odes'ka Oblast'"},{"scode":"UA-53","sl":"Poltavs'ka Oblast'"},{"scode":"UA-43","sl":"Respublika Krym"},{"scode":"UA-56","sl":"Rivnens'ka Oblast'"},{"scode":"UA-40","sl":"Sevastopol'"},{"scode":"UA-59","sl":"Sums'ka Oblast'"},{"scode":"UA-61","sl":"Ternopil's'ka Oblast'"},{"scode":"UA-05","sl":"Vinnyts'ka Oblast'"},{"scode":"UA-07","sl":"Volyns'ka Oblast'"},{"scode":"UA-21","sl":"Zakarpats'ka Oblast'"},{"scode":"UA-23","sl":"Zaporiz'ka Oblast'"},{"scode":"UA-18","sl":"Zhytomyrs'ka Oblast'"}]},{"ccode":"AE","cl":"United Arab Emirates","states":[{"scode":"AE-AZ","sl":"Abū Zaby"},{"scode":"AE-FU","sl":"Al Fujayrah"},{"scode":"AE-SH","sl":"Ash Shāriqah"},{"scode":"AE-DU","sl":"Dubayy"},{"scode":"AE-RK","sl":"R'as al Khaymah"},{"scode":"AE-UQ","sl":"Umm al Qaywayn"},{"scode":"AE-AJ","sl":"‘Ajmān"}]},{"ccode":"GB","cl":"United Kingdom","states":[{"scode":"GB-ABE","sl":"Aberdeen City"},{"scode":"GB-ABD","sl":"Aberdeenshire"},{"scode":"GB-ANS","sl":"Angus"},{"scode":"GB-ANT","sl":"Antrim"},{"scode":"GB-ARD","sl":"Ards"},{"scode":"GB-AGB","sl":"Argyll and Bute"},{"scode":"GB-ARM","sl":"Armagh"},{"scode":"GB-BLA","sl":"Ballymena"},{"scode":"GB-BLY","sl":"Ballymoney"},{"scode":"GB-BNB","sl":"Banbridge"},{"scode":"GB-BDG","sl":"Barking and Dagenham"},{"scode":"GB-BNE","sl":"Barnet"},{"scode":"GB-BNS","sl":"Barnsley"},{"scode":"GB-BAS","sl":"Bath and North East Somerset"},{"scode":"GB-BDF","sl":"Bedfordshire"},{"scode":"GB-BFS","sl":"Belfast"},{"scode":"GB-BEX","sl":"Bexley"},{"scode":"GB-BIR","sl":"Birmingham"},{"scode":"GB-BBD","sl":"Blackburn with Darwen"},{"scode":"GB-BPL","sl":"Blackpool"},{"scode":"GB-BGW","sl":"Blaenau Gwent"},{"scode":"GB-BOL","sl":"Bolton"},{"scode":"GB-BMH","sl":"Bournemouth"},{"scode":"GB-BRC","sl":"Bracknell Forest"},{"scode":"GB-BRD","sl":"Bradford"},{"scode":"GB-BEN","sl":"Brent"},{"scode":"GB-BGE","sl":"Bridgend [Pen-y-bont ar Ogwr GB-POG]"},{"scode":"GB-BNH","sl":"Brighton and Hove"},{"scode":"GB-BST","sl":"Bristol, City of"},{"scode":"GB-BRY","sl":"Bromley"},{"scode":"GB-BKM","sl":"Buckinghamshire"},{"scode":"GB-BUR","sl":"Bury"},{"scode":"GB-CAY","sl":"Caerphilly [Caerffili GB-CAF]"},{"scode":"GB-CLD","sl":"Calderdale"},{"scode":"GB-CAM","sl":"Cambridgeshire"},{"scode":"GB-CMD","sl":"Camden"},{"scode":"GB-CRF","sl":"Cardiff (City of) [Caerdydd GB-CRD]"},{"scode":"GB-CMN","sl":"Carmarthenshire [Sir Gaerfyrddin GB-GFY]"},{"scode":"GB-CKF","sl":"Carrickfergus"},{"scode":"GB-CSR","sl":"Castlereagh"},{"scode":"GB-CGN","sl":"Ceredigion [Sir Ceredigion]"},{"scode":"GB-CHA","sl":"Channel Islands"},{"scode":"GB-CHS","sl":"Cheshire"},{"scode":"GB-CLK","sl":"Clackmannanshire"},{"scode":"GB-CLR","sl":"Coleraine"},{"scode":"GB-CWY","sl":"Conwy"},{"scode":"GB-CKT","sl":"Cookstown"},{"scode":"GB-CON","sl":"Cornwall"},{"scode":"GB-COV","sl":"Coventry"},{"scode":"GB-CGV","sl":"Craigavon"},{"scode":"GB-CRY","sl":"Croydon"},{"scode":"GB-CMA","sl":"Cumbria"},{"scode":"GB-DAL","sl":"Darlington"},{"scode":"GB-DEN","sl":"Denbighshire [Sir Ddinbych GB-DDB]"},{"scode":"GB-DER","sl":"Derby"},{"scode":"GB-DBY","sl":"Derbyshire"},{"scode":"GB-DRY","sl":"Derry"},{"scode":"GB-DEV","sl":"Devon"},{"scode":"GB-DNC","sl":"Doncaster"},{"scode":"GB-DOR","sl":"Dorset"},{"scode":"GB-DOW","sl":"Down"},{"scode":"GB-DUD","sl":"Dudley"},{"scode":"GB-DGY","sl":"Dumfries and Galloway"},{"scode":"GB-DND","sl":"Dundee City"},{"scode":"GB-DGN","sl":"Dungannon"},{"scode":"GB-DUR","sl":"Durharn"},{"scode":"GB-EAL","sl":"Ealing"},{"scode":"GB-EAY","sl":"East Ayrshire"},{"scode":"GB-EDU","sl":"East Dunbartonshire"},{"scode":"GB-ELN","sl":"East Lothian"},{"scode":"GB-ERW","sl":"East Renfrewshire"},{"scode":"GB-ERY","sl":"East Riding of Yorkshire"},{"scode":"GB-ESX","sl":"East Sussex"},{"scode":"GB-EDH","sl":"Edinburgh, City of"},{"scode":"GB-ELS","sl":"Eilean Siar"},{"scode":"GB-ENF","sl":"Enfield"},{"scode":"GB-ENG","sl":"England"},{"scode":"GB-EAW","sl":"England and Wales"},{"scode":"GB-ESS","sl":"Essex"},{"scode":"GB-FAL","sl":"Falkirk"},{"scode":"GB-FER","sl":"Fermanagh"},{"scode":"GB-FIF","sl":"Fife"},{"scode":"GB-FLN","sl":"Flintshire [Sir y Fflint GB-FFL]"},{"scode":"GB-GAT","sl":"Gateshead"},{"scode":"GB-GLG","sl":"Glasgow City"},{"scode":"GB-GLS","sl":"Gloucestershire"},{"scode":"GB-GBN","sl":"Great Britain"},{"scode":"GB-GRE","sl":"Greenwich"},{"scode":"GB-GSY","sl":"Guernsey [Guernesey]"},{"scode":"GB-GWN","sl":"Gwynedd"},{"scode":"GB-HCK","sl":"Hackney"},{"scode":"GB-HAL","sl":"Haiton"},{"scode":"GB-HMF","sl":"Hammersmith and Fulham"},{"scode":"GB-HAM","sl":"Hampshire"},{"scode":"GB-HRY","sl":"Haringey"},{"scode":"GB-HRW","sl":"Harrow"},{"scode":"GB-HPL","sl":"Hartlepool"},{"scode":"GB-HAV","sl":"Havering"},{"scode":"GB-HEF","sl":"Herefordshire, County of"},{"scode":"GB-HRT","sl":"Hertfordshire"},{"scode":"GB-HLD","sl":"Highland"},{"scode":"GB-HIL","sl":"Hillingdon"},{"scode":"GB-HNS","sl":"Hounslow"},{"scode":"GB-IVC","sl":"Inverclyde"},{"scode":"GB-AGY","sl":"Isle of Anglesey [Sir Ynys Man GB-YNM]"},{"scode":"GB-IOM","sl":"Isle of Man"},{"scode":"GB-IOW","sl":"Isle of Wight"},{"scode":"GB-IOS","sl":"Isles of Scilly"},{"scode":"GB-ISL","sl":"Islington"},{"scode":"GB-JSY","sl":"Jersey"},{"scode":"GB-KEC","sl":"Kensington and Chelsea"},{"scode":"GB-KEN","sl":"Kent"},{"scode":"GB-KHL","sl":"Kingston upon Hull, City of"},{"scode":"GB-KTT","sl":"Kingston upon Thames"},{"scode":"GB-KIR","sl":"Kirklees"},{"scode":"GB-KWL","sl":"Knowsley"},{"scode":"GB-LBH","sl":"Lambeth"},{"scode":"GB-LAN","sl":"Lancashire"},{"scode":"GB-LRN","sl":"Larne"},{"scode":"GB-LDS","sl":"Leeds"},{"scode":"GB-LEC","sl":"Leicestershire"},{"scode":"GB-LCE","sl":"Leitester"},{"scode":"GB-LEW","sl":"Lewisham"},{"scode":"GB-LMV","sl":"Limavady"},{"scode":"GB-LIN","sl":"Lincolnshire"},{"scode":"GB-LSB","sl":"Lisburn"},{"scode":"GB-LIV","sl":"Liverpool"},{"scode":"GB-LND","sl":"London, City of"},{"scode":"GB-LUT","sl":"Luton"},{"scode":"GB-MFT","sl":"Magherafelt"},{"scode":"GB-MAN","sl":"Manchester"},{"scode":"GB-MDW","sl":"Medway"},{"scode":"GB-MTY","sl":"Merthyr Tydfil [Merthyr Tudful GB-MTU]"},{"scode":"GB-MRT","sl":"Merton"},{"scode":"GB-MDB","sl":"Middlesbrough"},{"scode":"GB-MLN","sl":"Midlothian"},{"scode":"GB-MIK","sl":"Milton Keynes"},{"scode":"GB-MON","sl":"Monmouthshire [Sir Fynwy GB-FYN]"},{"scode":"GB-MRY","sl":"Moray"},{"scode":"GB-MYL","sl":"Moyle"},{"scode":"GB-NTL","sl":"Neath Port Talbot [Castell-nedd Port Talbot GB-CTL]"},{"scode":"GB-NET","sl":"Newcastle upon Tyne"},{"scode":"GB-NWM","sl":"Newham"},{"scode":"GB-NWP","sl":"Newport [Casnewydd GB-CNW]"},{"scode":"GB-NYM","sl":"Newry and Mourne"},{"scode":"GB-NTA","sl":"Newtownabbey"},{"scode":"GB-NFK","sl":"Norfolk"},{"scode":"GB-NAY","sl":"North Ayrshire"},{"scode":"GB-NDN","sl":"North Down"},{"scode":"GB-NEL","sl":"North East Lincolnshire"},{"scode":"GB-NLK","sl":"North Lanarkshire"},{"scode":"GB-NLN","sl":"North Lincolnshire"},{"scode":"GB-NSM","sl":"North Somerset"},{"scode":"GB-NTY","sl":"North Tyneside"},{"scode":"GB-NYK","sl":"North Yorkshire"},{"scode":"GB-NTH","sl":"Northamptonshire"},{"scode":"GB-NIR","sl":"Northern Ireland"},{"scode":"GB-NBL","sl":"Northumberland"},{"scode":"GB-NGM","sl":"Nottingham"},{"scode":"GB-NTT","sl":"Nottinghamshire"},{"scode":"GB-OLD","sl":"Oldham"},{"scode":"GB-OMH","sl":"Omagh"},{"scode":"GB-ORK","sl":"Orkney Islands"},{"scode":"GB-OXF","sl":"Oxfordshire"},{"scode":"GB-PEM","sl":"Pembrokeshire [Sir Benfro CB-BNF]"},{"scode":"GB-PKN","sl":"Perth and Kinross"},{"scode":"GB-PTE","sl":"Peterborough"},{"scode":"GB-PLY","sl":"Plymouth"},{"scode":"GB-POL","sl":"Poole"},{"scode":"GB-POR","sl":"Portsmouth"},{"scode":"GB-POW","sl":"Powys"},{"scode":"GB-RDG","sl":"Reading"},{"scode":"GB-RDB","sl":"Redbridge"},{"scode":"GB-RCC","sl":"Redcar and Cleveland"},{"scode":"GB-RFW","sl":"Renfrewshire"},{"scode":"GB-RCT","sl":"Rhondda, Cynon, Taff [Rhondda, Cynon, Taf]"},{"scode":"GB-RIC","sl":"Richmond upon Thames"},{"scode":"GB-RCH","sl":"Rochdale"},{"scode":"GB-ROT","sl":"Rotherharn"},{"scode":"GB-RUT","sl":"Rutland"},{"scode":"GB-SLF","sl":"Salford"},{"scode":"GB-SAW","sl":"Sandweil"},{"scode":"GB-SCT","sl":"Scotland"},{"scode":"GB-SCB","sl":"Scottish Borders, The"},{"scode":"GB-SFT","sl":"Sefton"},{"scode":"GB-SHF","sl":"Sheffield"},{"scode":"GB-ZET","sl":"Shetland Islands"},{"scode":"GB-SHR","sl":"Shropshire"},{"scode":"GB-SLG","sl":"Slough"},{"scode":"GB-SOL","sl":"Solihull"},{"scode":"GB-SOM","sl":"Somerset"},{"scode":"GB-SAY","sl":"South Ayrshire"},{"scode":"GB-SGC","sl":"South Gloucestershire"},{"scode":"GB-SLK","sl":"South Lanarkshire"},{"scode":"GB-STY","sl":"South Tyneside"},{"scode":"GB-STH","sl":"Southampton"},{"scode":"GB-SOS","sl":"Southend-on-Sea"},{"scode":"GB-SWK","sl":"Southwark"},{"scode":"GB-SHN","sl":"St. Helens"},{"scode":"GB-STS","sl":"Staffordshire"},{"scode":"GB-STG","sl":"Stirling"},{"scode":"GB-SKP","sl":"Stockport"},{"scode":"GB-STT","sl":"Stockton-On-Tees"},{"scode":"GB-STE","sl":"Stoke-on-Trent"},{"scode":"GB-STB","sl":"Strabane"},{"scode":"GB-SFK","sl":"Suffolk"},{"scode":"GB-SND","sl":"Sunderland"},{"scode":"GB-SRY","sl":"Surrey"},{"scode":"GB-STN","sl":"Sutton"},{"scode":"GB-SWA","sl":"Swansea (City of) [Abertawe GB-ATA]"},{"scode":"GB-SWD","sl":"Swindon"},{"scode":"GB-TAM","sl":"Tameside"},{"scode":"GB-TFW","sl":"Telford and Wrekin"},{"scode":"GB-THR","sl":"Thurrock"},{"scode":"GB-TOB","sl":"Torbay"},{"scode":"GB-TOF","sl":"Torfaen [Tor-faen]"},{"scode":"GB-TWH","sl":"Tower Hamlets"},{"scode":"GB-TRF","sl":"Trafford"},{"scode":"GB-UKM","sl":"United Kingdom"},{"scode":"GB-VGL","sl":"Vale of Glamorgan, The [Bro Morgannwg GB-BMG]"},{"scode":"GB-WKF","sl":"Wakefield"},{"scode":"GB-WLS","sl":"Wales [Cymru]"},{"scode":"GB-WLL","sl":"Walsall"},{"scode":"GB-WFT","sl":"Waltham Forest"},{"scode":"GB-WND","sl":"Wandsworth"},{"scode":"GB-WRT","sl":"Warrington"},{"scode":"GB-WAR","sl":"Warwickshire"},{"scode":"GB-WBK","sl":"West Berkshire"},{"scode":"GB-WDU","sl":"West Dunbartonshire"},{"scode":"GB-WLN","sl":"West Lothian"},{"scode":"GB-WSX","sl":"West Sussex"},{"scode":"GB-WSM","sl":"Westminster"},{"scode":"GB-WGN","sl":"Wigan"},{"scode":"GB-WIL","sl":"Wiltshire"},{"scode":"GB-WNM","sl":"Windsor and Maidenhead"},{"scode":"GB-WRL","sl":"Wirral"},{"scode":"GB-WOK","sl":"Wokingham"},{"scode":"GB-WLV","sl":"Wolverhampton"},{"scode":"GB-WOR","sl":"Worcestershire"},{"scode":"GB-WRX","sl":"Wrexham [Wrecsam GB-WRC]"},{"scode":"GB-YOR","sl":"York"}]},{"ccode":"US","cl":"United States","states":[{"scode":"US-AL","sl":"Alabama"},{"scode":"US-AK","sl":"Alaska"},{"scode":"US-AS","sl":"American Samoa"},{"scode":"US-AZ","sl":"Arizona"},{"scode":"US-AR","sl":"Arkansas"},{"scode":"US-CA","sl":"California"},{"scode":"US-CO","sl":"Colorado"},{"scode":"US-CT","sl":"Connecticut"},{"scode":"US-DE","sl":"Delaware"},{"scode":"US-DC","sl":"District of Columbia"},{"scode":"US-FL","sl":"Florida"},{"scode":"US-GA","sl":"Georgia"},{"scode":"US-GU","sl":"Guam"},{"scode":"US-HI","sl":"Hawaii"},{"scode":"US-ID","sl":"Idaho"},{"scode":"US-IL","sl":"Illinois"},{"scode":"US-IN","sl":"Indiana"},{"scode":"US-IA","sl":"Iowa"},{"scode":"US-KS","sl":"Kansas"},{"scode":"US-KY","sl":"Kentucky"},{"scode":"US-LA","sl":"Louisiana"},{"scode":"US-ME","sl":"Maine"},{"scode":"US-MD","sl":"Maryland"},{"scode":"US-MA","sl":"Massachusetts"},{"scode":"US-MI","sl":"Michigan"},{"scode":"US-MN","sl":"Minnesota"},{"scode":"US-MS","sl":"Mississippi"},{"scode":"US-MO","sl":"Missouri"},{"scode":"US-MT","sl":"Montana"},{"scode":"US-NE","sl":"Nebraska"},{"scode":"US-NV","sl":"Nevada"},{"scode":"US-NH","sl":"New Hampshire"},{"scode":"US-NJ","sl":"New Jersey"},{"scode":"US-NM","sl":"New Mexico"},{"scode":"US-NY","sl":"New York"},{"scode":"US-NC","sl":"North Carolina"},{"scode":"US-ND","sl":"North Dakota"},{"scode":"US-MP","sl":"Northern Mariana Islands"},{"scode":"US-OH","sl":"Ohio"},{"scode":"US-OK","sl":"Oklahoma"},{"scode":"US-OR","sl":"Oregon"},{"scode":"US-PA","sl":"Pennsylvania"},{"scode":"US-PR","sl":"Puerto Rico"},{"scode":"US-RI","sl":"Rhode Island"},{"scode":"US-SC","sl":"South Carolina"},{"scode":"US-SD","sl":"South Dakota"},{"scode":"US-TN","sl":"Tennessee"},{"scode":"US-TX","sl":"Texas"},{"scode":"US-UM","sl":"United States Minor Outlying Islands"},{"scode":"US-UT","sl":"Utah"},{"scode":"US-VT","sl":"Vermont"},{"scode":"US-VI","sl":"Virgin Islands, U.S."},{"scode":"US-VA","sl":"Virginia"},{"scode":"US-WA","sl":"Washington"},{"scode":"US-WV","sl":"West Virginia"},{"scode":"US-WI","sl":"Wisconsin"},{"scode":"US-WY","sl":"Wyoming"}]},{"ccode":"UY","cl":"Uruguay","states":[{"scode":"UY-AR","sl":"Artigas"},{"scode":"UY-CA","sl":"Canelones"},{"scode":"UY-CL","sl":"Cerro Largo"},{"scode":"UY-CO","sl":"Colonia"},{"scode":"UY-DU","sl":"Durazno"},{"scode":"UY-FS","sl":"Flores"},{"scode":"UY-FD","sl":"Florida"},{"scode":"UY-LA","sl":"Lavalleja"},{"scode":"UY-MA","sl":"Maldonado"},{"scode":"UY-MO","sl":"Montevideo"},{"scode":"UY-PA","sl":"Paysandú"},{"scode":"UY-RV","sl":"Rivera"},{"scode":"UY-RO","sl":"Rocha"},{"scode":"UY-RN","sl":"Río Negro"},{"scode":"UY-SA","sl":"Salto"},{"scode":"UY-SJ","sl":"San José"},{"scode":"UY-SO","sl":"Soriano"},{"scode":"UY-TA","sl":"Tacuarembó"},{"scode":"UY-TT","sl":"Treinta y Tres"}]},{"ccode":"UZ","cl":"Uzbekistan","states":[{"scode":"UZ-AN","sl":"Andijon"},{"scode":"UZ-BU","sl":"Bukhoro"},{"scode":"UZ-FA","sl":"Farghona"},{"scode":"UZ-JI","sl":"Jizzakh"},{"scode":"UZ-KH","sl":"Khorazm"},{"scode":"UZ-NG","sl":"Namangan"},{"scode":"UZ-NW","sl":"Nawoiy"},{"scode":"UZ-QA","sl":"Qashqadaryo"},{"scode":"UZ-QR","sl":"Qoraqalpoghiston Respublikasi"},{"scode":"UZ-SA","sl":"Samarqand"},{"scode":"UZ-SI","sl":"Sirdaryo"},{"scode":"UZ-SU","sl":"Surkhondaryo"},{"scode":"UZ-TO","sl":"Toshkent"}]},{"ccode":"VU","cl":"Vanuatu","states":[{"scode":"VU-MAP","sl":"Malampa"},{"scode":"VU-PAM","sl":"Pénama"},{"scode":"VU-SAM","sl":"Sanma"},{"scode":"VU-SEE","sl":"Shéfa"},{"scode":"VU-TAE","sl":"Taféa"},{"scode":"VU-TOB","sl":"Torba"}]},{"ccode":"VA","cl":"Vatican City","states":null},{"ccode":"VE","cl":"Venezuela","states":[{"scode":"VE-Z","sl":"Amazonas"},{"scode":"VE-B","sl":"Anzoátegui"},{"scode":"VE-C","sl":"Apure"},{"scode":"VE-D","sl":"Aragua"},{"scode":"VE-E","sl":"Barinas"},{"scode":"VE-F","sl":"Bolívar"},{"scode":"VE-G","sl":"Carabobo"},{"scode":"VE-H","sl":"Cojedes"},{"scode":"VE-Y","sl":"Delta Amacuro"},{"scode":"VE-W","sl":"Dependencias Federales"},{"scode":"VE-A","sl":"Distrito Federal"},{"scode":"VE-I","sl":"Falcón"},{"scode":"VE-J","sl":"Guárico"},{"scode":"VE-K","sl":"Lara"},{"scode":"VE-M","sl":"Miranda"},{"scode":"VE-N","sl":"Monagas"},{"scode":"VE-L","sl":"Mérida"},{"scode":"VE-O","sl":"Nueva Esparta"},{"scode":"VE-P","sl":"Portuguesa"},{"scode":"VE-R","sl":"Sucre"},{"scode":"VE-T","sl":"Trujillo"},{"scode":"VE-S","sl":"Táchira"},{"scode":"VE-U","sl":"Yaracuy"},{"scode":"VE-V","sl":"Zulia"}]},{"ccode":"VN","cl":"Viet Nam","states":[{"scode":"VN-44","sl":"An Giang"},{"scode":"VN-43","sl":"Ba Ria - Vung Tau"},{"scode":"VN-53","sl":"Bat Can"},{"scode":"VN-54","sl":"Bat Giang"},{"scode":"VN-55","sl":"Bat Lieu"},{"scode":"VN-56","sl":"Bat Ninh"},{"scode":"VN-50","sl":"Ben Tre"},{"scode":"VN-31","sl":"Binh Dinh"},{"scode":"VN-57","sl":"Binh Duong"},{"scode":"VN-58","sl":"Binh Phuoc"},{"scode":"VN-40","sl":"Binh Thuan"},{"scode":"VN-59","sl":"Ca Mau"},{"scode":"VN-48","sl":"Can Tho"},{"scode":"VN-04","sl":"Cao Bang"},{"scode":"VN-60","sl":"Da Nang, thanh pho"},{"scode":"VN-33","sl":"Dac Lac"},{"scode":"VN-39","sl":"Dong Nai"},{"scode":"VN-45","sl":"Dong Thap"},{"scode":"VN-30","sl":"Gia Lai"},{"scode":"VN-03","sl":"Ha Giang"},{"scode":"VN-63","sl":"Ha Nam"},{"scode":"VN-64","sl":"Ha Noi, thu do"},{"scode":"VN-15","sl":"Ha Tay"},{"scode":"VN-23","sl":"Ha Tinh"},{"scode":"VN-61","sl":"Hai Duong"},{"scode":"VN-62","sl":"Hai Phong, thanh pho"},{"scode":"VN-65","sl":"Ho Chi Minh, thanh po [Sai Gon]"},{"scode":"VN-14","sl":"Hoa Binh"},{"scode":"VN-66","sl":"Hung Yen"},{"scode":"VN-34","sl":"Khanh Hoa"},{"scode":"VN-47","sl":"Kien Giang"},{"scode":"VN-28","sl":"Kon Turn"},{"scode":"VN-01","sl":"Lai Chau"},{"scode":"VN-35","sl":"Lam Dong"},{"scode":"VN-09","sl":"Lang Son"},{"scode":"VN-02","sl":"Lao Cai"},{"scode":"VN-41","sl":"Long An"},{"scode":"VN-67","sl":"Nam Dinh"},{"scode":"VN-22","sl":"Nghe An"},{"scode":"VN-18","sl":"Ninh Binh"},{"scode":"VN-36","sl":"Ninh Thuan"},{"scode":"VN-68","sl":"Phu Tho"},{"scode":"VN-32","sl":"Phu Yen"},{"scode":"VN-27","sl":"Quang Nam"},{"scode":"VN-29","sl":"Quang Ngai"},{"scode":"VN-24","sl":"Quang Ninh"},{"scode":"VN-25","sl":"Quang Tri"},{"scode":"VN-52","sl":"Sec Trang"},{"scode":"VN-05","sl":"Son La"},{"scode":"VN-37","sl":"Tay Ninh"},{"scode":"VN-20","sl":"Thai Binh"},{"scode":"VN-69","sl":"Thai Nguyen"},{"scode":"VN-21","sl":"Thanh Hoa"},{"scode":"VN-26","sl":"Thua Thien-Hue"},{"scode":"VN-46","sl":"Tien Giang"},{"scode":"VN-51","sl":"Tra Vinh"},{"scode":"VN-07","sl":"Tuyen Quang"},{"scode":"VN-49","sl":"Vinh Long"},{"scode":"VN-70","sl":"Vinh Yen"},{"scode":"VN-06","sl":"Yen Bai"}]},{"ccode":"VG","cl":"Virgin Islands","states":null},{"ccode":"VI","cl":"Virgin Islands","states":null},{"ccode":"WF","cl":"Wallis & Futuna Islands","states":null},{"ccode":"EH","cl":"Western Sahara","states":null},{"ccode":"YE","cl":"Yemen","states":[{"scode":"YE-AB","sl":"Abyān"},{"scode":"YE-BA","sl":"Al Bayḑā'"},{"scode":"YE-JA","sl":"Al Jawf"},{"scode":"YE-MR","sl":"Al Mahrah"},{"scode":"YE-MW","sl":"Al Maḩwit"},{"scode":"YE-HU","sl":"Al Ḩudaydah"},{"scode":"YE-DH","sl":"Dhamār"},{"scode":"YE-IB","sl":"Ibb"},{"scode":"YE-LA","sl":"Laḩij"},{"scode":"YE-MA","sl":"Ma'rib"},{"scode":"YE-SH","sl":"Shabwah"},{"scode":"YE-TA","sl":"Ta‘izz"},{"scode":"YE-SD","sl":"Şa'dah"},{"scode":"YE-SN","sl":"Şan‘ā'"},{"scode":"YE-HJ","sl":"Ḩajjah"},{"scode":"YE-HD","sl":"Ḩaḑramawt"},{"scode":"YE-AD","sl":"‘Adan"}]},{"ccode":"YU","cl":"Yugoslavia","states":[{"scode":"YU-CG","sl":"Crna Gora"},{"scode":"YU-KM","sl":"Kosovo-Metohija"},{"scode":"YU-SR","sl":"Srbija"},{"scode":"YU-VO","sl":"Vojvodina"}]},{"ccode":"CD","cl":"Zaire","states":[{"scode":"CD-BN","sl":"Bandundu"},{"scode":"CD-BC","sl":"Bas-Congo"},{"scode":"CD-HC","sl":"Haut-Congo"},{"scode":"CD-KW","sl":"Kasai-Occidental"},{"scode":"CD-KE","sl":"Kasai-Oriental"},{"scode":"CD-KA","sl":"Katanga"},{"scode":"CD-KN","sl":"Kinshasa"},{"scode":"CD-MA","sl":"Maniema"},{"scode":"CD-NK","sl":"Nord-Kivu"},{"scode":"CD-SK","sl":"Sud-Kivu"},{"scode":"CD-EQ","sl":"Équateur"}]},{"ccode":"ZM","cl":"Zambia","states":[{"scode":"ZM-02","sl":"Central"},{"scode":"ZM-08","sl":"Copperbelt"},{"scode":"ZM-03","sl":"Eastern"},{"scode":"ZM-04","sl":"Luapula"},{"scode":"ZM-09","sl":"Lusaka"},{"scode":"ZM-06","sl":"North-Western"},{"scode":"ZM-05","sl":"Northern"},{"scode":"ZM-07","sl":"Southern"},{"scode":"ZM-01","sl":"Western"}]},{"ccode":"ZW","cl":"Zimbabwe","states":[{"scode":"ZW-BU","sl":"Bulawayo"},{"scode":"ZW-HA","sl":"Harare"},{"scode":"ZW-MA","sl":"Manicaland"},{"scode":"ZW-MC","sl":"Mashonaland Central"},{"scode":"ZW-ME","sl":"Mashonaland East"},{"scode":"ZW-MW","sl":"Mashonaland West"},{"scode":"ZW-MV","sl":"Masvingo"},{"scode":"ZW-MN","sl":"Matabeleland North"},{"scode":"ZW-MS","sl":"Matabeleland South"},{"scode":"ZW-MI","sl":"Midlands"}]}];
