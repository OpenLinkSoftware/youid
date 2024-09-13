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
class Relations {
  constructor() {
    DOM.qSel('#rel_add').onclick = (e) => {
      e.preventDefault();
      this.addItem();
    }
  }

  createRow()
  {
    const sel = '<select class="form-control" id="c_rel_type">'
               +' <option value="none">--</option>'
               +' <option value="ca">Cal.com</option>'
               +' <option value="cr">Carrd</option>'
               +' <option value="di">Disha</option>'
               +' <option value="fb">Facebook</option>'
               +' <option value="gh">Github</option>'
               +' <option value="gl">Glitch</option>'
               +' <option value="id">ID.MyOpenLink.NET</option>'
               +' <option value="in">Instagram</option>'
               +' <option value="li">LinkedIn</option>'
               +' <option value="lt">Linktree</option>'
               +' <option value="ma">Mastodon</option>'
               +' <option value="ti">TikTok</option>'
               +' <option value="tw">Twitter</option>'
               +'</select>';

    return  '<tr>'
           +'<td> <button id="rel_del"> <input type="image" src="lib/css/img/minus.png" width="12" height="12"> </button> </td>' 
           +'<td>'+sel+'</td>'
           +'<td><input id="rel_v" type="text" class="form-control" id="c_rel" value=""></td>'
           +'</tr>';
  }

  addItem()
  {
    const tbody = DOM.qSel('#tbl_rels tbody');
    const r = tbody.insertRow(-1);
    r.innerHTML = this.createRow();
    r.querySelector('#c_rel_type').onchange = (e) => {
      e.preventDefault();
      const row = e.target.closest('tr');
      var sel = row.querySelector('#c_rel_type option:checked').value;
      var url = '';
      switch (sel) {
        case 'ca': url = 'https://cal.com/{username}'; break;
        case 'cr': url = 'https://{username}.carrd.co/'; break;
        case 'di': url = 'https://{username}.disha.page'; break;
        case 'fb': url = 'https://facebook.com/'; break;
        case 'gh': url = 'https://github.com/'; break;
        case 'gl': url = 'https://glitch.com/~{username}'; break;
        case 'id': url = 'https://id.myopenlink.net/DAV/home/'; break;
        case 'in': url = 'https://www.instagram.com/'; break;
        case 'li': url = 'https://linkedin.com/in/'; break;
        case 'lt': url = 'https://linktr.ee/'; break;
        case 'ma': url = 'https://mastodon.social/'; break;
        case 'ti': url = 'https://www.tiktok.com/@'; break;
        case 'tw': url = 'https://twitter.com/'; break;
        default:
          break;
      }
      if (url)
        row.querySelector('#rel_v').value = url;
    }
    r.querySelector('#rel_del').onclick = (e) => {
      e.preventDefault();
      const row = e.target.closest('tr');
      row.remove();
    }
  }

  emptyList()
  {
    const tbody = DOM.qSel('#tbl_rels tbody');
    tbody.innerHTML = '';
    this.addItem();
  }

  getList()
  {
    var list = [];
    const tbody = DOM.qSel('#tbl_rels tbody');
    const rows = tbody.querySelectorAll('tr');
    for(const el of rows) {
      var v = el.querySelector('#rel_v').value;
      var type = el.querySelector('#c_rel_type option:checked').value;
      if (v)
        list.push({v,type});
    }
    return list;
  }
}


class Certificate {
  constructor() 
  {
    this.gPref = new Settings();
    this.gOidc = new OidcWeb();
    this.pdp = null;
    this.relations = new Relations();
    this.relations.emptyList();
  }

  reset_gen_cert() 
  {
    var dt = new Date();
    this.YMD = dt.toISOString().substring(0, 10).replace(/-/g, '');
    this.HMS = dt.toISOString().substring(11, 19).replace(/:/g, '');

    var idp = DOM.qSel('#gen-cert-dlg #c_idp').value;

    if (idp === 'azure' || idp === 'aws_s3' || idp === 'ldp_tls' || idp === 'ldp_tls_solid')
      DOM.qSel('#gen-cert-dlg #c_cert_path').value = 'IDcard_' + this.YMD + '_' + this.HMS;
    else
      DOM.qSel('#gen-cert-dlg #c_cert_path').value = 'YouID/IDcard_' + this.YMD + '_' + this.HMS;
    
    DOM.qSel('#gen-cert-dlg #c_cert_name').value = 'cert_' + this.YMD + '_' + this.HMS;
    this.gen_webid(DOM.qSel('#c_idp option:checked').value);
  }

  initCountries() 
  {
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
  }

  gen_webid(idp) 
  {
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
  } 


  async click_gen_cert(cur_webid) 
  {
    var self = this;

    if (cur_webid) {
      DOM.iSel('c_profile').value = cur_webid;
    }

    self.reset_gen_cert();
    self.initCountries();

    if (DOM.qSel('#c_idp option:checked').value === 'solid_oidc') {
      this.oidc_changed();
    }

    if (Browser.is_safari) {
      function downloadFile(e) 
      {
        e.preventDefault();

        var el = e.target;
        if (el.href && el.download) {
          var popup = window.open();
          var link = document.createElement('a');
          link.setAttribute('href', el.href);
          link.setAttribute('download', el.download);
          popup.document.body.appendChild(link);
          link.click();
        }
      }

      DOM.iSel('idcard-download').onclick = (e) => { downloadFile(e); }
      DOM.iSel('pkcs12-download').onclick = (e) => { downloadFile(e); }
      DOM.iSel('ca-pkcs12-download').onclick = (e) => { downloadFile(e);}
      DOM.iSel('ca-pem-download').onclick = (e) => { downloadFile(e); }
    }


    DOM.qSel('#gen-cert-dlg #c_profile')
      .onchange = (e) => {
        var idp = DOM.qSel('#c_idp option:checked').value;
        if (idp === 'manual') {
          try {
            var url = new URL(DOM.qSel('#gen-cert-dlg #c_profile').value);
            url.hash = '#netid';
            DOM.qSel('#c_webid').value = url.toString();
          } catch(e) {}
        }
      }

    DOM.qSel('#gen-cert-dlg #c_pdp')
      .onchange = (e) => {
        var sel = DOM.qSel('#c_pdp option:checked').value;
        DOM.qHide('#gen-cert-dlg #r_pdp-webid');
        DOM.qHide('#gen-cert-dlg #btn-fetch-pdp');
        DOM.qHide('#gen-cert-dlg #r_pdp-btc');
        DOM.qHide('#gen-cert-dlg #r_pdp-eth');
        DOM.qShow('#gen-cert-dlg #r_webid'); 
        DOM.qShow('#gen-cert-dlg #r_idp'); 

        switch(sel)
        {
          case 'pdp_btc':  
              DOM.qShow('#gen-cert-dlg #r_pdp-btc'); 
              DOM.iSel('c_name').value = 'BTC Wallet Proxy'; 
              DOM.qHide('#gen-cert-dlg #r_webid'); 
              DOM.qHide('#gen-cert-dlg #r_idp'); 
              DOM.qSel('#gen-cert-dlg #c_idp #manual').selected = true;
              DOM.qSel('#gen-cert-dlg #c_idp').onchange();
              break;
          case 'pdp_eth':  
              DOM.qShow('#gen-cert-dlg #r_pdp-eth'); 
              DOM.iSel('c_name').value = 'ETH Wallet Proxy'; 
              DOM.qHide('#gen-cert-dlg #r_webid'); 
              DOM.qHide('#gen-cert-dlg #r_idp'); 
              DOM.qSel('#gen-cert-dlg #c_idp #manual').selected = true;
              DOM.qSel('#gen-cert-dlg #c_idp').onchange();
              break;
          case 'pdp_webid': 
              DOM.qShow('#gen-cert-dlg #r_pdp-webid'); 
              break;
          default:  
              DOM.qShow('#gen-cert-dlg #btn-fetch-pdp'); 
              break;
        }
      };

    
    DOM.qSel('#gen-cert-dlg #btn-fetch-pdp')
      .onclick = async (e) => {
        e.preventDefault();
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
      .onclick = async (e) => {
        e.preventDefault();
        var uri = DOM.iSel('c_profile').value.trim();
        if (uri.length == 0)
          return;

        var url = new URL(uri);
        url.hash = '';
        url = url.toString();
        var rc, rc0;

        try {
          DOM.qShow('#gen-cert-dlg #fetch_wait');
          var loader = new YouID_Loader();
          var ret = await loader.verify_ID(uri, this.gOidc);
              
          for(var val of ret) {
            if (val.success && !rc0)
              rc0 = val;
            if (val.success && val.id.startsWith(url)) {
              rc = val;
              break;
            }
          }

          DOM.qHide('#gen-cert-dlg #fetch_wait');

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
        this.gen_webid(DOM.qSel('#c_idp option:checked').value);
      };

    DOM.qSel('#gen-cert-dlg #c_idp')
      .onchange = (e) => {
        var gen = {};
        var sel = DOM.qSel('#c_idp option:checked').value;
        var sel_pdp = DOM.qSel('#c_pdp option:checked').value;

        DOM.qSel('#gen-cert-dlg #r_webid input').readOnly = false;
        DOM.qHide('#gen-cert-dlg #c_webdav');
        DOM.qHide('#gen-cert-dlg #c_solid_oidc');
        DOM.qHide('#gen-cert-dlg #r_cert_path');
        DOM.qHide('#gen-cert-dlg #c_aws_s3');
        DOM.qHide('#gen-cert-dlg #c_azure');
        DOM.qSel('#gen-cert-dlg #c_webid').value = '';

        if (sel_pdp === 'pdp_btc' || sel_pdp === 'pdp_eth')
          return;

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
      .onclick = async (e) => {
        e.preventDefault();
        if (this.gOidc.getWebId()) {
          await this.gOidc.logout();
          self.oidc_changed(true);
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


    DOM.qSel('#gen-cert-dlg #btn-gen-cert')
      .onclick = async (e) => {
        e.preventDefault();
        var gen = {};
        gen.issued = DOM.qSel('#c_issued option:checked').value;
        gen.idp = DOM.qSel('#c_idp option:checked').value;
        gen.pdp = DOM.qSel('#c_pdp option:checked').value;

        if (gen.pdp === 'pdp_btc') {
          gen.btc = {};
          gen.btc.pkey = DOM.qSel('#gen-cert-dlg #c_btc_pkey').value;
          var v = gen.btc.pkey.toLowerCase();

          if (v.startsWith('p2wpkh:'))
            gen.btc.pkey = gen.btc.pkey.substring(7);
          else if (v.startsWith('p2pkh:'))
            gen.btc.pkey = gen.btc.pkey.substring(6);

          if (gen.btc.pkey.length < 1) {
            alert('Bitcoin Private Key is empty');
            return;
          }
        } 
        else if (gen.pdp === 'pdp_eth') {
          gen.eth = {};
          gen.eth.pkey = DOM.qSel('#gen-cert-dlg #c_eth_pkey').value;

          if (gen.eth.pkey.startsWith('0x') || gen.eth.pkey.startsWith('0X'))
            gen.eth.pkey = gen.eth.pkey.substring(2);

          if (gen.eth.pkey.length < 1) {
            alert('Ethereum Private Key is empty');
            return;
          }
        }

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
  }


  async oidc_changed(logout) 
  {
    try {
      if (!logout)
        await this.gOidc.restoreConn();

      const webid = this.gOidc.getWebId();
      const webid_href = DOM.iSel('webid_href');

      if (webid) {
        webid_href.href = webid;
        webid_href.title = webid;
        webid_href.classList.remove('hidden');

        DOM.qSel('#gen-cert-dlg #c_webid').value = webid;

        var url = new URL(webid);
        url.hash = '';
        var cert_path = url.pathname.substring(1);
        var i = cert_path.lastIndexOf('/');
        if (i != -1)
          cert_path = cert_path.substring(0, i);
        DOM.qSel('#gen-cert-dlg #c_cert_path').value = cert_path;

        try {
          var youid = new YouID_Loader();
          var rc = await youid.verify_ID(webid, this.gOidc);
          if (rc) {
            for(var v_webid in rc) {
              var data = rc[v_webid];
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
        DOM.qSel('#gen-cert-dlg #c_webid').value = '';
      }

      var oidc_login_btn = DOM.qSel('#gen-cert-dlg #btn-solid-oidc-login');
      oidc_login_btn.innerText = webid ? 'Logout' : 'Login';

    } catch (e) {
      console.log(e);
    }
  }


  genCertificate(gen) 
  {
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
      alert('Wrong repeat password');
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

    if (gen.pdp === 'pdp_btc') {
       try {
         var rc = Coin.btc_gen_x509_wif_san_from_pkey(gen.btc.pkey);
         gen.btc.pub = rc.pub;
         gen.btc.pub_hex = rc.pub_hex;
         gen.btc.san = rc.san;
       } catch (e) {
         alert(e);
         return;
       }
    } 
    else if (gen.pdp === 'pdp_eth') {
       try {
         var rc = Coin.eth_gen_x509_san_from_pkey(gen.eth.pkey);
         gen.eth.pub = rc.pub;
         gen.eth.pub_hex = rc.pub_hex;
         gen.eth.san = rc.san;
       } catch (e) {
         alert(e);
         return;
       }
    }
    else if (webid.length < 1) {
      alert('WebId is empty');
      return
    }

    gen.relList = this.relations.getList();

    DOM.qSel('#gen-cert-dlg #c_pwd').value = '';
    DOM.qSel('#gen-cert-dlg #c_pwd1').value = '';
    DOM.qShow('#gen-cert-ready-dlg #c_wait');
    DOM.qHide('#gen-cert-ready-dlg #manual-idcard');
    DOM.qSel('#gen-cert-ready-dlg #idcard-download').removeAttribute('href');
    DOM.qHide('#gen-cert-ready-dlg #public-cred');
    DOM.qHide('#gen-cert-ready-dlg #p12-cert');
    DOM.qSel('#gen-cert-ready-dlg #pkcs12-download').removeAttribute('href');

    DOM.qHide('#gen-cert-ready-dlg #ca-cert');
    DOM.qHide('#gen-cert-ready-dlg #ca-pkcs12-download')
    DOM.qSel('#gen-cert-ready-dlg #ca-pkcs12-download').removeAttribute('href');
    DOM.qHide('#gen-cert-ready-dlg #ca-pem-download')
    DOM.qSel('#gen-cert-ready-dlg #ca-pem-download').removeAttribute('href');

    DOM.qHide('#gen-cert-ready-dlg #u_wait');
    DOM.qHide('#gen-cert-ready-dlg #webid-cert');
    DOM.qHide('#gen-cert-ready-dlg #webid-card');
    DOM.qHide('#gen-cert-ready-dlg #profile-card');
    DOM.qHide('#gen-cert-ready-dlg #r-reg_delegate')
    DOM.qHide('#gen-cert-ready-dlg #r-message')
    DOM.qSel('#gen-cert-ready-dlg #delegate-text').value = '';
    DOM.qSel('#gen-cert-ready-dlg #delegator-sparql #text-sparql').value = '';
    DOM.qSel('#gen-cert-ready-dlg #delegator-i_ttl #text-i-ttl').value = '';
    DOM.qSel('#gen-cert-ready-dlg #delegator-i_jsonld #text-i-jsonld').value = '';
    DOM.qSel('#gen-cert-ready-dlg #delegate_uri').value = '';
    DOM.qSel('#gen-cert-ready-dlg #reg_delegate').checked = false;
    DOM.qHide('#gen-cert-ready-dlg #webid-card-upload');
    DOM.qSel('#gen-cert-ready-dlg #btn-upload_card').disabled = false;

    gen.delegate_uri = null;
    this.setDelegateText(gen, '#gen-cert-ready-dlg');
    this.setDelegatorText(gen, '#gen-cert-ready-dlg');

    DOM.qHide('#gen-cert-ready-dlg #delegate-create');

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

    setTimeout(async function () {
      var certData = {};
      if (gen.issued === "local_ca") {
        var csr = self.genCSR(name, email, certOrg, certOrgUnit, certCity, certState, certCountry, webid, gen);
        var rc = await self.uploadCSR(csr.pem);
        DOM.qHide('#gen-cert-ready-dlg #c_wait');

        if (rc.retcode !== '0') {
          alert('Error: '+rc.error);
          return;
        }

        certData = self.genCertInfo(decodeURIComponent(rc.data), null, csr.privateKey, name, certPwd)
        certData.ca_pem = decodeURIComponent(rc.ca_data)
        certData.ca_pemB64 = forge.util.encode64(certData.ca_pem);
        certData.ca_fname = 'OpenLinkLocalCA.pem'

      } 
      else { // Self-Signed
        if (email && email.length > 0) {
          var ca = self.genCACert(name, email, certOrg, certOrgUnit, certCity, certState, certCountry, webid, gen);
          var caData = self.genCertInfo(null, ca.cert, ca.privateKey, name+'_CA', certPwd);

          var rc = self.genCert(name, email, certOrg, certOrgUnit, certCity, certState, certCountry, webid, gen, ca.privateKey, ca.cert);
          certData = self.genCertInfo(null, rc.cert, rc.privateKey, name, certPwd)

          certData.ca_pem = caData.pem;
          certData.ca_pemB64 = forge.util.encode64(certData.ca_pem);
          certData.ca_fname = gen.cert_name+'_CA.pem';
          certData.caSS_p12B64 = caData.pkcs12B64;
          certData.caSS_p12 = caData.pkcs12;
          certData.caSS_p12_fname = gen.cert_name+'_CA.p12';
        } else {
          var rc = self.genCert(name, email, certOrg, certOrgUnit, certCity, certState, certCountry, webid, gen);
          certData = self.genCertInfo(null, rc.cert, rc.privateKey, name, certPwd)
        }
        DOM.qHide('#gen-cert-ready-dlg #c_wait');
      }


      if (gen.idp !== 'manual') {
        //Update card
        DOM.qShow('#gen-cert-ready-dlg #u_wait');
        DOM.qSel('#gen-cert-ready-dlg #title').innerText = 'Creating your identity card...';
        var rc = await self.uploadCert(gen, webid, certData);
        if (rc == -1) {
          DOM.qShow('#gen-cert-ready-dlg #webid-card-upload');
          DOM.qSel('#gen-cert-ready-dlg #btn-upload_card')
            .onclick = async (e) => {
              e.preventDefault();
              DOM.qShow('#gen-cert-ready-dlg #u_wait');
              await self.uploadCert(gen, webid, certData);
            };
        }
      } else {
        // Manual
        DOM.qShow('#gen-cert-ready-dlg #manual-idcard');
        DOM.qShow('#gen-cert-ready-dlg #u_wait');s
        DOM.qSel('#gen-cert-ready-dlg #title').innerText = 'Creating your identity card...';
        var rc = await self.zipIdCard(gen, webid, certData);
        if (rc == -1) {
           alert("Error in create ZIP");
        }
      }
      
      var p12Url = 'data:application/x-pkcs12;base64,' + certData.pkcs12B64;
      DOM.qSel('#gen-cert-ready-dlg #pkcs12-download').setAttribute('href', p12Url);
      DOM.qSel('#gen-cert-ready-dlg #pkcs12-download').setAttribute('download', gen.cert_name+'.p12');
      DOM.qShow('#gen-cert-ready-dlg #p12-cert');
      DOM.qShow('#gen-cert-ready-dlg #r-message');
      DOM.qShow('#gen-cert-ready-dlg #webid-cert');
      DOM.qShow('#gen-cert-ready-dlg #public-cred');

      if (certData.caSS_p12B64) {
        var ca_p12Url = 'data:application/x-pkcs12;base64,' + certData.caSS_p12B64;
        DOM.qSel('#gen-cert-ready-dlg #ca-pkcs12-download').setAttribute('href', ca_p12Url);
        DOM.qSel('#gen-cert-ready-dlg #ca-pkcs12-download').setAttribute('download', certData.caSS_p12_fname);
        DOM.qShow('#gen-cert-ready-dlg #ca-pkcs12-download');
        DOM.qShow('#gen-cert-ready-dlg #ca-cert');
      }
      if (certData.ca_pemB64) {
        var ca_pemUrl = 'data:application/x-pem-file;base64,' + certData.ca_pemB64;
        DOM.qSel('#gen-cert-ready-dlg #ca-pem-download').setAttribute('href', ca_pemUrl);
        DOM.qSel('#gen-cert-ready-dlg #ca-pem-download').setAttribute('download', certData.ca_fname);
        DOM.qShow('#gen-cert-ready-dlg #ca-pem-download');
        DOM.qShow('#gen-cert-ready-dlg #ca-cert');
      }

      if (gen.pdp === 'pdp_btc' || gen.pdp === 'pdp_eth') {
        DOM.qHide('#gen-cert-ready-dlg #r-reg_delegate');
        DOM.qHide('#gen-cert-ready-dlg #webid-cert');
        DOM.qHide('#gen-cert-ready-dlg #r-message');
      }
      else {
        DOM.qShow('#gen-cert-ready-dlg #r-reg_delegate');
      }


      DOM.qSel('#gen-cert-ready-dlg #title').innerText = 'Credentials';

      var v = DOM.qSel('#webid-cert #webid_href');
      v.href = webid;
      v.innerText = webid;

      DOM.qSel('#gen-cert-ready-dlg #webid_uri').value = webid;

      if (gen.idp === 'manual') {
        DOM.qShow('#gen-cert-ready-dlg #profile-card');
      }

      DOM.qShow('#gen-cert-ready-dlg #profile-card');

      if (gen.pdp !== 'pdp_btc' && gen.pdp !== 'pdp_eth') {
        var s = await self.genManualCard(webid, certData, gen);
        DOM.qShowAll('#profile-card li');
        $('#profile-card #tab_n_ttl a').tab('show');
        DOM.qSel('#profile-card #text-n-ttl').value = s.nano_ttl;
        DOM.qSel('#profile-card #text-n-jsonld').value = s.nano_jsonld;
        DOM.qSel('#profile-card #text-n-rdfxml').value = s.nano_rdfxml;
        DOM.qSel('#profile-card #text-i-ttl').value = s.i_ttl;
        DOM.qSel('#profile-card #text-i-jsonld').value = s.i_jsonld;
        DOM.qSel('#profile-card #text-i-rdfxml').value = s.i_rdfxml;
        DOM.qSel('#profile-card #text-i-ni').value = certData.fingerprint_ni_tab;
        DOM.qSel('#profile-card #text-i-di').value = certData.fingerprint_di_tab;
        DOM.qSel('#profile-card #text-i-fp').value = certData.fingerprint_tab;

        self.prepare_delegate('#gen-cert-ready-dlg', webid, {idp: gen.idp});

        DOM.qSel('#gen-cert-ready-dlg #btn-message')
          .onclick = async (e) => {
            e.preventDefault();
            var sel = DOM.qSel('#c_announce option:checked').value;
            var fmt = await self.gPref.getValue('ext.youid.pref.ann_message');
            var msg = fmt.replace(/{webid}/g, webid).replace(/{ni-scheme-uri}/g, certData.fingerprint_ni);
                                          
            if (sel === 'pdp_twitter') 
            {
              twitterAuth.authorize(function() {
                twitterAuth.sendMessage(msg, function(data, error) { 
                  if (error)
                    alert('Error: '+error);
                  else
                    alert('Message was sent');
                });
              });
            }
            else if (sel === 'pdp_linkedin') 
            {
              linkedinAuth.authorize(function() {
                linkedinAuth.sendMessage(msg, function(data, error) { 
                  if (error)
                    alert('Error: '+error);
                  else
                    alert('Message was sent');
                });
              });
            }
        }

      } else {
        DOM.qSel('#profile-card #text-i-ni').value = certData.fingerprint_ni_tab;
        DOM.qSel('#profile-card #text-i-di').value = certData.fingerprint_di_tab;
        DOM.qSel('#profile-card #text-i-fp').value = certData.fingerprint_tab;
        DOM.qHideAll('#profile-card li');
        DOM.qShow('#profile-card #tab_i_fp');
        DOM.qShow('#profile-card #tab_i_di');
        DOM.qShow('#profile-card #tab_i_ni');
        $('#profile-card #tab_i_fp a').tab('show');
      }

    }, 500);

    return false;
  }


  prepare_delegate(parent, webid, context)   // {idp:'solid_oidc'}
  {
    var self = this;

    const fld_delegate = DOM.qSel(`${parent} #delegate_uri`);
    const btn_fetch = DOM.qSel(`${parent} #btn-delegate_uri`);
    const btn_update = DOM.qSel(`${parent} #btn-update_delegate`);

    btn_fetch.disabled = btn_update.disabled = false;

    function delegate_uri_updated()
    {
        if (fld_delegate.value.startsWith('bitcoin') || fld_delegate.value.startsWith('ethereum'))
          btn_fetch.disabled = btn_update.disabled = true;
        else
          btn_fetch.disabled = btn_update.disabled = false;
    }

    DOM.qSel(`${parent} #delegate_uri`).onkeypress = delegate_uri_updated;
    DOM.qSel(`${parent} #delegate_uri`).onchange = delegate_uri_updated;
    DOM.qSel(`${parent} #delegate_uri`).onfocusout = delegate_uri_updated;

    DOM.qSel(`${parent} #btn-delegate_uri`)
      .onclick = async (e) => {
        e.preventDefault();
        webid = DOM.qSel(`${parent} #webid_uri`).value;
        if (!webid) {
          alert('Set Delegator NetID value at first.');
          return;
        }

        if (fld_delegate.value.startsWith('bitcoin:') || fld_delegate.value.startsWith('ethereum:'))
          Msg.showInfo('Use "Import NetID" for coind based certificate')
        else
          await self.fetchDelegate(context, webid, parent);
      };

    DOM.qSel(`${parent} #btn-delegate_import`)
      .onclick = async (e) => {
        e.preventDefault();
        webid = DOM.qSel(`${parent} #webid_uri`).value;
        if (!webid) {
          alert('Set Delegator NetID value at first.');
          return;
        }

        self.import_delegate_cert(context, webid, parent)
      };

    DOM.qSel(`${parent} #btn-delegate_cert_key`)
      .onclick = async (e) => {
        e.preventDefault();
        if (!context.delegate_keys || context.delegate_keys.length == 0) {
           alert('Fetch Delegate profile at first.');
           return; 
        }
        self.showCertKeys(context, parent);
      };

    DOM.qSel(`${parent} #btn-update_delegate`)
      .onclick = async (e) => {
        e.preventDefault();
        webid = DOM.qSel(`${parent} #webid_uri`).value;
        if (!webid) {
          alert('Set WebID value at first.');
          return;
        }
        await self.uploadDelegate(context, webid, parent);
      };

    DOM.qSel(`${parent} #btn-update_delegator`)
      .onclick = async (e) => {
        e.preventDefault();
        webid = DOM.qSel(`${parent} #webid_uri`).value;
        if (!webid) {
          alert('Set WebID value at first.');
          return;
        }
        await self.uploadDelegator(context, webid, parent);
      };
  }

  showTab_delegate(parent)  // {idp:'solid_oidc'}
  {
    var context = {idp: 'soild_oidc'};
    var webid = '';

    this.setDelegateText(context, parent);
    this.setDelegatorText(context, parent);

    this.prepare_delegate(parent, webid, context);
  }


  import_delegate_cert(context, webid, parent) 
  {
    var self = this;

    DOM.qSel('#import-delegate-dlg #file_data').value = null;

    DOM.qSel('#import-delegate-dlg #file_data').onchange = (e) => {
      if (e.target.files.length > 0) {
        const file = e.target.files[0];
        const ftype = file.type; 
        //p12  application/x-pkcs12
        //pem  application/x-x509-ca-cert
        //der  application/pkix-cert'

        if (ftype === 'application/x-pkcs12')
          DOM.qShow('#import-delegate-dlg #cert-pwd');
        else
          DOM.qHide('#import-delegate-dlg #cert-pwd');
      }
    };

    var btnOk = DOM.qSel('#import-delegate-dlg #btn-ok');
    btnOk.onclick = async (e) =>
       {
         e.preventDefault();
         const val = DOM.qSel('#import-delegate-dlg #file_data');

         if (val.files.length > 0) {
           const cert_file = val.files[0];

           try {
             var data = await loadBinaryFile(cert_file);

             if (cert_file.type === 'application/x-pkcs12') {
               //PKCS12
               var bdata = forge.asn1.fromDer(data);
               var pwd = DOM.qSel('#import-delegate-dlg #file_pwd').value;
               var pkcs = forge.pkcs12.pkcs12FromAsn1(bdata, true, pwd);
               var bags = pkcs.getBags({bagType: forge.pki.oids.certBag});
               var bag = bags[forge.pki.oids.certBag][0];
               self.loadDelegateCert(context, webid, parent, bag.cert);

             } 
             else if (cert_file.type === 'application/x-x509-ca-cert') {
                //PEM
               var cert = forge.pki.certificateFromPem(data);
               self.loadDelegateCert(context, webid, parent, cert);
             }
             else if (cert_file.type === 'application/pkix-cert') {
               //DER
               var bdata = forge.asn1.fromDer(data);
               var cert = forge.pki.certificateFromAsn1(bdata, true);
               self.loadDelegateCert(context, webid, parent, cert);
             }
             else {
               alert('Unsupported file type');
               return;
             }

             const btn_fetch = DOM.qSel(`${parent} #btn-delegate_uri`);
             const btn_update = DOM.qSel(`${parent} #btn-update_delegate`);

             btn_fetch.disabled = btn_update.disabled = true;

           } catch(e) {
             console.log(e);
             alert(e);
           }
         }
       };

    var dlg = $('#import-delegate-dlg .modal-content');
    dlg.width(620);
    $('#import-delegate-dlg').modal('show');

  }


  showCertKeys(gen, parent) 
  {
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
            ev.preventDefault();
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
            ev.preventDefault();
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
     DOM.qSel('#cert-key-dlg #btn-ok').onclick = (e) => {
        e.preventDefault();
        
        var lst = tbody.querySelectorAll('#chk');
        for (var i=0; i < lst.length; i++) {
          if (lst[i].checked) {
            var k = keys[i];
            gen.delegate_key_exp = k.exp;
            gen.delegate_key_mod = k.mod;
            gen.delegate_fp_uri = k.fp_uri;
            gen.delegate_pubkey_uri = k.pubkey_uri;
            gen.delegate_key_label = k.pkey + (k.key_label?' / '+k.key_label : '');

            this.setDelegateText(gen, parent);
            this.setDelegatorText(gen, parent);
            $('#cert-key-dlg').modal('hide');
            break;
          }
        }
       };

  }


  async uploadCSR(pem) 
  {
    var rc;
    var url = "http://id.myopenlink.net/YouidSave/idhCsr"

    var options = {
      method: 'POST',
      body: new URLSearchParams({
        'csr': pem,
        'cip': 'sha256' // "sha512"
      })
    }

    try {
      var resp = await fetch(url, options);
      if (resp.ok) {
        var rc = await resp.json();  // recode  error  data  ca_data
        return rc;
      }
      return { ok: resp.ok, code: resp.status, err: resp.statusText };
    } catch (e) {
      return {retcode:'0', error: ''+e};
    }
  }

  
  async zipIdCard(gen, webid, certData) 
  {
    var done_ok = false;
    try {
      const up = new Uploader_Manual(webid);

      var rc = await up.loadCardFiles();
      if (!rc) {
        alert('Could not load card template files');
        return -1;
      }
      rc = await up.updateTemplate(certData, webid, '.', gen);
      if (!rc) {
        alert('Could not update card templates');
        return -1;
      }
      rc = await up.uploadCardFiles(gen.cert_dir);
      if (!rc) {
        alert('Could not upload card files');
        return -1;
      }

      var p12data = forge.util.binary.base64.decode(certData.pkcs12B64)
      rc = await up.uploadFile(gen.cert_dir, gen.cert_name + '.p12', p12data, 'application/x-pkcs12');
      if (!rc.ok) {
        alert('Could not upload file ' + gen.cert_name + '.p12');
        return -1;
      }
      var der = forge.util.binary.raw.decode(certData.der)
      rc = await up.uploadFile(gen.cert_dir, gen.cert_name + '.crt', der, 'application/pkix-cert');
      if (!rc.ok) {
        alert('Could not upload file ' + gen.cert_name + '.crt');
        return -1;
      }

      if (certData.ca_pem && certData.ca_fname) {
        rc = await up.uploadFile(gen.cert_dir, certData.ca_fname, certData.ca_pem, 'application/x-pem-file');
        if (!rc.ok) 
          return {rc:0, error:'Could not upload file ' + certData.ca_fname};
      }

      if (certData.caSS_p12B64 && certData.caSS_p12_fname) {
        var ca_p12data = forge.util.binary.base64.decode(certData.caSS_p12B64)
        rc = await up.uploadFile(gen.cert_dir,  certData.caSS_p12_fname, ca_p12data, 'application/x-pkcs12');
        if (!rc.ok) {
          alert('Could not upload file ' + certData.caSS_p12_fname);
          return -1;
        }
      }

      done_ok = true;
      const zip_href = await up.genZIP_base64_href();
      DOM.qSel('#gen-cert-ready-dlg #idcard-download').setAttribute('href', zip_href);
    }
    catch (e) {
      alert(e);
    }
    finally {
      DOM.qHide('#gen-cert-ready-dlg #u_wait');
      if (!done_ok) {
        alert('Error. Could not create your identity card, try again.');
      }
      return done_ok ? 0 : -1;
    }
  }


  async uploadCert(gen, webid, certData) 
  {
    var done_ok = false;
    try {
      var up = null;
      if (gen.idp === 'solid_oidc') {
        var url = new URL(webid);
        up = new Uploader_Solid_OIDC(this.gOidc, url.origin + '/');
        let dir = new URL(webid);
        dir.hash = '';
        let pos = dir.pathname.lastIndexOf('/');
        if (pos!=-1)
          dir.pathname = dir.pathname.substring(0, pos);
        dir = dir.href;

        let rc = await up.loadCardFiles();
        if (!rc) {
          alert('Could not load card template files');
          return -1;
        }
        rc = await up.updateTemplate(certData, webid, dir, gen);
        if (!rc) {
          alert('Could not update card templates');
          return -1;
        }

        var query = this.genSolidInsertCert(webid, certData.cert);
        rc = await up.updateProfileCard(webid, query);
        if (!rc.ok) {
          alert('Could not update profile card');
          return -1;
        }

        var p12data = forge.util.binary.base64.decode(certData.pkcs12B64)
        rc = await up.uploadFile(gen.cert_dir, gen.cert_name + '.p12', p12data, 'application/x-pkcs12');
        if (!rc.ok) {
          alert('Could not upload file ' + gen.cert_name + '.p12');
          return -1;
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
          done_ok = true;
          return 0;
        }

        var rc = await up.createProfileDir(gen.cert_dir);
        if (rc && rc.ok) {
          rc = await up.loadCardFiles();
          if (!rc) {
            alert('Could not load card template files');
            return -1;
          }
          rc = await up.updateTemplate(certData, webid, up.getDirPath(gen.cert_dir), gen);
          if (!rc) {
            alert('Could not update card templates');
            return -1;
          }
          rc = await up.uploadCardFiles(gen.cert_dir);
          if (!rc) {
            alert('Could not upload card files');
            return -1;
          }
          var p12data = forge.util.binary.base64.decode(certData.pkcs12B64)
          rc = await up.uploadFile(gen.cert_dir, gen.cert_name + '.p12', p12data, 'application/x-pkcs12');
          if (!rc.ok) {
            alert('Could not upload file ' + gen.cert_name + '.p12');
            return -1;
          }
          var der = forge.util.binary.raw.decode(certData.der)
          rc = await up.uploadFile(gen.cert_dir, gen.cert_name + '.crt', der, 'application/pkix-cert');
          if (!rc.ok) {
            alert('Could not upload file ' + gen.cert_name + '.crt');
            return -1;
          }

          if (certData.ca_pem && certData.ca_fname) {
            rc = await up.uploadFile(gen.cert_dir, certData.ca_fname, certData.ca_pem, 'application/x-pem-file');
            if (!rc.ok) 
              return {rc:0, error:'Could not upload file ' + certData.ca_fname};
          }

        } else {
          alert('Could not create dir ' + gen.cert_dir);
          return -1;
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
        DOM.qSel('#gen-cert-ready-dlg #btn-upload_card').disabled = true;
        DOM.qHide('#gen-cert-ready-dlg #webid-card-upload');

        DOM.qShow('#gen-cert-ready-dlg #webid-card');
        var v = DOM.qSel('#webid-card #card_href');
        v.href = certData.card;
        v.innerText = certData.card;

        setTimeout(function () {
          alert('Done. Profile Document was uploaded.');
        }, 500);
      } else {
          alert('Error. Could not create your identity card, try again.');
      }
      return done_ok ? 0 : -1;
    }
  }


  async fetchDelegate(gen, webid, parent) 
  {
    var done_ok = false;
    DOM.qShow(`${parent} #delegate_wait`);
    var uri = DOM.qSel(`${parent} #delegate_uri`).value;
    try {
      var rc = await (new YouID_Loader()).verify_ID(uri, this.gOidc);
      if (rc) {
        for(var data of rc) {
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
            gen.delegate_fp_uri = k.fp_uri;
            gen.delegate_pubkey_uri = k.pubkey_uri;
            gen.delegate_key_label = k.pkey + (k.key_label?' / '+k.key_label : '');

            gen.delegator_webid = webid;

            this.setDelegateText(gen, parent);
            this.setDelegatorText(gen, parent);

            break;
          }
        }
      }
    }
    catch (e) {
      alert(e);
    }
    finally {
      DOM.qHide(`${parent} #delegate_wait`);
    }
  }


  loadDelegateCert(gen, webid, parent, cert) 
  {
    var rc;

    $('#import-delegate-dlg').modal('hide');

    try {
      rc = Coin.coin_cert_check(cert);
    } catch(e) {
       Msg.showInfo(e.message);
       return;
    }

    if (rc.rc!= 1) {
       Msg.showInfo(rc.err);
       return;
    }
      
    DOM.qSel(`${parent} #delegate_uri`).value = rc.san;
    
    gen.delegate_keys = [];
    gen.delegate_keys.push({exp: rc.exp, mod: rc.mod, pkey:'#PublicKey'});
    gen.delegate_uri = rc.san;
    gen.delegate_key_exp = rc.exp;
    gen.delegate_key_mod = rc.mod;
    gen.delegate_pubkey_uri = '_:publicKey'; 
    gen.delegate_key_label = '#PublicKey'; 

    gen.delegator_webid = webid;

    this.setDelegateText(gen, parent);
    this.setDelegatorText(gen, parent);
  }


  setDelegateText(gen, parent) 
  {
    var s = '';
    
    if (gen.delegate_uri && gen.delegator_webid 
        && !gen.delegate_uri.startsWith('bitcoin:')  && !gen.delegate_uri.startsWith('ethereum:') ) 
    {
        s  = '@prefix oplcert: <http://www.openlinksw.com/schemas/cert#> . \n';
        s += '@prefix cert: <http://www.w3.org/ns/auth/cert#> . \n';
        s += '@prefix owl:  <http://www.w3.org/2002/07/owl#> . \n';
        s += '@prefix xsig: <http://www.w3.org/2000/09/xmldsig#>  . \n\n';

        // delegate  -> delegator
        s += `INSERT { \n`;
        s += `<${gen.delegate_uri}> \n`;
        s += `            oplcert:onBehalfOf <${gen.delegator_webid}> .\n\n`;

      if (gen.delegate_pubkey_uri) {
        s += `<${gen.delegate_uri}> oplcert:hasPublicKey <${gen.delegate_pubkey_uri}> . \n`;
        s += `<${gen.delegate_pubkey_uri}>  a cert:RSAPublicKey; \n`;
        if (gen.delegate_fp_uri) {
          for(var i=0; i < gen.delegate_fp_uri.length; i++)
            s += `         owl:sameAs   <${gen.delegate_fp_uri[i]}>; \n`;
        }
        s += `         cert:exponent  "${gen.delegate_key_exp}"^^xsd:int; \n`;
        s += `         cert:modulus   "${gen.delegate_key_mod}"^^xsd:hexBinary . \n`;
      }

      s += ` }\n`;
/**
@prefix : <#> . 
@prefix oplcert: <http://www.openlinksw.com/schemas/cert#>
@prefix xsig: <http://www.w3.org/2000/09/xmldsig#>  . 

:delegate oplcert:hasCertificate :cert . 
:cert oplcert:fingerprint "E5B5BDFB6983A9C902D95BDA2D86FBACE5EF9ED3679472C9E3C627D6FBBC790A"^^xsd:hexBinary ;
      oplcert:fingerprint-digest <%{SHA1-in-hexedcimal}>^^xsig:sha1, <%{SHA256-in-hexedcimal}>^^xsig:sha256 .

------
@prefix : <#> . 
@prefix oplcert: <http://www.openlinksw.com/schemas/cert#>
@prefix xsig: <http://www.w3.org/2000/09/xmldsig#>  . 

:delegate 
oplcert:hasCertificate :cert . 

:cert oplcert:hasPublicKey :publicKey .

:publicKey  oplcert:RSAPublicKey ; 
            cert:modulus xx ; 
            cert:exponent ee ;
            owl:sameAs <%{di-scheme-uri-for-spki-digest-of-public-ksy}>, <%{ni-scheme-uri-for-spki-digest-of-public-ksy}> 
**/
    }

    DOM.qSel(`${parent} #delegate-text`).value = s;
  }


  setDelegatorText(gen, parent) 
  {
    var s = '';
    var s_ttl = ''
    var s_json = '';
    if (gen.delegator_webid && gen.delegate_uri) {

        s = `@prefix acl: <http://www.w3.org/ns/auth/acl#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix cert: <http://www.w3.org/ns/auth/cert#> .

INSERT { 
<${gen.delegator_webid}> 
      acl:delegates <${gen.delegate_uri}> . 

<${gen.delegate_uri}> 
   cert:key [ 
             a cert:RSAPublicKey;\n`;

        if (gen.delegate_fp_uri) {
          for(var i=0; i < gen.delegate_fp_uri.length; i++)
            s += `             owl:sameAs   <${gen.delegate_fp_uri[i]}>; \n`;
        }

        s += `             cert:exponent  "${gen.delegate_key_exp}"^^xsd:int; \n`;
        s += `             cert:modulus   "${gen.delegate_key_mod}"^^xsd:hexBinary \n`;
        s += '            ] . \n';
        s += ' }';
    

        s_ttl = `<script type="text/turtle">

@prefix acl: <http://www.w3.org/ns/auth/acl#> . 
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix cert: <http://www.w3.org/ns/auth/cert#> .

<${gen.delegator_webid}> 
      acl:delegates <${gen.delegate_uri}> . 

<${gen.delegate_uri}> 
   cert:key [ 
             a cert:RSAPublicKey;\n`;

        if (gen.delegate_fp_uri) {
          for(var i=0; i < gen.delegate_fp_uri.length; i++)
            s_ttl += `             owl:sameAs   <${gen.delegate_fp_uri[i]}>; \n`;
        }

        s_ttl += `             cert:exponent  "${gen.delegate_key_exp}"^^xsd:int; \n`;
        s_ttl += `             cert:modulus   "${gen.delegate_key_mod}"^^xsd:hexBinary; \n`;
        s_ttl += `            ] . \n`;
        s_ttl += `</script> \n`;


        s_json = `<script type="application/ld+json">

{
  "@context": {
    "acl": "http://www.w3.org/ns/auth/acl#",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "cert": "http://www.w3.org/ns/auth/cert#",
    "xsd": "http://www.w3.org/2001/XMLSchema#"
  },
  "@graph": [
    {
      "@id": "_:b2_b1",
      "@type": "cert:RSAPublicKey", \n`;

      if (gen.delegate_fp_uri && gen.delegate_fp_uri.length > 0) {
        s_json += `      "owl:sameAs": [\n`
        for(var i=0; i < gen.delegate_fp_uri.length; i++) 
        {
          s_json += `        { \n`
          s_json += `         "@id": "${gen.delegate_fp_uri[i]}" \n`
          if (i < gen.delegate_fp_uri.length-1)
            s_json += `        }, \n`
          else
            s_json += `        } \n`
        }
        s_json += `      ], \n`
      }

        s_json +=
`      "cert:exponent": {
        "@type": "xsd:int",
        "@value": "${gen.delegate_key_exp}"
      },
      "cert:modulus": {
        "@type": "xsd:hexBinary",
        "@value": "${gen.delegate_key_mod}"
      }
    },
    {
      "@id": "${gen.delegate_uri}",
      "cert:key": {
        "@id": "_:b2_b1"
      }
    },
    {
      "@id": "${gen.delegator_webid}",
      "acl:delegates": {
        "@id": "${gen.delegate_uri}"
      }
    }
  ]
}
</script>
 `;
    }

    DOM.qSel(`${parent} #delegator-sparql #text-sparql`).value = s;
    DOM.qSel(`${parent} #delegator-i_ttl #text-i-ttl`).value = s_ttl;
    DOM.qSel(`${parent} #delegator-i_jsonld #text-i-jsonld`).value = s_json;

    var btn = DOM.qSel(`${parent} #btn-delegate_cert_key`);
    if (gen.delegate_uri)
      btn.childNodes[0].nodeValue = gen.delegate_key_label;
    else
      btn.childNodes[0].nodeValue = 'Certificate Key';
  }



  async uploadDelegate(gen, webid, parent) 
  {
    if (!gen.delegate_uri) {
      alert('Delegate profile must be fetched at first');
      return;
    }
    var url = new URL(gen.delegate_uri);

    if (url.protocol === 'http:')
      url.protocol = 'https:';

    url.hash = '';

    var query = DOM.qSel(`${parent} #delegate-text`).value;
    if (query.length < 1) {
      alert('Delegate query is empty');
      return;
    }

    var options = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/sparql-update; charset=utf-8'
      },
      credentials: 'include',
      body: query
    }

    DOM.qSel(`${parent} #u_msg`).innerText = 'Updating Delegate profile';
    DOM.qShow(`${parent} #u_wait`);
    try {
      var resp = await this.gOidc.fetch(url.href, options);
      if (!resp.ok) {
        alert('Could not update Delegate profile HTTP=' + resp.status + '  ' + resp.statusText)
      } else {
        alert('Delegate relations were uploaded');
      }
    } catch (e) {
      alert('Could not update Delegate profile ' + e);
      console.log(e);
    } finally {
      DOM.qSel(`${parent} #u_msg`).innerText = '';
      DOM.qHide(`${parent} #u_wait`);
    }
  }


  async uploadDelegator(gen, webid, parent) 
  {
    var url = new URL(webid);
    url.hash = '';

    var query = DOM.qSel(`${parent} #text-sparql`).value;
    if (!query || query.length < 1) {
      alert('Delegator query is empty');
      return;
    }

    var options = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/sparql-update; charset=utf-8'
      },
      credentials: 'include',
      body: query
    }

    DOM.qSel(`${parent} #u_msg`).innerText = 'Updating Delegator profile';
    DOM.qShow(`${parent} #u_wait`);
    try {
      var resp = await this.gOidc.fetch(url.href, options);
      if (!resp.ok) {
        alert('Could not update Delegator profile HTTP=' + resp.status + '  ' + resp.statusText)
      } else {
        alert('Delegator relations were uploaded');
      }
    } catch (e) {
      alert('Could not update Delegator profile ' + e);
      console.log(e);
    } finally {
      DOM.qSel(`${parent} #u_msg`).innerText = '';
      DOM.qHide(`${parent} #u_wait`);
    }
  }


  async genManualCard(webid, certData, gen) 
  {
    var {ttl, jsonld, rdfxml} = await genManualUploads(webid, certData, gen);

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
  }


  genSolidInsertCert(webid, cert) 
  {
    var profileUri = webid.split('#')[0];
    var keyUri = profileUri + '#key-' + cert.validity.notBefore.getTime();
    var CN = cert.subject.getField('CN');
    var commonName = CN.value;
    var exponent = cert.publicKey.e.toString(10);
    var modulus = cert.publicKey.n.toString(16).toUpperCase();
    var timeCreated = cert.validity.notBefore.toISOString();

    var card_text = `
  @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
  @prefix cert: <http://www.w3.org/ns/auth/cert#>.
  @prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
  @prefix dcterms: <http://purl.org/dc/terms/>.
  @prefix foaf: <http://xmlns.com/foaf/0.1/>.

  INSERT DATA
  {
  <${webid}> cert:key <${keyUri}>.

  <${keyUri}>
    a cert:RSAPublicKey;
    dcterms:created "${timeCreated}"^^xsd:dateTime;
    dcterms:title "Created by YouID";
    rdfs:label "${commonName}";
    cert:exponent "${exponent}"^^xsd:int;
    cert:modulus "${modulus}"^^xsd:hexBinary.
  } `;
    return card_text;
  }


  genCACert(certName, certEmail, certOrg, certOrgUnit, certCity, certState, certCountry, webId, gen) 
  {
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
      attrs.push({ name: 'commonName', value: certName+' CA' });
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
      attrs.push({ name: 'organizationName', value: 'NetID' });
    }
    if (certEmail && certEmail.length > 1) {
      attrs.push({ name: 'emailAddress', value: certEmail });
    }

    var sanId = webId;
    if (gen.pdp === 'pdp_btc' && gen.btc && gen.btc.san) {
      sanId = gen.btc.san;
    }
    else if (gen.pdp === 'pdp_eth' && gen.eth && gen.eth.san) {
      sanId = gen.eth.san;
    }

    cert.setSubject(attrs);
    cert.setIssuer(attrs);

    var extList = [{ name: 'basicConstraints', cA: true, critical: true }];

    extList.push({ name: 'keyUsage', digitalSignature: true, keyEncipherment: true, keyCertSign: true });
    extList.push({ name: 'extKeyUsage', emailProtection: true });

    extList.push({ name: 'subjectAltName',
        altNames: [{
          type: 6, // URI
          value: sanId
        }]
      });
    extList.push({ name: 'subjectKeyIdentifier' });

    cert.setExtensions(extList);

    cert.sign(keys.privateKey, forge.md.sha512.create());

    return { 
      privateKey: keys.privateKey,
      publicKey: keys.publicKey,
      cert
    };
  }


  genCert(certName, certEmail, certOrg, certOrgUnit, certCity, certState, certCountry, webId, gen, CA_privKey, CA_cert) 
  {
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
      attrs.push({ name: 'organizationName', value: 'NetID' });
    }
    if (certEmail && certEmail.length > 1) {
      attrs.push({ name: 'emailAddress', value: certEmail });
    }

    var sanId = webId;
    if (gen.pdp === 'pdp_btc' && gen.btc && gen.btc.san) {
      sanId = gen.btc.san;
    }
    else if (gen.pdp === 'pdp_eth' && gen.eth && gen.eth.san) {
      sanId = gen.eth.san;
    }

    cert.setSubject(attrs);

    if (CA_privKey && CA_cert)
      cert.setIssuer(CA_cert.subject.attributes);
    else
      cert.setIssuer(attrs);

//      { name: 'basicConstraints', cA: true, critical: true },
    var extList = [{ name: 'basicConstraints', cA: false, critical: true }];

    if (gen.pdp === 'pdp_btc' || gen.pdp === 'pdp_eth') {

      extList.push({ name: 'keyUsage', digitalSignature: true });
      extList.push({ name: 'extKeyUsage', clientAuth: true , serverAuth: true});
      extList.push({ name: 'nsCertType', client: true });

      var pubKey = null;
      if (gen.pdp === 'pdp_btc' && gen.btc && gen.btc.pub)
        pubKey = gen.btc.pub;
      else if (gen.pdp === 'pdp_eth' && gen.eth && gen.eth.pub)
        pubKey = gen.eth.pub;

      if (pubKey)
        extList.push({ id: '2.16.840.1.2381.2',  value: pubKey});
    } 
    else 
    if (certEmail && certEmail.length > 0) {
      extList.push({ name: 'keyUsage', digitalSignature: true, keyEncipherment: true });
      extList.push({ name: 'extKeyUsage', clientAuth: true, emailProtection: true });
      extList.push({ name: 'nsCertType', client: true, email: true });
    }
    else {
      extList.push({ name: 'keyUsage', digitalSignature: true });
      extList.push({ name: 'extKeyUsage', clientAuth: true });
      extList.push({ name: 'nsCertType', client: true });
    }

    extList.push({ name: 'subjectAltName',
        altNames: [{
          type: 6, // URI
          value: sanId
        }]
      });
    extList.push({ name: 'subjectKeyIdentifier' });

    cert.setExtensions(extList);

    if (CA_privKey)
      cert.sign(CA_privKey, forge.md.sha512.create());
    else
      cert.sign(keys.privateKey, forge.md.sha512.create());

    return { 
      privateKey: keys.privateKey,
      publicKey: keys.publicKey,
      cert
    };
  }


  genCSR(certName, certEmail, certOrg, certOrgUnit, certCity, certState, certCountry, webId, gen) 
  {
    function addDays(date, days) {
      var result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    }

    var pki = forge.pki;

    // generate a keypair and create an X.509v3 certificate
    var keys = pki.rsa.generateKeyPair(2048);
    var csr = pki.createCertificationRequest();

    csr.publicKey = keys.publicKey;

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
      attrs.push({ name: 'organizationName', value: 'NetID' });
    }
    if (certEmail && certEmail.length > 1) {
      attrs.push({ name: 'emailAddress', value: certEmail });
    }

    csr.setSubject(attrs);

    var sanId = webId;
    if (gen.pdp === 'pdp_btc' && gen.btc && gen.btc.san) {
      sanId = gen.btc.san;
    }
    else if (gen.pdp === 'pdp_eth' && gen.eth && gen.eth.san) {
      sanId = gen.eth.san;
    }

    var extList = [{ name: 'basicConstraints', cA: false, critical: true }];

    if (gen.pdp === 'pdp_btc' || gen.pdp === 'pdp_eth') {

      extList.push({ name: 'keyUsage', digitalSignature: true });
      extList.push({ name: 'extKeyUsage', clientAuth: true, serverAuth: true });
      extList.push({ name: 'nsCertType', client: true });

      var pubKey = null;
      if (gen.pdp === 'pdp_btc' && gen.btc && gen.btc.pub)
        pubKey = gen.btc.pub;
      else if (gen.pdp === 'pdp_eth' && gen.eth && gen.eth.pub)
        pubKey = gen.eth.pub;

      if (pubKey)
        extList.push({ id: '2.16.840.1.2381.2',  value: pubKey});
    } 
    else 
    if (certEmail && certEmail.length > 0) {
      extList.push({ name: 'keyUsage', digitalSignature: true, keyEncipherment: true });
      extList.push({ name: 'extKeyUsage', clientAuth: true, emailProtection: true });
      extList.push({ name: 'nsCertType', client: true, email: true });
    }
    else {
      extList.push({ name: 'keyUsage', digitalSignature: true });
      extList.push({ name: 'extKeyUsage', clientAuth: true });
      extList.push({ name: 'nsCertType', client: true });
    }

    extList.push({ name: 'subjectAltName',
        altNames: [{
          type: 6, // URI
          value: sanId
        }]
      });

    csr.setAttributes([
        {
        name: 'extensionRequest',
        extensions: extList
        }]);

    csr.sign(keys.privateKey, forge.md.sha512.create());

    return  {
      privateKey: keys.privateKey, //pki.privateKeyToPem(keys.privateKey),
      publicKey: keys.publicKey, // pki.publicKeyToPem(keys.publicKey),
      pem: pki.certificationRequestToPem(csr)
    };
  }


  genCertInfo(certPEM, cert, privateKey, certName, pwd)
  {
    var pki = forge.pki;

    if (certPEM && !cert) {
      cert =  pki.certificateFromPem(certPEM);
    }

    var pemCert = pki.certificateToPem(cert);
    var derCert = forge.asn1.toDer(pki.certificateToAsn1(cert)).getBytes();

    var key_name = (certName && certName.length>0)?certName:"";
    var p12Asn1 = forge.pkcs12.toPkcs12Asn1(privateKey, [cert], pwd,
      {
        generateLocalKeyId: true,
        friendlyName: key_name+'-key',
        algorithm: '3des'
      });

    var p12Der = forge.asn1.toDer(p12Asn1).getBytes();
    var p12B64 = forge.util.encode64(p12Der);

    var md;
    md = forge.md.sha1.create();
    md.start();
    md.update(derCert);
    var digest = md.digest();

    var digest_hex = forge.util.binary.hex.encode(digest.data).toUpperCase();
    var fp = `#SHA1 Fingerprint:${digest_hex}`
    var digest_b64 = forge.util.encode64(digest.data);
    var digest_emo_w = bin2emoj(digest.data, 'word');
    var digest_emo_s = bin2emoj(digest.data, 'str');


    var pk_digest = pki.getPublicKeyFingerprint(cert.publicKey, {type: 'SubjectPublicKeyInfo'});
    var pk_digest_b64 = forge.util.encode64(pk_digest.data);
    var pk_b64_url = pk_digest_b64.replace(/\+/g,'-').replace(/\//g,'_').replace(/\=/g,'');
    var pk_digest_emo_w = bin2emoj(pk_digest.data, 'word');
    var pk_digest_emo_s = bin2emoj(pk_digest.data, 'str');

    var fp_ni = `ni:///sha-1;${pk_b64_url}`;
    var fp_di = `di:sha1;${pk_b64_url}`;


    md = forge.md.sha256.create();
    md.start();
    md.update(derCert);
    var digest_256 = md.digest();

    var digest_256_hex = forge.util.binary.hex.encode(digest_256.data).toUpperCase();
    var fp_256 = `#SHA256 Fingerprint:${digest_256_hex}`
    var digest_256_emo_w = bin2emoj(digest_256.data, 'word');
    var digest_256_emo_s = bin2emoj(digest_256.data, 'str');

    var pk_digest_256 = pki.getPublicKeyFingerprint(cert.publicKey, {md: forge.md.sha256.create(), type: 'SubjectPublicKeyInfo'});
    var pk_digest_256_b64 = forge.util.encode64(pk_digest_256.data);
    var pk_b64_256_url = pk_digest_256_b64.replace(/\+/g,'-').replace(/\//g,'_').replace(/\=/g,'');
    var pk_digest_256_emo_w = bin2emoj(pk_digest_256.data, 'word');
    var pk_digest_256_emo_s = bin2emoj(pk_digest_256.data, 'str');

    var fp_256_ni = `ni:///sha-256;${pk_b64_256_url}`;
    var fp_256_di = `di:sha256;${pk_b64_256_url}`;

    var fp_tab = fp+"\n"
                +fp_256+"\n\n"
                +`#SHA1 Fingerprint:${digest_emo_w}\n`
                +`#SHA256 Fingerprint:${digest_256_emo_w}\n\n`
                +`#SHA1 Fingerprint:${digest_emo_s}\n`
                +`#SHA256 Fingerprint:${digest_256_emo_s}\n`;

    var fp_ni_tab = fp_ni+"\n"+fp_256_ni+"\n\n"
                +`ni:///sha-1;${pk_digest_emo_s}\n`
                +`ni:///sha-256;${pk_digest_256_emo_s}\n`;

    var fp_di_tab = fp_di+"\n"+fp_256_di+"\n\n"
                +`di:sha1;${pk_digest_emo_s}\n`
                +`di:sha256;${pk_digest_256_emo_s}\n`;

    return { der: derCert, pem: pemCert, pkcs12B64: p12B64, pkcs12: p12Der, cert, 

             fingerprint_hex: digest_hex, 
             fingerprint_256_hex: digest_256_hex, 

             fingerprint_b64: digest_b64, 
             fingerprint_di: fp_di, 
             fingerprint_ni: fp_ni,
             fingerprint_256_di: fp_256_di, 
             fingerprint_256_ni: fp_256_ni,
             fingerprint_tab: fp_tab,
             fingerprint_ni_tab: fp_ni_tab,
             fingerprint_di_tab: fp_di_tab,
           };

  }

}


