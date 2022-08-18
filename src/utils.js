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

const ttl_nano_pattern = /(## (Nanotation|Turtle) +Start ##)((.|\n|\r)*?)(## (Nanotation|Turtle) +(End|Stop) ##)(.*)/gmi;
const jsonld_nano_pattern = /(## JSON-LD +Start ##)((.|\n|\r)*?)((## JSON-LD +(End|Stop) ##))(.*)/gmi;
const rdf_nano_pattern = /(## RDF(\/|-)XML +Start ##)((.|\n|\r)*?)((## RDF(\/|-)XML +(End|Stop) ##))(.*)/gmi;


class YouID_Loader {
  constructor() {
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
  PREFIX owl:  <http://www.w3.org/2002/07/owl#>
  PREFIX oplcert: <http://www.openlinksw.com/schemas/cert#> 

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
       OPTIONAL { ?pubkey owl:sameAs ?fp_uri . }
       OPTIONAL { 
         <#{webid}> oplcert:hasCertificate ?cert .
         ?cert oplcert:fingerprint ?fp ;
               oplcert:fingerprint-digest ?fp_dg .
       }
    }`;

  this.load_pubkey_fp = `
  PREFIX owl:  <http://www.w3.org/2002/07/owl#>

  SELECT * WHERE 
    { 
       <#{pubkey}> owl:sameAs ?fp_uri . 
    }`;

  this.load_cert_fp = `
  PREFIX oplcert: <http://www.openlinksw.com/schemas/cert#> 

  SELECT * WHERE 
    { 
         <#{webid}> oplcert:hasCertificate ?cert .
         ?cert oplcert:fingerprint ?fp ;
               oplcert:fingerprint-digest ?fp_dg .
    }`;


  }

/**
       OPTIONAL { 
         <#{webid}> oplcert:hasCertificate ?cert .
         ?cert oplcert:fingerprint ?fp ;
               oplcert:fingerprint-digest ?fp_dg .
       }
***/

  async parse_data(data, content_type, baseURI)
  {
    var self = this;
    var store = await (this.load_data(baseURI, data, content_type)
            .catch(err => {
              throw new Error("Could not parse data from: "+baseURI+"\nError: "+err);
            }));
    return await self.exec_verify_query(store, {data, content_type, baseURI});
  }


  async verify_ID(uri, oidc) 
  {
    var self = this;
    var baseURI = new URL(uri);
        baseURI.hash = '';
        baseURI = baseURI.toString();

    var url_lower = baseURI.toLowerCase();
    var data, content_type;

    if (url_lower.endsWith(".html") || url_lower.endsWith(".htm")) {
      var rc = await oidc.fetch(baseURI, {credentials: 'include'});
      if (!rc.ok) {
        throw new Error("Could not load data from: "+baseURI);
      }
      data = await rc.text();
      content_type = 'text/html';
    }
    else if (url_lower.endsWith(".txt")) {
      var rc = await oidc.fetch(baseURI, {credentials: 'include'});
      if (!rc.ok) {
        throw new Error("Could not load data from: "+baseURI);
      }
      data = await rc.text();
      content_type = 'text/plain';
    }
    else {
      var rc = await (this.getProfile(uri, oidc)
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

      var store = await this.load_data(baseURI, data, content_type)
            .catch(err => {
              throw new Error("Could not parse data from: "+uri+"\nError: "+err);
            });

      var ret = await this.exec_verify_query(store, {data, content_type, baseURI});
      for(var webid in ret) {
        var data = ret[webid];
        rc.push(data); 
      }
    }

    return rc;
  }



  async exec_verify_query(store, profile) 
  {
    var self = this;

    var ret;
    var i = 0;

    while(i < 3) {
      try {
        ret = await this.exec_query(store, this.load_webid);
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

      var ret = await this.loadCertKeys(store, webid);
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
      var query = this.webid_details.replace(/#\{webid\}/g, _webid[i]);
      
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
        youid.msg = 'Failed, could not verify NetID.';
        youid.success = false;
      }
    }
    return lst;
  }


  genHTML_view(data)
  {
    var out;
    out = `<table class="footable verify-tbl"><tbody id="verify-data">`;

    out += `<tr id="row"><td>NetID</td><td>${data.id}</td></tr>`;
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
  }


  genHTML_cert_view(data)
  {
    var out;
    out = `<table class="footable verify-tbl"><tbody id="verify-data">`;

    out += `<tr id="row"><td>NetID</td><td>${data.id}</td></tr>`;
    out += `<tr id="row"><td>Name</td><td>${data.name}</td></tr>`;

    out += `<tr id="row"><td>Algorithm</td><td id="pkey_alg">${data.alg}</td></tr>`;
    out += `<tr id="row"><td>Modulus</td><td id="pkey_mod">${data.mod}</td></tr>`;
    out += `<tr id="row"><td>Exponent</td><td id="pkey_exp">${data.exp}</td></tr>`;

    out += `<tr id="row"><td>Account Address</td><td id="c_addr">${data.coin_addr}</td></tr>`;
    out += `<tr id="row"><td>Account PublicKey</td><td id="c_pub">${data.coin_pub}</td></tr>`;

    out += `</tbody></table>`;

    return out;
  }


  getProfile(url, oidc) 
  {
    return new Promise( (resolve, reject) => {
      var options = {
        method: 'GET',
        headers: {
          'Accept': 'text/turtle;q=1.0,application/ld+json;q=0.5,text/plain;q=0.2,text/html;q=0.5,*/*;q=0.1',
        }
      }

      oidc.fetch(url, options)
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
  }


  load_data(baseURI, data, content_type) 
  {
    var self = this;
    return new Promise(function(resolve, reject) {

      rdfstore.Store.yieldFrequency(15);
      rdfstore.create(function(err, store) {

        var options = {documentIRI:baseURI};
          
        if (content_type.indexOf('application/rdf+xml') != -1) 
        {
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
        }
        else if (content_type.indexOf('application/ld+json') != -1) 
        {
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
        }
        else if (content_type.indexOf('text/turtle') != -1) {
          store.load('text/turtle', data, options, function(err, res){
	    if (err)
              reject ("Could not parse profile\n\n"+err+"\n\n Profile data:\n\n"+data);
	    resolve(store);
	  });
        }
        else 
        {
          reject ("Unexpected content type :"+content_type);
        }
      })
    })
  }


  exec_query(store, query) 
  {
    var self = this;
    return new Promise((resolve, reject) => {
      store.execute(query, function(err, results) {
        resolve({err, results});
      })
    })
  }


  async loadCertKeys(store, webid) 
  {
    var self = this;

    var query = this.load_pubkey.replace(/#\{webid\}/g, webid);

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
      var pkeys = {};
      for (var i=0; i < rc.results.length; i++) {
        var r = rc.results[i];
        var pkey = r.pubkey.value;
        try {
          pkey = r.pubkey.token==='blank' ? r.pubkey.value : (new URL(r.pubkey.value)).hash;
          if (!pkey)
            pkey = r.pubkey.value;
        } catch(e) {
        }

        var v = {pkey, pubkey_uri:r.pubkey.value,  alg:r.alg.value,  mod:r.cert_mod.value, exp:r.cert_exp.value, fp_uri:[]};

        if (!pkeys[v.pubkey_uri])
          pkeys[v.pubkey_uri] = v;

        if (r.key_cr_dt) 
          pkeys[v.pubkey_uri]["key_created"] = r.key_cr_dt.value;
        if (r.key_cr_title) 
          pkeys[v.pubkey_uri]["key_title"] = r.key_cr_title.value;
        if (r.key_label) 
          pkeys[v.pubkey_uri]["key_label"] = r.key_label.value;
      }
      var ret = Object.values(pkeys)

      for(var i=0; i < ret.length; i++) {
        var lst = await this.loadPKey_Fp(store, ret[i].pubkey_uri);
        if (!lst.error && lst.fp)
          ret[i].fp_uri = lst.fp;
      }

      return {keys: ret};
   }
   else {
      return { "error": 'No data'};
   }
  }


  async loadPKey_Fp(store, pkey) 
  {
    var self = this;
    var store;

    var query = this.load_pubkey_fp.replace(/#\{pubkey\}/g, pkey);

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
      var fp = [];
      for (var i=0; i < rc.results.length; i++) {
        var r = rc.results[i];

        if (r.fp_uri)
          fp.push(r.fp_uri.value)
      }
      return {fp: fp};
   }
   else {
      return { "error": 'No data'};
   }
  }


  async loadCert_Fp(store, webid) 
  {
    var self = this;
    var store;

    var query = this.load_cert_fp.replace(/#\{webid\}/g, webid);

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
      var certs = {};
      for (var i=0; i < rc.results.length; i++) {
        var r = rc.results[i];

        var v = {cert: r.cert.value, fp_dg:[]};
        if (r.fp)
          v["fp"] = r.fp.value;

        if (!certs[v.cert])
          certs[v.cert] = v;

        if(r.fp_dg)
          certs[v.cert].fp_dg.push(r.fp_dg.value);
      }
      var ret = Object.values(pkeys)

      return ret.length > 0 ? ret[0] : null;
   }
   else {
      return { "error": 'No data'};
   }
  } 


}





function loadBinaryFile(file)
{
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onload = function(e) {
      resolve(e.target.result);
    };
    reader.onerror = function(e) {
       reject('Error: '+ e.type);
    };
    reader.readAsBinaryString(file);
  });
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
DOM.qSelAll = (sel) => { return document.querySelectorAll(sel); };
DOM.iSel = (id) => { return document.getElementById(id); };
DOM.qShow = (sel) => { DOM.qSel(sel).classList.remove('hidden'); };
DOM.qHide = (sel) => { DOM.qSel(sel).classList.add('hidden'); };
DOM.qShowAll = (sel) => { 
  var lst = DOM.qSelAll(sel); 
  for(var i of lst) {
    i.classList.remove('hidden');
  }
};
DOM.qHideAll = (sel) => { 
  var lst = DOM.qSelAll(sel); 
  for(var i of lst) {
    i.classList.add('hidden');
  }
};

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
  if (Browser.is_chrome) {
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
  if (Browser.is_chrome) {
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
  if (Browser.is_chrome) {
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




var Coin = {};

Coin.encode_base58 = function (input, maxline) 
{
  // base58 characters (Bitcoin alphabet)
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

  if(!(input instanceof Uint8Array)) {
    throw new TypeError('"input" must be a Uint8Array.');
  }
  if(maxline !== undefined && typeof maxline !== 'number') {
    throw new TypeError('"maxline" must be a number.');
  }
  if(input.length === 0) {
    return '';
  }

  let output = '';

  let i = 0;
  const base = alphabet.length;
  const first = alphabet.charAt(0);
  const digits = [0];
  for(i = 0; i < input.length; ++i) {
    let carry = input[i];
    for(let j = 0; j < digits.length; ++j) {
      carry += digits[j] << 8;
      digits[j] = carry % base;
      carry = (carry / base) | 0;
    }

    while(carry > 0) {
      digits.push(carry % base);
      carry = (carry / base) | 0;
    }
  }

  // deal with leading zeros
  for(i = 0; input[i] === 0 && i < input.length - 1; ++i) {
    output += first;
  }
  // convert digits to a string
  for(i = digits.length - 1; i >= 0; --i) {
    output += alphabet[digits[i]];
  }

  if(maxline) {
    const regex = new RegExp('.{1,' + maxline + '}', 'g');
    output = output.match(regex).join('\r\n');
  }

  return output;
}


/**
 * Decodes a baseN-encoded (using the given alphabet) string to a
 * Uint8Array.
 *
 * @param {string} input - The baseN-encoded input string.
 * @param {string} alphabet - The alphabet to use for decoding.
 *
 * @returns {Uint8Array} The decoded bytes in a Uint8Array.
 */
const _reverseAlphabets = {};

Coin.decode_b58 = function (input) 
{
  // base58 characters (Bitcoin alphabet)
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

  if(typeof input !== 'string') {
    throw new TypeError('"input" must be a string.');
  }

  if(input.length === 0) {
    return new Uint8Array();
  }

  let table = _reverseAlphabets[alphabet];
  if(!table) {
    // compute reverse alphabet
    table = _reverseAlphabets[alphabet] = [];
    for(let i = 0; i < alphabet.length; ++i) {
      table[alphabet.charCodeAt(i)] = i;
    }
  }

  // remove whitespace characters
  input = input.replace(/\s/g, '');

  const base = alphabet.length;
  const first = alphabet.charAt(0);
  const bytes = [0];
  for(let i = 0; i < input.length; i++) {
    const value = table[input.charCodeAt(i)];
    if(value === undefined) {
      return;
    }

    let carry = value;
    for(let j = 0; j < bytes.length; ++j) {
      carry += bytes[j] * base;
      bytes[j] = carry & 0xff;
      carry >>= 8;
    }

    while(carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }

  // deal with leading zeros
  for(let k = 0; input[k] === first && k < input.length - 1; ++k) {
    bytes.push(0);
  }

//  return new Uint8Array(bytes.reverse());
  var rbytes = bytes.reverse();
  var ss = [];
  for(var v of rbytes) {
    ss.push(String.fromCharCode(v));
  }
  return ss.join('');
}


Coin.hash_sha256 = function(v)
{
  var md = forge.md.sha256.create();
  md.start();
  md.update(v);
  return md.digest().data;
}


Coin.hash_ripemd160 = function(v)
{                                                                                        	
  var md = new RIPEMD160();
  return md.update(v, 'binary').digest('binary');
}

Coin.hash_keccak256 = function (v)
{
  const arr = Coin.str_uint8array(v);
  return keccak_256(arr);
}

// address must wihtout prefix 0x
Coin.eth_toChecksumAddress = function (address) 
{
  address = address.toLowerCase();
  var hash = keccak_256(address);
  var ret = '';
  for (var i = 0; i < address.length; i++) {
      if (parseInt(hash[i], 16) >= 8) {
          ret += address[i].toUpperCase();
      }
      else {
          ret += address[i];
      }
  }
  return ret;
}





Coin.bip_decode_wif_key = function (v)
{
  var decoded = Coin.decode_b58(v);
  if (!decoded)
    throw new Error('Wrong Bitcoin Private Key value');

  var len = decoded.length;
  var key_data = decoded.substring(0, len - 4);
  len = len - 4;
  var ck0 = decoded.substring(len);

  var digest_256 = Coin.hash_sha256(key_data);
  var ck1 = Coin.hash_sha256(digest_256).substring(0, 4);

  if (ck1 !== ck0)
    throw new Error("WIF checksum failed");

  if (key_data.charCodeAt(0) !== 0x80 && key_data.charCodeAt(0) !== 0xEF)
    throw new Error("WIF support mainnet & testnet");

  if (key_data.charCodeAt(len - 1) === 0x01)
    len--;

  return key_data.substring(1, len);
}


Coin.bip_import_wif_key_secp256k1 = function (wif_key)
{
  var prv = Coin.bip_decode_wif_key(wif_key);
  return prv;
}



Coin.str_uint8array = function (str) 
{
  const len = str.length;
  const buf = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    buf[i] = str.charCodeAt(i);
  }
  return buf;
}

Coin.bin_hex = function (v) {
  return forge.util.bytesToHex(v);
}


Coin.bip_p2pkh_address_from_pub = function (pkey, test_net, p2sh_p2pkh)
{
  var plen = pkey.length;
  var xcoord = pkey.substring(1, 33);
  var last_byte = pkey.charCodeAt(plen-1);

  var zpub, pref, p2pkh_address;

  if ( (last_byte % 2) != 0)
    zpub = String.fromCharCode(0x03) + xcoord
  else
    zpub = String.fromCharCode(0x02) + xcoord

  var hash0 = Coin.hash_sha256(zpub);
  var hash2 = Coin.hash_ripemd160(hash0);

  if (test_net)
    pref = String.fromCharCode(0x6F);
  else
    pref = String.fromCharCode(0x00);

  var ck = Coin.hash_sha256(Coin.hash_sha256(pref + hash2)).substring(0, 4);
  var p2pkh_address = Coin.encode_base58 (Coin.str_uint8array(pref + hash2 + ck));

  if (p2sh_p2pkh)
    {
      hash0 = Coin.hash_sha256(String.fromCharCode(0x00)+String.fromCharCode(0x14) + hash2);
      hash2 = Coin.hash_ripemd160(hash0);

      if (test_net)
        pref = String.fromCharCode(0xC4);
      else
        pref = String.fromCharCode(0x05);

      ck = Coin.hash_sha256(Coin.hash_sha256(pref + hash2)).substring(0, 4);
      p2sh_p2pkh_address = Coin.encode_base58 (pref + hash2 + ck);
      return p2sh_p2pkh_address;
    }

  return p2pkh_address;
}


Coin.btc_gen_x509_wif_san_from_pkey = function (pkey_value)
{
  const prv = Coin.bip_import_wif_key_secp256k1(pkey_value);

  const privateKey = Secp256k1.uint256( Coin.str_uint8array(prv), 16)
  const publicKey = Secp256k1.generatePublicKeyFromPrivateKeyData(privateKey)
  // 04 -  uncompressed value
  const pub_hex = '04' + publicKey.x + publicKey.y;
  const pub = forge.util.hexToBytes(pub_hex);

  const addr = Coin.bip_p2pkh_address_from_pub(pub);
  const san = 'bitcoin:' + addr;

  return {pub, san, pub_hex};
}


Coin.btc_gen_x509_wif_san_from_pub = function (pub_hex)
{
  const pub = forge.util.hexToBytes(pub_hex);
  const addr = Coin.bip_p2pkh_address_from_pub(pub);
  const san = 'bitcoin:' + addr;

  return {pub, san};
}


Coin.eth_gen_x509_san_from_pkey = function (priv_hex)
{
  const prv = forge.util.hexToBytes(priv_hex);

  const privateKey = Secp256k1.uint256( Coin.str_uint8array(prv), 16)
  const publicKey = Secp256k1.generatePublicKeyFromPrivateKeyData(privateKey, 1)
  // 04 -  uncompressed value
  const pub_hex = '04' + publicKey.x + publicKey.y;

  const pub = forge.util.hexToBytes(pub_hex);

  const addr = Coin.hash_keccak256(pub.substring(1)).substring(24);
  const san = 'ethereum:0x' + Coin.eth_toChecksumAddress(addr);

  return {pub, san, pub_hex};
}


Coin.btc_check = function (pub, addr)
{
  if (!addr.startsWith('bitcoin:'))
    return 0;

  const addr1 = addr.substring(8);

  if (!pub)
    return 0;

  const addr0 = Coin.bip_p2pkh_address_from_pub(pub);
  
  return (addr0 === addr1) ? 1 : 0;
}

Coin.eth_check = function(pub, addr)
{
  if (!addr.startsWith('ethereum:'))
    return 0;

  const addr1 = addr.substring(9);

  if (!pub)
    return 0;

  var addr0 = Coin.hash_keccak256(pub.substring(1)).substring(24);
  addr0 = '0x' + Coin.eth_toChecksumAddress(addr0);

  return (addr0 === addr1) ? 1 : 0;
}


Coin.coin_cert_check = function (cert)
{
  try {
    var pub, san, addr;

    var ext = cert.getExtension({id: '2.16.840.1.2381.2'});
    if (ext)
      pub = ext.value;
    else
      return {rc:0, err: "Could not found Coin PublicKey data in Certificate"}

    ext = cert.getExtension('subjectAltName');
    if (ext) {
      for(var nm of ext.altNames)
        if (nm.type == 6)
          san = nm.value;
    }

    var rc = 0;

    const CN = cert.subject.getField('CN');
    const name = CN.value;


    if (san) {
      if (san.startsWith('bitcoin:')) {
        rc = Coin.btc_check(pub, san);
        addr = san.substring(8);
      }
      else if (san.startsWith('ethereum:')) {
        rc = Coin.eth_check(pub, san);
        addr = san.substring(9);
      }
      else
      return {rc:0, err: "Could not found Account Address in Certificate"}
    }

    return {
             rc, san, addr, name,
             pub: Coin.bin_hex(pub), 
             exp: cert.publicKey.e.toString(10), 
             mod: cert.publicKey.n.toString(16).toUpperCase()
           };

  } catch(e) {
    console.log(e);
    return {rc:0, err: e.message};
  }

}