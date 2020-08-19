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

Certificate = function () {
  this.gPref = new Settings();
  this.gOidc = new OidcWeb();
  this.pdp = null;
}

Certificate.prototype = {

  reset_gen_cert: function () {
    var dt = new Date();
    this.YMD = dt.toISOString().substring(0, 10).replace(/-/g, '');
    this.HMS = dt.toISOString().substring(11, 19).replace(/:/g, '');

    var idp = DOM.qSel('#gen-cert-dlg #c_idp').value;

    if (idp === 'azure' || idp === 'aws_s3' || idp === 'ldp_tls' || idp === 'ldp_tls_solid')
      DOM.qSel('#gen-cert-dlg #c_cert_path').value = 'IDcard_' + this.YMD + '_' + this.HMS;
    else
      DOM.qSel('#gen-cert-dlg #c_cert_path').value = 'YouID/IDcard_' + this.YMD + '_' + this.HMS;
    
    DOM.qSel('#gen-cert-dlg #c_cert_name').value = 'cert_' + this.YMD + '_' + this.HMS;
  },

  initCountries: function () {
    var select = DOM.qSel('#c_country');
    select.options.length = 0;
    var el = document.createElement('option');
    el.text = '';
    el.value = '';
    select.add(el);

    for(var i=0; i< COUNTRIES.length; i++) {
      var c = COUNTRIES[i];
      var el = document.createElement('option');
      el.text = c.cl;
      el.value = c.ccode;
      select.add(el);
    }
  },

  gen_webid: function (idp) {
        var cert_path = DOM.qSel('#gen-cert-dlg #c_cert_path').value;

        if (idp === 'manual') {
        }
        else if (idp === 'opl_dav' || idp === 'opl_dav_https') {
          var uid = DOM.qSel('#gen-cert-dlg #c_dav_uid').value;
          var up = new Uploader_OPL_WebDav(uid, '', idp);

          DOM.qSel('#gen-cert-dlg #c_webid').value = up.getDirPath(cert_path) + '/profile.ttl#identity';
          DOM.qSel('#gen-cert-dlg #r_webid input').readOnly = true;
        }
        else if (idp === 'opl_ldp' || idp === 'opl_ldp_https') {
          var uid = DOM.qSel('#gen-cert-dlg #c_dav_uid').value;
          var up = new Uploader_OPL_LDP(uid, '', idp);

          DOM.qSel('#gen-cert-dlg #c_webid').value = up.getDirPath(cert_path) + '/profile.ttl#identity';
          DOM.qSel('#gen-cert-dlg #r_webid input').readOnly = true;
        }
        else if (idp === 'solid_oidc') {
        }
        else if (idp === 'ldp_tls' || idp === 'ldp_tls_solid') {
        }
        else if (idp === 'aws_s3') {
          var acc_key = DOM.qSel('#gen-cert-dlg #c_access_key').value;
          var sec_key = DOM.qSel('#gen-cert-dlg #c_secret_key').value;
          var bucket = DOM.qSel('#gen-cert-dlg #c_bucket').value;

          var up = new Uploader_AWS_S3(bucket, acc_key, sec_key);
          DOM.qSel('#gen-cert-dlg #c_webid').value = up.getDirPath(cert_path) + '/profile.ttl#identity';
          DOM.qSel('#gen-cert-dlg #r_webid input').readOnly = true;
        }
        else if (idp === 'azure') {
          var account = DOM.qSel('#gen-cert-dlg #c_account').value;
          var account_key = DOM.qSel('#gen-cert-dlg #c_account_key').value;

          var up = new Uploader_Azure(cert_path, account, account_key);
          DOM.qSel('#gen-cert-dlg #c_webid').value = up.getDirPath(cert_path) + '/profile.ttl#identity';
          DOM.qSel('#gen-cert-dlg #r_webid input').readOnly = true;
        }
  }, 


  click_gen_cert: async function (cur_webid) {
    var self = this;

    if (cur_webid) {
      DOM.iSel('c_profile').value = cur_webid;
    }

    self.reset_gen_cert();

    self.initCountries();

    if (DOM.qSel('#c_idp option:checked').value === 'solid_oidc') {
      this.oidc_changed();
    }

    DOM.qSel('#gen-cert-dlg #c_pdp')
      .onchange = (e) => {
        var sel = DOM.qSel('#c_pdp option:checked').value;
        DOM.qHide('#gen-cert-dlg #r_pdp-webid');
        DOM.qHide('#gen-cert-dlg #r_pdp-name');

        if (sel === 'pdp_webid') {
          DOM.qShow('#gen-cert-dlg #r_pdp-webid');
        } else {
          DOM.qShow('#gen-cert-dlg #r_pdp-name');
        }
      };

    
    DOM.qSel('#gen-cert-dlg #btn-fetch-pdp')
      .onclick = async () => {
        var sel = DOM.qSel('#c_pdp option:checked').value;
        self.pdp = null;
        switch(sel) 
        {
          case 'pdp_google':
            {
              googleAuth.authorize(function() {
                googleAuth.userInfo(function(data) {
                  DOM.iSel('c_name').value = data.name ? data.name: "";
                  DOM.iSel('c_org').value = 'Google';
                  DOM.iSel('c_email').value = data.email ? data.email : "";
                });
              });
              break;
            }
          case 'pdp_facebook':
            {
              facebookAuth.authorize(function() {
                facebookAuth.userInfo(function(data) {
                  DOM.iSel('c_name').value = data.name ? data.name: "";
                  DOM.iSel('c_org').value = 'Facebook';
                  DOM.iSel('c_email').value = data.email ? data.email : "";
                });
              });
              break;
            }
          case 'pdp_amazon':
            {
              amazonAuth.authorize(function() {
                amazonAuth.userInfo(function(data) {
                  DOM.iSel('c_name').value = data.name ? data.name: "";
                  DOM.iSel('c_org').value = 'Amazon';
                  DOM.iSel('c_email').value = data.email ? data.email : "";
                });
              });
              break;
            }
          case 'pdp_win_live':
            {
              winLiveAuth.authorize(function() {
                winLiveAuth.userInfo(function(data) {
                  DOM.iSel('c_name').value = data.name ? data.name: "";
                  DOM.iSel('c_org').value = 'Windows Live';
                  DOM.iSel('c_email').value = data.email ? data.email : "";
                });
              });
              break;
            }
          case 'pdp_win_azure':
            {
              winAzureAuth.authorize(function() {
                winAzureAuth.userInfo(function(data) {
                  DOM.iSel('c_name').value = data.name ? data.name: "";
                  DOM.iSel('c_org').value = 'Windows Azure';
                  DOM.iSel('c_email').value = data.email ? data.email : "";
                });
              });
              break;
            }
          case 'pdp_linkedin':
            {
              linkedinAuth.authorize(function() {
                linkedinAuth.userInfo(function(data) {
                  DOM.iSel('c_name').value = data.name ? data.name: "";
                  DOM.iSel('c_org').value = 'LinkedIn';
                  DOM.iSel('c_email').value = data.email ? data.email : "";
                  self.pdp = {id: sel, title:'LinkedIn', message:true};
                });
              });
              break;
            }
          case 'pdp_twitter':
            {
              twitterAuth.authorize(function() {
                twitterAuth.userInfo(function(data) {
                  DOM.iSel('c_name').value = data.name ? data.name: "";
                  DOM.iSel('c_org').value = 'Twitter';
                  DOM.iSel('c_email').value = data.email ? data.email : "";
                  self.pdp = {id: sel, title:'Twitter', message:true};
                });
              });
              break;
            }
        }
      };

    
    DOM.qSel('#gen-cert-dlg #btn-fetch-profile')
      .onclick = async () => {
        var uri = DOM.iSel('c_profile').value.trim();
        if (uri.length == 0)
          return;

        var url = new URL(uri);
        url.hash = '';
        url = url.toString();
        var url_lower = url.toLowerCase();
        var rc, rc0;
        var idata;

        try {
          if (url_lower.endsWith(".html") || url_lower.endsWith(".htm"))
            {
              DOM.qShow('#gen-cert-dlg #fetch_wait');
              var status = await fetch(url, {credentials: 'include'});
              if (!status.ok) {
                DOM.qHide('#gen-cert-dlg #fetch_wait');
                Msg.showInfo("Could not load URL "+url);
                return;
              }

              var data = await status.text();
              var parser = new DOMParser();
              var doc = parser.parseFromString(data, 'text/html');
              idata = sniff_doc_data(doc, uri);
              
              DOM.qHide('#gen-cert-dlg #fetch_wait');
            }
          else if (url_lower.endsWith(".txt"))
            {
              var data;
              DOM.qShow('#gen-cert-dlg #fetch_wait');
              var status = await fetch(url, {credentials: 'include'});
              if (!status.ok) {
                DOM.qHide('#gen-cert-dlg #fetch_wait');
                Msg.showInfo("Could not load URL "+url);
                return;
              }
              data = await status.text();
              
              idata = sniff_text_data(data, uri);

              DOM.qHide('#gen-cert-dlg #fetch_wait');
            }

          if (idata) 
            {
              async function get_data(data, content_type, baseURI)
              {
                try {
                  var loader = new YouID_Loader();
                  var ret = await loader.parse_data(data, content_type, baseURI);
                  for(var webid in ret) {
                    var data = ret[webid];
                    if (data.success && !rc0)
                      rc0 = data;
                    if (data.success && data.id.startsWith(url))
                      return data;
                  }
                  return null;
                } catch(e) {
                  alert(e);
                  return null;
                }
              }

              rc = null;
              for(var i=0; i<idata.ldjson.length; i++) {
                var rc = await get_data(idata.ldjson[i], 'application/ld+json', idata.baseURI);
                if (rc && rc.success)
                  break;
              }
              if (!rc)
                for(var i=0; i<idata.ttl.length; i++) {
                  var rc = await get_data(idata.ttl[i], 'text/turtle', idata.baseURI);
                  if (rc && rc.success)
                    break;
                }
              if (!rc)
                for(var i=0; i<idata.rdfxml.length; i++) {
                  var rc = await get_data(idata.rdfxml[i], 'application/rdf+xml', idata.baseURI);
                  if (rc && rc.success)
                    break;
                }
            }
          else
            {
              DOM.qShow('#gen-cert-dlg #fetch_wait');
              var loader = new YouID_Loader();
              var ret = await loader.verify_ID_1(uri);
                  
              for(var webid in ret) {
                var data = ret[webid];
                if (data.success && !rc0)
                  rc0 = data;
                if (data.success && data.id.startsWith(url)) {
                  rc = data;
                  break;
                }
              }

              DOM.qHide('#gen-cert-dlg #fetch_wait');
            } 

            if (!rc)
              rc = rc0;

            if (rc && rc.success) {
               DOM.iSel('c_webid').value = rc.id ? rc.id : "";
               DOM.iSel('c_name').value = rc.name ? rc.name: "";
               DOM.iSel('c_email').value = rc.email ? rc.email : "";
            }

        } catch(e) {
           DOM.qHide('#gen-cert-dlg #fetch_wait');
           Msg.showInfo("Error:"+e+" for load URL "+uri);
           return;
        }

      };

    DOM.qSel('#gen-cert-dlg #c_country')
      .onchange = (e) => {
        var sel_country = DOM.qSel('#c_country option:checked').value;

        DOM.qSel('#c_state').value = '';

        var states_list = DOM.qSel('#c_states');
        states_list.innerHTML = '';

        var states = null;
        for(var i=0; i< COUNTRIES.length; i++) {
          var c = COUNTRIES[i];
          if (c.ccode === sel_country) {
            states = c.states;
            break; 
          }
        }
        if (states) {
          for(var i=0; i < states.length; i++) {
            var el = document.createElement('option');
            el.value = states[i].sl;
            states_list.appendChild(el);
          }
        }
      };

    DOM.qSel('#gen-cert-dlg #c_dav_uid')
      .onchange = (e) => {
        var uid = DOM.qSel('#gen-cert-dlg #c_dav_uid').value;
        var idp = DOM.qSel('#c_idp option:checked').value;
        var up;

        if (idp === 'opl_ldp' || idp === 'opl_ldp_https')
          up = new Uploader_OPL_LDP(uid, '', idp)
        else
          up = new Uploader_OPL_WebDav(uid, '', idp)

        DOM.qSel('#gen-cert-dlg #c_dav_path').value = up.getBasePath();
      };

    DOM.qSel('#gen-cert-dlg #c_idp')
      .onchange = (e) => {
        var gen = {};
        var sel = DOM.qSel('#c_idp option:checked').value;

        DOM.qSel('#gen-cert-dlg #r_webid input').readOnly = false;
        DOM.qHide('#gen-cert-dlg #c_webdav');
        DOM.qHide('#gen-cert-dlg #c_solid_oidc');
        DOM.qHide('#gen-cert-dlg #r_cert_name');
        DOM.qHide('#gen-cert-dlg #r_cert_path');
        DOM.qHide('#gen-cert-dlg #c_aws_s3');
        DOM.qHide('#gen-cert-dlg #c_azure');
        DOM.qSel('#gen-cert-dlg #c_webid').value = '';

        if (sel === 'manual') {
          DOM.qShow('#gen-cert-dlg #r_webid');
        }
        else if (sel === 'opl_dav' || sel === 'opl_dav_https') {
          DOM.qSel('#gen-cert-dlg #c_cert_path').value = 'YouID/IDcard_' + self.YMD + '_' + self.HMS;

          DOM.qShow('#gen-cert-dlg #r_cert_name');
          DOM.qShow('#gen-cert-dlg #r_cert_path');
          DOM.qShow('#gen-cert-dlg #c_webdav');
          var uid = DOM.qSel('#gen-cert-dlg #c_dav_uid').value;
          var up = new Uploader_OPL_WebDav(uid, '', sel)
          DOM.qSel('#gen-cert-dlg #c_dav_path').value = up.getBasePath();
        }
        else if (sel === 'opl_ldp' || sel === 'opl_ldp_https') {
          DOM.qSel('#gen-cert-dlg #c_cert_path').value = 'YouID/IDcard_' + self.YMD + '_' + self.HMS;

          DOM.qShow('#gen-cert-dlg #r_cert_name');
          DOM.qShow('#gen-cert-dlg #r_cert_path');
          DOM.qShow('#gen-cert-dlg #c_webdav');
          var uid = DOM.qSel('#gen-cert-dlg #c_dav_uid').value;
          var up = new Uploader_OPL_LDP(uid, '', sel)
          DOM.qSel('#gen-cert-dlg #c_dav_path').value = up.getBasePath();
        }
        else if (sel === 'solid_oidc') {
          DOM.qShow('#gen-cert-dlg #r_webid');
          DOM.qSel('#gen-cert-dlg #r_webid input').readOnly = true;
          DOM.qShow('#gen-cert-dlg #c_solid_oidc');
          this.oidc_changed();
        }
        else if (sel === 'ldp_tls' || sel === 'ldp_tls_solid') {
          DOM.qSel('#gen-cert-dlg #c_cert_path').value = 'IDcard_' + self.YMD + '_' + self.HMS;

          DOM.qShow('#gen-cert-dlg #r_webid');
          DOM.qShow('#gen-cert-dlg #r_cert_name');
          DOM.qShow('#gen-cert-dlg #r_cert_path');
        }
        else if (sel === 'aws_s3') {
          var e_bucket = DOM.qSel('#gen-cert-dlg #c_bucket');
          if (e_bucket.value.length < 1) {
            e_bucket.value = DOM.qSel('#s3_account #c_s3_bucket').value;
            if (e_bucket.value.length < 1)
              e_bucket.value = 'youid-card-'+create_UUID();
          }
          DOM.qSel('#gen-cert-dlg #c_access_key').value = DOM.qSel('#s3_account #c_s3_access_key').value;
          DOM.qSel('#gen-cert-dlg #c_secret_key').value = DOM.qSel('#s3_account #c_s3_secret_key').value;
          
          DOM.qSel('#gen-cert-dlg #c_cert_path').value = 'IDcard_' + self.YMD + '_' + self.HMS;
          DOM.qShow('#gen-cert-dlg #r_cert_name');
          DOM.qShow('#gen-cert-dlg #r_cert_path');
          DOM.qShow('#gen-cert-dlg #c_aws_s3');
        }
        else if (sel === 'azure') {
          DOM.qSel('#gen-cert-dlg #c_account').value = DOM.qSel('#az_account #c_az_account').value;
          DOM.qSel('#gen-cert-dlg #c_account_key').value = DOM.qSel('#az_account #c_az_sas_token').value;

          DOM.qSel('#gen-cert-dlg #c_cert_path').value = 'IDcard_' + self.YMD + '_' + self.HMS;
          DOM.qShow('#gen-cert-dlg #r_cert_name');
          DOM.qShow('#gen-cert-dlg #r_cert_path');
          DOM.qShow('#gen-cert-dlg #c_azure');
        }
        this.gen_webid(sel);
      };

    DOM.qSel('#gen-cert-dlg #btn-solid-oidc-login')
      .onclick = async () => {
        if (this.gOidc.webid) {
          await this.gOidc.logout();
          self.oidc_changed();
        } else {
          this.gOidc.login();
        }
      };

    DOM.qSel('#gen-cert-dlg #c_cert_path')
      .onchange = async () => {
        this.gen_webid(DOM.qSel('#c_idp option:checked').value);
      };
    DOM.qSel('#gen-cert-dlg #c_account')
      .onchange = async () => {
        this.gen_webid(DOM.qSel('#c_idp option:checked').value);
      };
    DOM.qSel('#gen-cert-dlg #c_bucket')
      .onchange = async () => {
        this.gen_webid(DOM.qSel('#c_idp option:checked').value);
      };
    DOM.qSel('#gen-cert-dlg #c_dav_path')
      .onchange = async () => {
        this.gen_webid(DOM.qSel('#c_idp option:checked').value);
      };
    DOM.qSel('#gen-cert-dlg #c_dav_uid')
      .onchange = async () => {
        this.gen_webid(DOM.qSel('#c_idp option:checked').value);
      };



    DOM.qSel('#gen-cert-dlg #btn-gen-cert')
      .onclick = async () => {
        var gen = {};
        gen.idp = DOM.qSel('#c_idp option:checked').value;
        gen.cert_name = DOM.qSel('#gen-cert-dlg #c_cert_name').value;
        if (gen.cert_name.length < 1) {
          gen.cert_name = 'cert_' + self.YMD + '_' + self.HMS;
        }

        gen.cert_dir = DOM.qSel('#gen-cert-dlg #c_cert_path').value;
        if (gen.cert_dir.length < 1) {
          if (gen.idp === 'azure' || gen.idp === 'aws_s3')
            gen.cert_dir = 'IDcard_' + self.YMD + '_' + self.HMS;
          else
            gen.cert_dir = 'YouID/IDcard_' + self.YMD + '_' + self.HMS;
        }

        if (gen.idp === 'opl_dav' || gen.idp === 'opl_dav_https') {
          gen.uid = DOM.qSel('#gen-cert-dlg #c_dav_uid').value;
          gen.pwd = DOM.qSel('#gen-cert-dlg #c_dav_pwd').value;
          gen.cert_dir = DOM.qSel('#gen-cert-dlg #c_cert_path').value;
          gen.dav_path = DOM.qSel('#gen-cert-dlg #c_dav_path').value;

          if (gen.uid.length < 1) {
            alert('DAV User is empty');
            return
          }
          if (gen.pwd.length < 1) {
            alert('DAV Pwd is empty');
            return
          }

          var up = new Uploader_OPL_WebDav(gen.uid, gen.pwd, gen.idp);
          var rc = await up.checkCredentials();
          if (!rc) {
            alert('Wrong DAV User or Pwd');
            return
          }
          rc = await up.checkDirExists(gen.cert_dir);
          if (rc && rc.exists) {
            alert('Dir ' + gen.cert_dir + ' exists already');
            return;
          } else if (rc && rc.err) {
            alert('Error ' + rc.err);
            return;
          }
        }
        else if (gen.idp === 'solid_oidc') 
        {
        }
        else if (gen.idp === 'ldp_tls' || gen.idp === 'ldp_tls_solid') 
        {
        }
        else if (gen.idp === 'opl_ldp' || gen.idp === 'opl_ldp_https') 
        {
          gen.uid = DOM.qSel('#gen-cert-dlg #c_dav_uid').value;
          gen.pwd = DOM.qSel('#gen-cert-dlg #c_dav_pwd').value;
          gen.cert_dir = DOM.qSel('#gen-cert-dlg #c_cert_path').value;
          gen.dav_path = DOM.qSel('#gen-cert-dlg #c_dav_path').value;

          if (gen.uid.length < 1) {
            alert('DAV User is empty');
            return
          }
          if (gen.pwd.length < 1) {
            alert('DAV Pwd is empty');
            return
          }

          var up = new Uploader_OPL_LDP(gen.uid, gen.pwd, gen.idp);
          var rc = await up.checkCredentials();
          if (!rc) {
            alert('Wrong DAV User or Pwd');
            return
          }
          rc = await up.checkDirExists(gen.cert_dir);
          if (rc && rc.exists) {
            alert('Dir ' + gen.cert_dir + ' exists already');
            return;
          } else if (rc && rc.err) {
            alert('Error ' + rc.err);
            return;
          }
        }
        else if (gen.idp === 'aws_s3') 
        {
          gen.acc_key = DOM.qSel('#gen-cert-dlg #c_access_key').value;
          gen.sec_key = DOM.qSel('#gen-cert-dlg #c_secret_key').value;
          gen.bucket = DOM.qSel('#gen-cert-dlg #c_bucket').value;

          if (gen.acc_key.length < 1) {
            alert('S3 Access Key is empty');
            return
          }
          if (gen.sec_key.length < 1) {
            alert('S3 Secret Key is empty');
            return
          }
          if (gen.bucket.length < 1) {
            alert('Bucket name is empty');
            return
          }
          for (var i=0; i< gen.bucket.length; i++) {
            var c = gen.bucket[i];
            if (c === '_') {
              alert('Bucket name contains invalid character \'-\'');
              return;
            }
            if (c !== c.toLowerCase()) {
              alert('Bucket name must not contain uppercase characters ');
              return;
            }
          }

          var up = new Uploader_AWS_S3(gen.bucket, gen.cert_dir, gen.acc_key, gen.sec_key);
          var lst = await up.checkCredentials();
          if (!lst) {
            alert('Wrong Access Key or Secret Key');
            return
          }

          var rc = await up.checkDirExists(gen.cert_dir);
          if (rc && rc.exists) {
            alert('Dir ' + gen.cert_dir + ' exists already');
            return;
          } else if (rc && rc.err) {
            alert('Error ' + rc.err);
            return;
          }
        }
        else if (gen.idp === 'azure') 
        {
          gen.account = DOM.qSel('#gen-cert-dlg #c_account').value;
          gen.account_key = DOM.qSel('#gen-cert-dlg #c_account_key').value;

          if (gen.account.length < 1) {
            alert('Storage Account is empty');
            return
          }
          if (gen.account_key.length < 1) {
            alert('Account is empty');
            return
          }

          var up = new Uploader_Azure(gen.cert_dir, gen.account, gen.account_key);
          var lst = await up.checkCredentials();
          if (!lst) {
            alert('Wrong Account Key or SAS Key');
            return
          }

          var rc = await up.checkDirExists(gen.cert_dir);
          if (rc && rc.exists) {
            alert('Dir ' + gen.cert_dir + ' exists already');
            return;
          } else if (rc && rc.err) {
            alert('Error ' + rc.err);
            return;
          }
        }

        this.genCertificate(gen);
      };

    DOM.qSel('#gen-cert-dlg #c_idp').onchange();

    return false;
  },


  oidc_changed: async function () {
    try {
      await this.gOidc.checkSession();

      var webid_href = DOM.qSel('#gen-cert-dlg #c_oidc_webid');

      if (this.gOidc.webid) {
        webid_href.href = this.gOidc.webid;
        webid_href.title = this.gOidc.webid;
        webid_href.classList.remove('hidden');

        DOM.qSel('#gen-cert-dlg #c_webid').value = this.gOidc.webid;

        var url = new URL(this.gOidc.webid);
        url.hash = '';
        var cert_path = url.pathname.substring(1);
        var i = cert_path.lastIndexOf('/');
        if (i != -1)
          cert_path = cert_path.substring(0, i);
        DOM.qSel('#gen-cert-dlg #c_cert_path').value = cert_path;

        try {
          var youid = new YouID_Loader();
          var rc = await youid.verify_ID_1(this.gOidc.webid, this.gOidc.fetch);
          if (rc) {
            for(var webid in rc) {
              var data = rc[webid];
              if (data.success) {
                DOM.iSel('c_name').value = data.name;
                break;
              }
            }
          }
        } catch (e) {
          console.log(e);
        }

      } else {
        webid_href.href = '';
        webid_href.title = '';
        webid_href.classList.add('hidden');
        DOM.qSel('#gen-cert-dlg #c_cert_path').value = '';
      }

      var oidc_login_btn = DOM.qSel('#gen-cert-dlg #btn-solid-oidc-login');
      oidc_login_btn.innerText = this.gOidc.webid ? 'Logout' : 'Login';

    } catch (e) {
      console.log(e);
    }
  },


  genCertificate: function (gen) {
    this.certData = {};
    var self = this;

    var webid = DOM.qSel('#gen-cert-dlg #c_webid').value;
    var name = DOM.qSel('#gen-cert-dlg #c_name').value;
    var email = DOM.qSel('#gen-cert-dlg #c_email').value;
    var certOrg = DOM.qSel('#gen-cert-dlg #c_org').value;
    var certOrgUnit = DOM.qSel('#gen-cert-dlg #c_org_unit').value;
    var certCity = DOM.qSel('#gen-cert-dlg #c_city').value;
    var certState = DOM.qSel('#gen-cert-dlg #c_state').value;
    var certCountry = DOM.qSel('#gen-cert-dlg #c_country option:checked').value;
    var certPwd = DOM.qSel('#gen-cert-dlg #c_pwd').value;
    var certPwd1 = DOM.qSel('#gen-cert-dlg #c_pwd1').value;

    if (certPwd.length < 1) {
      alert('Certificate password could not be empty');
      return
    }
    if (certPwd != certPwd1) {
      alert('Confirm certificate password with properly value');
      return
    }

    if (certCountry.length > 0 && certCountry.length != 2) {
      alert('Country must be two characters');
      return
    }
    if (name.length < 1) {
      alert('Name is empty');
      return
    }
    if (webid.length < 1) {
      alert('WebId is empty');
      return
    }

    DOM.qSel('#gen-cert-dlg #c_pwd').value = '';
    DOM.qSel('#gen-cert-dlg #c_pwd1').value = '';
    DOM.qShow('#gen-cert-ready-dlg #c_wait');
    DOM.qHide('#gen-cert-ready-dlg #p12-cert');
    DOM.qSel('#gen-cert-ready-dlg #pkcs12-download').removeAttribute('href');
    DOM.qHide('#gen-cert-ready-dlg #btn-upload_cert');
    DOM.qHide('#gen-cert-ready-dlg #u_wait');
    DOM.qHide('#gen-cert-ready-dlg #webid-cert');
    DOM.qHide('#gen-cert-ready-dlg #webid-card');
    DOM.qHide('#gen-cert-ready-dlg #profile-card');
    DOM.qHide('#gen-cert-ready-dlg #r-reg_delegate')
    DOM.qHide('#gen-cert-ready-dlg #r-message')
    DOM.qSel('#gen-cert-ready-dlg #delegate-text').value = '';
    DOM.qSel('#gen-cert-ready-dlg #delegator-text').value = '';
    DOM.qSel('#gen-cert-ready-dlg #delegate_uri').value = '';
    DOM.qSel('#gen-cert-ready-dlg #reg_delegate').checked = false;

    gen.delegate_uri = null;
    this.setDelegateText(gen);
    this.setDelegatorText(gen);
    DOM.qSel('#gen-cert-ready-dlg #btn-upload_cert').disabled = false;
    DOM.qHide('#gen-cert-ready-dlg #delegate-create');


    DOM.qSel('#gen-cert-ready-dlg #btn-delegate_uri')
      .onclick = async () => {
        await self.fetchDelegate(gen, webid);
      };

    DOM.qSel('#gen-cert-ready-dlg #btn-delegate_cert_key')
      .onclick = async () => {
        if (!gen.delegate_keys || gen.delegate_keys.length == 0) {
           alert('Fetch Delegate profile at first.');
           return; 
        }
        self.showCertKeys(gen);
      };

    DOM.qSel('#gen-cert-ready-dlg #reg_delegate')
      .onchange = (e) => {
        if (DOM.qSel('#gen-cert-ready-dlg #reg_delegate').checked)
          DOM.qShow('#gen-cert-ready-dlg #delegate-create');
        else
          DOM.qHide('#gen-cert-ready-dlg #delegate-create');
      };

    DOM.qSel('#gen-cert-ready-dlg #title').innerText = 'Generate Certificate...';
    $('#gen-cert-ready-dlg').modal('show');
    $('#gen-cert-ready-dlg').on('hidden.bs.modal', (e) =>{
       self.reset_gen_cert();
    })

    setTimeout(function () {
      certData = self.genCert(name, email, certOrg, certOrgUnit, certCity, certState, certCountry, webid, certPwd);

      var p12Url = 'data:application/x-pkcs12;base64,' + certData.pkcs12B64;
      DOM.qSel('#gen-cert-ready-dlg #pkcs12-download').setAttribute('href', p12Url);
      DOM.qShow('#gen-cert-ready-dlg #p12-cert');
      DOM.qHide('#gen-cert-ready-dlg #c_wait');
      DOM.qHide('#gen-cert-ready-dlg #btn-upload_cert');
      DOM.qHide('#gen-cert-ready-dlg #ready_msg');
      DOM.qHide('#gen-cert-ready-dlg #ready_msg_manual');
      DOM.qShow('#gen-cert-ready-dlg #r-reg_delegate');
      DOM.qShow('#gen-cert-ready-dlg #webid-cert');

      DOM.qSel('#gen-cert-ready-dlg #title').innerText = 'Upload certificate to server';

      var v = DOM.qSel('#webid-cert #webid_href');
      v.href = webid;
      v.innerText = webid;

      if (gen.idp === 'manual') {
        DOM.qShow('#gen-cert-ready-dlg #ready_msg_manual');
        var s = self.genManualCard(webid, certData);
        DOM.qSel('#profile-card #text-n-ttl').value = s.nano_ttl;
        DOM.qSel('#profile-card #text-n-jsonld').value = s.nano_jsonld;
        DOM.qSel('#profile-card #text-n-rdfxml').value = s.nano_rdfxml;
        DOM.qSel('#profile-card #text-i-ttl').value = s.i_ttl;
        DOM.qSel('#profile-card #text-i-jsonld').value = s.i_jsonld;
        DOM.qSel('#profile-card #text-i-rdfxml').value = s.i_rdfxml;
        DOM.qShow('#gen-cert-ready-dlg #profile-card');
      } else {

        DOM.qShow('#gen-cert-ready-dlg #ready_msg');
        DOM.qShow('#gen-cert-ready-dlg #btn-upload_cert');
        DOM.qSel('#gen-cert-ready-dlg #btn-upload_cert')
          .onclick = async () => {
            DOM.qShow('#gen-cert-ready-dlg #u_wait');
            await self.uploadCert(gen, webid, certData);
          };
      }

      DOM.qSel('#gen-cert-ready-dlg #btn-update_delegate')
        .onclick = async () => {
          await self.uploadDelegate(gen, webid, certData);
        };
      DOM.qSel('#gen-cert-ready-dlg #btn-update_delegator')
        .onclick = async () => {
          await self.uploadDelegator(gen, webid, certData);
        };

      if (self.pdp && self.pdp.message) {
        DOM.qShow('#gen-cert-ready-dlg #r-message');
        DOM.qSel('#gen-cert-ready-dlg #ann_title').innerText = `Announce your Certificate identity claims via ${self.pdp.title} post.`;
        DOM.qSel('#gen-cert-ready-dlg #btn-message')
          .onclick = () => {
            var msg = `ID Claim: ${certData.fingerprint_b64}`;
            if (self.pdp.id === 'pdp_twitter') 
            {
              twitterAuth.sendMessage(msg, function(data, error) { 
                if (error)
                  alert('Error: '+error);
                else
                  alert('Message was sent');
              });
            }
            else if (self.pdp.id === 'pdp_linkedin') 
            {
              linkedinAuth.sendMessage(msg, function(data, error) { 
                if (error)
                  alert('Error: '+error);
                else
                  alert('Message was sent');
              });
            }
        }
      }

    }, 500);

    return false;
  },


  showCertKeys: function(gen) {
     var self = this;
     var tbody = DOM.qSel('#cert-key-dlg #cert-key-tbl tbody');
     var keys = gen.delegate_keys;

     tbody.innerHTML = '';

     function mk_subitem(name, val)
     {
       if (val) {
         return '<tr class="dtext">'
               +' <td class="dtext_col1" valign="top">'
               + name
               +' </td>'
               +'<td>'+val+'</td>'
               +'</tr>';
       } else {
         return '';
       }
     }

     function mk_row(k)
     {
       if (!k)
         return '';

       var label = k.pkey + (k.key_label?' / '+k.key_label : '');

       var s = '<td><table class="certkeys_item"><tbody>';

       s+= `<tr><td style="width:20px">
             <input type="checkbox" id="chk">
            </td><td class="key_name">${label}</td></tr>`;

       s+= `<tr><td></td><td class="dtext">
              <input title="Show details" height="12" width="12" src="lib/css/img/plus.png" id="det_btn" type="image">
              Details
            </td></tr>`;

       s += '<tr> <td></td> <td> <table class="dettable hidden"> <tbody>';

       s += mk_subitem('Label', k.key_label);
       s += mk_subitem('Title', k.key_title);
       s += mk_subitem('Created', k.key_created);
       s += mk_subitem('Modulus', k.mod);
       s += mk_subitem('Exponent', k.exp);

       s += '</tbody> </table> </td> </tr>';

       s +=' </tbody> </table> </td>'

       return s;
     }

     
     for(var i=0; i < keys.length; i++) {
       var s = mk_row(keys[i]);
       if (s) {
         var r = tbody.insertRow(-1);
         r.innerHTML = s;

         if (keys[i].mod === gen.delegate_key_mod)
           r.querySelector('#chk').checked = true;

         r.querySelector('#chk').onclick = (ev) => {
            var chk = ev.target;
            if (chk.checked) {
              console.log(ev);
              var lst = tbody.querySelectorAll('#chk');
              for (var i=0; i < lst.length; i++) {
                if (lst[i] !== chk)
                  lst[i].checked = false;
              }
            }
          };
         r.querySelector('#det_btn').onclick = (ev) => {
            var btn = ev.target;
            var item = btn.closest('table.certkeys_item');
            var tbl = item.querySelector('table.dettable');
            tbl.classList.toggle('hidden');
            if (tbl.classList.contains('hidden'))
              btn.src = "lib/css/img/plus.png"
            else
              btn.src = "lib/css/img/minus.png"
          };
       }
     }

     $('#cert-key-dlg').modal('show');
     DOM.qSel('#cert-key-dlg #btn-ok').onclick = () => {
        
        var lst = tbody.querySelectorAll('#chk');
        for (var i=0; i < lst.length; i++) {
          if (lst[i].checked) {
            var k = keys[i];
            gen.delegate_key_exp = k.exp;
            gen.delegate_key_mod = k.mod;
            gen.delegate_key_label = k.pkey + (k.key_label?' / '+k.key_label : '');
            this.setDelegatorText(gen);
            $('#cert-key-dlg').modal('hide');
            break;
          }
        }
       };

  },

  uploadCert: async function (gen, webid, certData) {
    var done_ok = false;
    try {
      var up = null;
      if (gen.idp === 'solid_oidc') {
        var url = new URL(webid);
        up = new Uploader_Solid_OIDC(this.gOidc, url.origin + '/');

        var query = this.genSolidInsertCert(webid, certData.cert);
        var rc = await up.updateProfileCard(webid, query);
        if (!rc.ok) {
          alert('Could not update profile card');
          return;
        }

        rc = await up.uploadFile(gen.cert_dir, gen.cert_name + '.p12', certData.pkcs12B64, 'application/x-pkcs12');
        if (!rc.ok) {
          alert('Could not upload file ' + gen.cert_name + '.p12');
          return;
        }
      } 
      else {
        if (gen.idp === 'opl_dav' || gen.idp === 'opl_dav_https') {
          up = new Uploader_OPL_WebDav(gen.uid, gen.pwd, gen.idp);
        }
        else if (gen.idp === 'ldp_tls' || gen.idp === 'ldp_tls_solid') {
          var url = new URL(webid);
          up = new Uploader_LDP_TLS(url.origin + '/', gen.idp);
        }
        else if (gen.idp === 'opl_ldp' || gen.idp === 'opl_ldp_https') {
          up = new Uploader_OPL_LDP(gen.uid, gen.pwd, gen.idp);
        }
        else if (gen.idp === 'aws_s3') {
          var up = new Uploader_AWS_S3(gen.bucket, gen.cert_dir, gen.acc_key, gen.sec_key);
        } 
        else if (gen.idp === 'azure') {
          var up = new Uploader_Azure(gen.cert_dir, gen.account, gen.account_key);
        } 
        else {
          return;
        }

        var rc = await up.createProfileDir(gen.cert_dir);
        if (rc && rc.ok) {
          rc = await up.loadCardFiles();
          if (!rc) {
            alert('Could not load card template files');
            return;
          }
          rc = await up.updateTemplate(certData, webid, up.getDirPath(gen.cert_dir), gen);
          if (!rc) {
            alert('Could not update card templates');
            return;
          }
          rc = await up.uploadCardFiles(gen.cert_dir);
          if (!rc) {
            alert('Could not upload card files');
            return;
          }
          rc = await up.uploadFile(gen.cert_dir, gen.cert_name + '.p12', certData.pkcs12B64, 'application/x-pkcs12');
          if (!rc.ok) {
            alert('Could not upload file ' + gen.cert_name + '.p12');
            return;
          }
          rc = await up.uploadFile(gen.cert_dir, gen.cert_name + '.crt', certData.der, 'application/pkix-cert');
          if (!rc.ok) {
            alert('Could not upload file ' + gen.cert_name + '.crt');
            return;
          }
        } else {
          alert('Could not create dir ' + gen.cert_dir);
          return;
        }
      }

      done_ok = true;
    }
    catch (e) {
      alert(e);
    }
    finally {
      DOM.qHide('#gen-cert-ready-dlg #u_wait');
      if (done_ok) {
        setTimeout(function () {
          DOM.qSel('#gen-cert-ready-dlg #btn-upload_cert').disabled = true;

          DOM.qShow('#gen-cert-ready-dlg #webid-card');
          var v = DOM.qSel('#webid-card #card_href');
          v.href = certData.card;
          v.innerText = certData.card;
          
          alert('Done. Profile Document was uploaded.');
        }, 500);
      }
    }
  },

  fetchDelegate: async function (gen, webid) {
    var done_ok = false;
    DOM.qShow('#gen-cert-ready-dlg #delegate_wait');
    var uri = DOM.qSel('#gen-cert-ready-dlg #delegate_uri').value;
    try {
      var rc = await (new YouID_Loader()).verify_ID_1(uri);
      if (rc) {
        for(var webid in rc) {
          var data = rc[webid];
          if (data.success && data.id.startsWith(uri)) {
            var s;
        
            gen.delegate_uri = data.id;
            var rkeys = data.keys;
        
            if (!rkeys || rkeys.length == 0) {
              alert('Could not get certificate Keys from profile');
              gen.delegate_keys = [];
              return;
            } else {
              gen.delegate_keys = rkeys;
            }

            var k = gen.delegate_keys[0];
            gen.delegate_key_exp = k.exp;
            gen.delegate_key_mod = k.mod;
            gen.delegate_key_label = k.pkey + (k.key_label?' / '+k.key_label : '');

            gen.delegator_webid = webid;

            this.setDelegateText(gen);
            this.setDelegatorText(gen);

            break;
          }
        }
      }
    }
    catch (e) {
      alert(e);
    }
    finally {
      DOM.qHide('#gen-cert-ready-dlg #delegate_wait');
    }
  },

  setDelegateText: function(gen) {
    var s = '';
    if (gen.delegate_uri && gen.delegator_webid) {
        s = '@prefix oplcert: <http://www.openlinksw.com/schemas/cert#> . \n\n';
        // delegate  -> delegator
        s += `INSERT { \n`;
        s += `<${gen.delegate_uri}> \n`;
        s += `            oplcert:onBehalfOf <${gen.delegator_webid}> .\n`;
        s += ` }\n`;
    }

    DOM.qSel('#gen-cert-ready-dlg #delegate-text').value = s;
  },

  setDelegatorText: function(gen) {
    var s = '';
    if (gen.delegator_webid && gen.delegate_uri) {
        s = '@prefix acl: <http://www.w3.org/ns/auth/acl#> . \n' +
          '@prefix xsd: <http://www.w3.org/2001/XMLSchema#> . \n' +
          '@prefix cert: <http://www.w3.org/ns/auth/cert#> . \n\n';

        s += `INSERT { \n`;
        s += `<${gen.delegator_webid}> \n`;
        s += `      acl:delegates <${gen.delegate_uri}> . \n`;

        s += `<${gen.delegate_uri}> \n`;
        s += `   cert:key [ \n`;
        s += `             a cert:RSAPublicKey;\n`;
        s += `             cert:exponent  "${gen.delegate_key_exp}"^^xsd:int;\n`;
        s += `             cert:modulus   "${gen.delegate_key_mod}"^^xsd:hexBinary\n`;
        s += `            ] .\n`;
        s += ` }\n`;
    }

    DOM.qSel('#gen-cert-ready-dlg #delegator-text').value = s;

    var btn = DOM.qSel('#gen-cert-ready-dlg #btn-delegate_cert_key');
    if (gen.delegate_uri)
      btn.childNodes[0].nodeValue = gen.delegate_key_label;
    else
      btn.childNodes[0].nodeValue = 'Certificate Key';
  },



  uploadDelegate: async function (gen, webid, certData) {
    if (!gen.delegate_uri) {
      alert('Delegate profile must be fetched at first');
      return;
    }
    var url = new URL(gen.delegate_uri);

    if (url.protocol === 'http:')
      url.protocol = 'https:';

    url.hash = '';

    var query = DOM.qSel('#gen-cert-ready-dlg #delegate-text').value;
    if (query.length < 1) {
      alert('Delegate query is empty');
      return;
    }
    var _fetch = (gen.idp === 'solid_oidc') ? this.gOidc.fetch : fetch;

    var options = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/sparql-update; charset=utf-8'
      },
      credentials: 'include',
      body: query
    }

    DOM.qSel('#gen-cert-ready-dlg #u_msg').innerText = 'Updating Delegate profile';
    DOM.qShow('#gen-cert-ready-dlg #u_wait');
    try {
      var resp = await _fetch(url.href, options);
      if (!resp.ok) {
        alert('Could not update Delegate profile HTTP=' + resp.status + '  ' + resp.statusText)
      } else {
        alert('Delegate relations were uploaded');
      }
    } catch (e) {
      alert('Could not update Delegate profile ' + e);
      console.log(e);
    } finally {
      DOM.qSel('#gen-cert-ready-dlg #u_msg').innerText = '';
      DOM.qHide('#gen-cert-ready-dlg #u_wait');
    }
  },


  uploadDelegator: async function (gen, webid, certData) {
    var url = new URL(webid);
    url.hash = '';

    var query = DOM.qSel('#gen-cert-ready-dlg #delegator-text').value;
    if (query.length < 1) {
      alert('Delegator query is empty');
      return;
    }
    var _fetch = (gen.idp === 'solid_oidc') ? this.gOidc.fetch : fetch;

    var options = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/sparql-update; charset=utf-8'
      },
      credentials: 'include',
      body: query
    }

    DOM.qSel('#gen-cert-ready-dlg #u_msg').innerText = 'Updating Delegator profile';
    DOM.qShow('#gen-cert-ready-dlg #u_wait');
    try {
      var resp = await _fetch(url.href, options);
      if (!resp.ok) {
        alert('Could not update Delegator profile HTTP=' + resp.status + '  ' + resp.statusText)
      } else {
        alert('Delegator relations were uploaded');
      }
    } catch (e) {
      alert('Could not update Delegator profile ' + e);
      console.log(e);
    } finally {
      DOM.qSel('#gen-cert-ready-dlg #u_msg').innerText = '';
      DOM.qHide('#gen-cert-ready-dlg #u_wait');
    }
  },


  genManualCard: function (webid, certData) {
    var {ttl, jsonld, rdfxml} = genManualUploads(webid, certData);

    var nano_ttl = '## Turtle Start ##\n'+ttl+'\n## Turtle End ##\n';
    var nano_jsonld = '## JSON-LD Start ##\n'+jsonld+'\n## JSON-LD End ##\n';
    var nano_rdfxml = '## RDF-XML Start ##\n'+rdfxml+'\n## RDF-XML End ##\n';

    var i_ttl = '<!-- start rdf-turtle profile 1 -->\n<script type="text/turtle">\n'
                +ttl
                +'\n</script>\n';
    var i_jsonld = '<!-- start json-ld profile 2 -->\n<script type="application/ld+json">\n'
                   +jsonld
                   +'\n</script>\n';
    var i_rdfxml = '<!-- start rdf/xml profile 3 -->\n<script type="application/rdf+xml">\n'
                   +rdfxml
                   +'\n</script>\n';

    return {nano_ttl, nano_jsonld, nano_rdfxml, i_ttl, i_jsonld, i_rdfxml};
  },


  genSolidInsertCert: function (webid, cert) {
    var profileUri = webid.split('#')[0];
    var keyUri = profileUri + '#key-' + cert.validity.notBefore.getTime();
    var CN = cert.subject.getField('CN');
    var commonName = CN.value;
    var exponent = cert.publicKey.e.toString(10);
    var modulus = cert.publicKey.n.toString(16).toLowerCase();
    var timeCreated = cert.validity.notBefore.toISOString();

    var card_text = `
  @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
  @prefix cert: <http://www.w3.org/ns/auth/cert#>.
  @prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
  @prefix terms: <http://purl.org/dc/terms/>.
  @prefix foaf: <http://xmlns.com/foaf/0.1/>.

  INSERT DATA
  {
  <${webid}> cert:key <${keyUri}>.

  <${keyUri}>
    a cert:RSAPublicKey;
    terms:created "${timeCreated}"^^xsd:dateTime;
    terms:title "Created by YouID";
    rdfs:label "${commonName}";
    cert:exponent "${exponent}"^^xsd:int;
    cert:modulus "${modulus}"^^xsd:hexBinary.
  } `;
    return card_text;
  },


  genCert: function (certName, certEmail, certOrg, certOrgUnit, certCity, certState, certCountry, webId, pwd) {
    function addDays(date, days) {
      var result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    }


    var pki = forge.pki;

    // generate a keypair and create an X.509v3 certificate
    var keys = pki.rsa.generateKeyPair(2048);
    var cert = pki.createCertificate();
    cert.publicKey = keys.publicKey;
    // NOTE: serialNumber is the hex encoded value of an ASN.1 INTEGER.
    // Conforming CAs should ensure serialNumber is:
    // - no more than 20 octets
    // - non-negative (prefix a '00' if your value starts with a '1' bit)
    cert.serialNumber = (Date.now()).toString(16);

    cert.validity.notBefore = new Date();
    cert.validity.notAfter = addDays(new Date(), 60);
    //   cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1)

    var attrs = [];
    if (certName && certName.length > 1) {
      attrs.push({ name: 'commonName', value: certName });
    }

    if (certCountry && certCountry.length > 1) {
      attrs.push({ name: 'countryName', value: certCountry });
    }

    if (certState && certState.length > 1) {
      attrs.push({ shortName: 'ST', value: certState });
    }
    if (certCity && certCity.length > 1) {
      attrs.push({ name: 'localityName', value: certCity });
    }
    if (certOrgUnit && certOrgUnit.length > 1) {
      attrs.push({ name: 'organizationalUnitName', value: certOrgUnit });
    }

    if (certOrg && certOrg.length > 1) {
      attrs.push({ name: 'organizationName', value: certOrg });
    } else {
      attrs.push({ name: 'organizationName', value: 'WebID' });
    }
    if (certEmail && certEmail.length > 1) {
      attrs.push({ name: 'emailAddress', value: certEmail });
    }

    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.setExtensions([
      { name: 'basicConstraints', cA: true, critical: true },
      { name: 'keyUsage', digitalSignature: true },
      { name: 'extKeyUsage', clientAuth: true },
      { name: 'nsCertType', client: true },
      {
        name: 'subjectAltName',
        altNames: [{
          type: 6, // URI
          value: webId
        }]
      },
      { name: 'subjectKeyIdentifier' }
    ])

    cert.sign(keys.privateKey, forge.md.sha512.create());

    var pemCert = pki.certificateToPem(cert);
    var derCert = forge.asn1.toDer(pki.certificateToAsn1(cert)).getBytes();

    var key_name = (certName && certName.length>0)?certName:"";
    var p12Asn1 = forge.pkcs12.toPkcs12Asn1(keys.privateKey, [cert], pwd,
      {
        generateLocalKeyId: true,
        friendlyName: key_name+'-key',
        algorithm: '3des'
      });

    var p12Der = forge.asn1.toDer(p12Asn1).getBytes();
    var p12B64 = forge.util.encode64(p12Der);

    var md = forge.md.sha1.create();
    md.start();
    md.update(derCert);
    var digest = md.digest();
    var digest_b64 = forge.util.encode64(digest.data);

    return { der: derCert, pem: pemCert, pkcs12B64: p12B64, pkcs12: p12Der, cert, fingerprint_b64: digest_b64};
  },


}


