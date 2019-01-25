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



Certificate = function () {
  this.gPref = new Settings();
  this.gOidc = new OidcWeb();
}

Certificate.prototype = {

  click_gen_cert: function (cur_webid) {
    var self = this;

    if (cur_webid) {
      DOM.iSel('c_profile').value = cur_webid;
    }

    var dt = new Date();
    var YMD = dt.toISOString().substring(0, 10).replace(/-/g, '');
    var HMS = dt.toISOString().substring(11, 19).replace(/:/g, '');

    DOM.qSel('#gen-cert-dlg #c_cert_path').value = 'YouID/IDcard_' + YMD + '_' + HMS;
    DOM.qSel('#gen-cert-dlg #c_cert_name').value = 'cert_' + YMD + '_' + HMS;

    if (DOM.qSel('#c_idp option:checked').value === 'solid_oidc') {
      this.oidc_changed();
    }

    DOM.qSel('#gen-cert-dlg #btn-fetch-profile')
      .onclick = () => {
        var uri = DOM.iSel('c_profile').value;
        if (uri.length == 0)
          return;

        DOM.qShow('#gen-cert-dlg #fetch_wait');
        (new YouID_Loader()).verify_ID(uri)
          .then((ret) => {
            DOM.qHide('#gen-cert-dlg #fetch_wait');
            if (ret.success) {
              DOM.iSel('c_webid').value = ret.youid.id;
              DOM.iSel('c_name').value = ret.youid.name;
            }
          })
          .catch(err => {
            DOM.qHide('#gen-cert-dlg #fetch_wait');
            alert(err.message);
          });
      };

    DOM.qSel('#gen-cert-dlg #c_dav_uid')
      .onchange = (e) => {
        var uid = DOM.qSel('#gen-cert-dlg #c_dav_uid').value;
        var idp = DOM.qSel('#c_idp option:checked').value;
        var up;

        if (idp === 'opl_ldp' || idp === 'opl_ldp_https')
          up = new Uploader_OPL_LDP(uid, '', undefined, idp)
        else
          up = new Uploader_OPL_WebDav(uid, '', undefined, idp)

        DOM.qSel('#gen-cert-dlg #c_dav_path').value = up.getBasePath();
      };

    DOM.qSel('#gen-cert-dlg #c_idp')
      .onchange = (e) => {
        var sel = DOM.qSel('#c_idp option:checked').value;
        DOM.qHide('#gen-cert-dlg #r_webid');
        DOM.qSel('#gen-cert-dlg #r_webid input').readOnly = false;
        DOM.qHide('#gen-cert-dlg #c_webdav');
        DOM.qHide('#gen-cert-dlg #c_solid_oidc');
        DOM.qHide('#gen-cert-dlg #r_cert_name');
        DOM.qHide('#gen-cert-dlg #r_cert_path');

        if (sel === 'manual') {
          DOM.qShow('#gen-cert-dlg #r_webid');
          DOM.qSel('#gen-cert-dlg #r_webid').value = '';
        }
        else if (sel === 'opl_dav' || sel === 'opl_dav_https') {
          if (DOM.qSel('#gen-cert-dlg #c_cert_path').value.length < 1)
            DOM.qSel('#gen-cert-dlg #c_cert_path').value = 'YouID/IDcard_' + YMD + '_' + HMS;

          DOM.qShow('#gen-cert-dlg #r_cert_name');
          DOM.qShow('#gen-cert-dlg #r_cert_path');
          DOM.qShow('#gen-cert-dlg #c_webdav');
          var uid = DOM.qSel('#gen-cert-dlg #c_dav_uid').value;
          var up = new Uploader_OPL_WebDav(uid, '', undefined, sel)
          DOM.qSel('#gen-cert-dlg #c_dav_path').value = up.getBasePath();
        }
        else if (sel === 'opl_ldp' || sel === 'opl_ldp_https') {
          if (DOM.qSel('#gen-cert-dlg #c_cert_path').value.length < 1)
            DOM.qSel('#gen-cert-dlg #c_cert_path').value = 'YouID/IDcard_' + YMD + '_' + HMS;

          DOM.qShow('#gen-cert-dlg #r_cert_name');
          DOM.qShow('#gen-cert-dlg #r_cert_path');
          DOM.qShow('#gen-cert-dlg #c_webdav');
          var uid = DOM.qSel('#gen-cert-dlg #c_dav_uid').value;
          var up = new Uploader_OPL_LDP(uid, '', undefined, sel)
          DOM.qSel('#gen-cert-dlg #c_dav_path').value = up.getBasePath();
        }
        else if (sel === 'solid_oidc') {
          DOM.qShow('#gen-cert-dlg #r_webid');
          DOM.qSel('#gen-cert-dlg #r_webid input').readOnly = true;
          DOM.qShow('#gen-cert-dlg #c_solid_oidc');
          this.oidc_changed();
        }
        else if (sel === 'ldp_tls' || sel === 'ldp_tls_solid') {
          if (DOM.qSel('#gen-cert-dlg #c_cert_path').value.length < 1)
            DOM.qSel('#gen-cert-dlg #c_cert_path').value = 'YouID/IDcard_' + YMD + '_' + HMS;

          DOM.qShow('#gen-cert-dlg #r_webid');
          DOM.qShow('#gen-cert-dlg #r_cert_name');
          DOM.qShow('#gen-cert-dlg #r_cert_path');
        }
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

    DOM.qSel('#gen-cert-dlg #btn-gen-cert')
      .onclick = async () => {
        var gen = {};
        gen.idp = DOM.qSel('#c_idp option:checked').value;
        gen.cert_name = DOM.qSel('#gen-cert-dlg #c_cert_name').value;
        if (gen.cert_name.length < 1) {
          gen.cert_name = 'cert_' + YMD + '_' + HMS;
        }

        gen.cert_dir = DOM.qSel('#gen-cert-dlg #c_cert_path').value;
        if (gen.cert_dir.length < 1) {
          gen.cert_dir = 'YouID/IDcard_' + YMD + '_' + HMS;
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

          var up = new Uploader_OPL_WebDav(gen.uid, gen.pwd, gen.dav_path, gen.idp);
          var rc = await up.checkCredentials();
          if (!rc) {
            alert('Wrong DAV User or Pwd');
            return
          }
          rc = await up.checkDirExists(gen.cert_dir);
          if (rc && rc.exists) {
            alert('Dir ' + gen.cert_dir + ' exists already');
            return;
          }

          gen.dav_fullpath = up.getDirPath(gen.cert_dir);
          if (!gen.dav_fullpath.endsWith('/'))
            gen.dav_fullpath += '/';

          var webid = gen.dav_fullpath + 'profile.ttl#identity';

          DOM.qSel('#gen-cert-dlg #c_webid').value = webid;
        }
        else if (gen.idp === 'solid_oidc') {
        }
        else if (gen.idp === 'ldp_tls' || gen.idp === 'ldp_tls_solid') {
        }
        else if (gen.idp === 'opl_ldp' || gen.idp === 'opl_ldp_https') {
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

          var up = new Uploader_OPL_LDP(gen.uid, gen.pwd, gen.dav_path, gen.idp);
          var rc = await up.checkCredentials();
          if (!rc) {
            alert('Wrong DAV User or Pwd');
            return
          }
          rc = await up.checkDirExists(gen.cert_dir);
          if (rc && rc.exists) {
            alert('Dir ' + gen.cert_dir + ' exists already');
            return;
          }

          gen.dav_fullpath = up.getDirPath(gen.cert_dir);
          if (!gen.dav_fullpath.endsWith('/'))
            gen.dav_fullpath += '/';

          var webid = gen.dav_fullpath + 'profile.ttl#identity';

          DOM.qSel('#gen-cert-dlg #c_webid').value = webid;
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
          var rc = await youid.verify_ID(this.gOidc.webid, this.gOidc.fetch);
          if (rc.success) {
            DOM.iSel('c_name').value = rc.youid.name;
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
    var certCountry = DOM.qSel('#gen-cert-dlg #c_country').value;
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
    DOM.qHide('#gen-cert-ready-dlg #card-text');
    DOM.qHide('#gen-cert-ready-dlg #r-reg_delegate')
    DOM.qSel('#gen-cert-ready-dlg #delegate-text').value = '';
    DOM.qSel('#gen-cert-ready-dlg #delegator-text').value = '';
    DOM.qSel('#gen-cert-ready-dlg #delegate_uri').value = '';
    DOM.qSel('#gen-cert-ready-dlg #reg_delegate').checked = false;

    gen.delegate_uri = null;
    this.setDelegateText(gen);
    this.setDelegatorText(gen);
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


    $('#gen-cert-ready-dlg').modal('show');

    setTimeout(function () {
      certData = self.genCert(name, email, certOrg, certOrgUnit, certCity, certState, certCountry, webid, certPwd);

      var p12Url = 'data:application/x-pkcs12;base64,' + certData.pkcs12B64;
      DOM.qSel('#gen-cert-ready-dlg #pkcs12-download').setAttribute('href', p12Url);
      DOM.qShow('#gen-cert-ready-dlg #p12-cert');
      DOM.qHide('#gen-cert-ready-dlg #c_wait');
      DOM.qHide('#gen-cert-ready-dlg #btn-upload_cert');
      DOM.qHide('#gen-cert-ready-dlg #ready_msg');
      DOM.qHide('#gen-cert-ready-dlg #ready_msg_manual');
      DOM.qShow('#gen-cert-ready-dlg #r-reg_delegate')

      if (gen.idp === 'manual') {
        DOM.qShow('#gen-cert-ready-dlg #ready_msg_manual');
        var s = self.genManualCard(webid, certData.cert);
        DOM.qSel('#gen-cert-ready-dlg #card-text').value = s;
        DOM.qShow('#gen-cert-ready-dlg #card-text');
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
            var chk = ev.currentTarget;
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
            var btn = ev.currentTarget;
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
      if (gen.idp === 'opl_dav' || gen.idp === 'opl_dav_https') {
        var up = new Uploader_OPL_WebDav(gen.uid, gen.pwd, gen.dav_path, gen.idp);
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
      else if (gen.idp === 'solid_oidc') {
        var url = new URL(webid);
        var up = new Uploader_Solid_OIDC(this.gOidc, url.origin + '/');

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
      else if (gen.idp === 'ldp_tls' || gen.idp === 'ldp_tls_solid') {
        var url = new URL(webid);
        var up = new Uploader_LDP_TLS(url.origin + '/', gen.idp);

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
      else if (gen.idp === 'opl_ldp' || gen.idp === 'opl_ldp_https') {
        var up = new Uploader_OPL_LDP(gen.uid, gen.pwd, gen.dav_path, gen.idp);
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
        $('#gen-cert-ready-dlg').modal('hide');
        alert('Done');
        this.click_gen_cert();
      }
    }
  },

  fetchDelegate: async function (gen, webid) {
    var done_ok = false;
    DOM.qShow('#gen-cert-ready-dlg #delegate_wait');
    var uri = DOM.qSel('#gen-cert-ready-dlg #delegate_uri').value;
    try {
      var rc = await (new YouID_Loader()).verify_ID(uri);
      if (rc.success) {
        var s;

        gen.delegate_profile = rc.profile;
        gen.delegate_uri = rc.youid.id;
        
        var rkeys = await (new YouID_Loader()).getCertKeys(gen.delegate_profile);
        if (rkeys.err) {
          alert('Could not get certificate Keys from profile');
          gen.delegate_keys = [];
        } else {
          gen.delegate_keys = rkeys.keys;
        }

        if (gen.delegate_keys.length===0) {
          gen.delegate_keys.push({'pkey':'key', 'mod': rc.youid.mod, 'exp': rc.youid.exp});
        }

        var k = gen.delegate_keys[0];
        gen.delegate_key_exp = k.exp;
        gen.delegate_key_mod = k.mod;
        gen.delegate_key_label = k.pkey + (k.key_label?' / '+k.key_label : '');

        gen.delegator_webid = webid;

        this.setDelegateText(gen);
        this.setDelegatorText(gen);
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
        s += `             cert:modulus   "${gen.delegate_key_mod}^^xsd:hexBinary"\n`;
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


  genManualCard: function (webid, cert) {
    var profileUri = webid.split('#')[0];
    var keyUri = profileUri + '#key-' + cert.validity.notBefore.getTime();
    var CN = cert.subject.getField('CN');
    var commonName = CN.value;
    var exponent = cert.publicKey.e.toString(10);
    var modulus = cert.publicKey.n.toString(16).toLowerCase();
    var timeCreated = cert.validity.notBefore.toISOString();

    var card_text = `
  @prefix : <#>.
  @prefix cert: <http://www.w3.org/ns/auth/cert#>.
  @prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
  @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
  @prefix terms: <http://purl.org/dc/terms/>.
  @prefix foaf: <http://xmlns.com/foaf/0.1/>.

  <>
    a foaf:PersonalProfileDocument ;
    foaf:maker <${webid}> ;
    foaf:primaryTopic <${webid}> .

  <${webid}>
    a foaf:Person ;
    a schema:Person ;
    foaf:name "${commonName}" ;
    cert:key <${keyUri}>.


  <${keyUri}>
    a cert:RSAPublicKey;
    terms:created "${timeCreated}"^^xsd:dateTime;
    terms:title "Created by YouID";
    rdfs:label "${commonName}";
    cert:exponent "${exponent}"^^xsd:int;
    cert:modulus "${modulus}"^^xsd:hexBinary.
    `;
    return card_text;
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

    var p12Asn1 = forge.pkcs12.toPkcs12Asn1(keys.privateKey, [cert], pwd,
      {
        generateLocalKeyId: true,
        friendlyName: 'solid-cert',
        algorithm: '3des'
      });

    var p12Der = forge.asn1.toDer(p12Asn1).getBytes();
    var p12B64 = forge.util.encode64(p12Der);

    return { der: derCert, pem: pemCert, pkcs12B64: p12B64, pkcs12: p12Der, cert };
  },


}


class Uploader {
  constructor() {
    this.files = {};
  }

  base64e(input) {
    var keyStr = "ABCDEFGHIJKLMNOP" +
      "QRSTUVWXYZabcdef" +
      "ghijklmnopqrstuv" +
      "wxyz0123456789+/" +
      "=";
    var output = "";
    var chr1, chr2, chr3 = "";
    var enc1, enc2, enc3, enc4 = "";
    var i = 0;

    if (!input.length) { return output; }

    do {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }

      output = output +
        keyStr.charAt(enc1) +
        keyStr.charAt(enc2) +
        keyStr.charAt(enc3) +
        keyStr.charAt(enc4);
      chr1 = chr2 = chr3 = "";
      enc1 = enc2 = enc3 = enc4 = "";
    } while (i < input.length);
    return output;
  }

  createBasicDigest(uid, pwd) {
    return 'Basic ' + this.base64e(uid + ':' + pwd)
  }

  async uploadFile(dir, fname, data, type) {
    return { ok: false };
  }

  async loadCardFiles() {
    this.files["addrbook.png"] = new CardFileBinary('addrbook.png', 'image/png');
    this.files["lock.png"] = new CardFileBinary('lock.png', 'image/png');
    this.files["museo-500-webfont.eot"] = new CardFileBinary('museo-500-webfont.eot', 'application/vnd.ms-fontobject');
    this.files["museo-500-webfont.ttf"] = new CardFileBinary('museo-500-webfont.ttf', 'application/x-font-ttf');
    this.files["museo-500-webfont.woff"] = new CardFileBinary('museo-500-webfont.woff', 'application/octet-stream');
    this.files["photo_130x145.jpg"] = new CardFileBinary('photo_130x145.jpg', 'image/jpeg');
    this.files["youid_logo-35px.png"] = new CardFileBinary('youid_logo-35px.png', 'image/png');
    this.files["style.css"] = new CardFileBinary('style.css', 'text/css');

    var v = new CardFileBase64('photo_130x145.jpg', 'image/jpeg');
    v.export = false;
    this.files["photo_130x145.base64"] = v;

    v = new CardFileTpl(true, 'prof_microdata', 'text/turtle');
    v.export = false;
    this.files["prof_microdata"] = v;

    v = new CardFileTpl(true, 'prof_rdfa', 'text/turtle');
    v.export = false;
    this.files["prof_rdfa"] = v;

    this.files["vcard.vcf"] = new CardFileTpl(true, 'vcard.vcf', 'text/vcard');
    this.files["index.html"] = new CardFileTpl(true, 'index.html', 'text/html');
    this.files["profile.ttl"] = new CardFileTpl(true, 'profile.ttl', 'text/turtle');
    this.files["profile_rdfa.html"] = new CardFileTpl(true, 'profile_rdfa.html', 'text/html');
    this.files["prof_jsonld"] = new CardFileTpl(true, 'profile.jsonld', 'application/ld+json');


    this.files["certificate.ttl"] = new CardFileTpl(true, 'certificate.ttl', 'text/turtle');
    this.files["certificate.jsonld"] = new CardFileTpl(true, 'certificate.jsonld', 'application/ld+json');
    this.files["certificate.rdfa.html"] = new CardFileTpl(true, 'certificate.rdfa.html', 'text/html');

    this.files["public_key.ttl"] = new CardFileTpl(true, 'public_key.ttl', 'text/turtle');
    this.files["public_key.jsonld"] = new CardFileTpl(true, 'public_key.jsonld', 'application/ld+json');
    this.files["public_key.rdfa.html"] = new CardFileTpl(true, 'public_key.rdfa.html', 'text/html');


    for (var key in this.files) {
      try {
        var f = this.files[key];
        var rc = await f.load();
        if (!rc)
          return rc;
      } catch (e) {
        console.log(e);
        return false;
      }
    }
    return true;
  }

  timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async uploadCardFiles(dir) {
    var rc;

    for (var key in this.files) {
      var f = this.files[key];

      if (!f.export)
        continue;

      if (f.out_blob)
        rc = await this.uploadFile(dir, f.fname, f.out_blob, f.type);
      else
        rc = await this.uploadFile(dir, f.fname, f.out_text, f.type);

      if (!rc.ok)
        return rc.ok;
      await this.timeout(500);
    }
    return true;
  }


  parseTpl(s, map) {
    var data = [];
    var prev = 0;
    var pos = 0;
    while (true) {
      var i = s.indexOf('%{', pos);
      if (i == -1) {
        data.push(s.substring(pos));
        break;
      }
      data.push(s.substring(pos, i))

      var j = s.indexOf('}', i);
      if (j == -1)
        break;
      var key = s.substring(i + 2, j);
      var v = map[key];
      if (v !== undefined)
        data.push(v);
      else
        data.push('%{' + key + '}')
      pos = j + 1;
    }
    return data.join('');
  }

  getProfilesData(tpl_data, files) {
    var f = files["profile.ttl"];
    f.out_text = this.parseTpl(f.tpl_text, tpl_data);
    tpl_data['profile_ttl'] = f.out_text;

    f = files["prof_jsonld"];
    f.out_text = this.parseTpl(f.tpl_text, tpl_data);
    tpl_data['json_ld'] = f.out_text;

    f = files["prof_microdata"];
    f.out_text = this.parseTpl(f.tpl_text, tpl_data);
    tpl_data['microdata'] = f.out_text;

    f = files["prof_rdfa"];
    f.out_text = this.parseTpl(f.tpl_text, tpl_data);
    tpl_data['rdfa'] = f.out_text;

    f = files["photo_130x145.base64"];
    tpl_data['photo_base64'] = f.out_base64;
  }


  async updateTemplate(certData, webid, dir_url, gen) {
    var cert = certData.cert;
    var tpl_data = {};
    var v;

    if (!dir_url.endsWith('/'))
      dir_url += '/';

    function toStr(subj) {
      var data = [];
      for (var i = 0; i < subj.attributes.length; i++) {
        var attr = subj.attributes[i];
        data.push('/')
        if (attr.shortName) {
          data.push(attr.shortName);
          data.push('=');
          data.push(attr.value);
        }
        else if (attr.name) {
          data.push(attr.name);
          data.push('=');
          data.push(attr.value);
        }
      }
      return data.join('');
    }

    function toHex(buffer, delim) {
      var rval = '';
      for (var i = buffer.read; i < buffer.data.length; ++i) {
        var b = buffer.data.charCodeAt(i);
        if (b < 16) {
          rval += '0';
        }
        rval += b.toString(16);
        if (delim)
          rval += delim;
      }
      return rval;
    }


    tpl_data['pdp_url_head'] = '';
    tpl_data['pdp_url_row'] = '';
    tpl_data['pdp_add'] = '';
    tpl_data['ian'] = '';

    tpl_data['modulus'] = cert.publicKey.n.toString(16).toLowerCase();
    tpl_data['exponent'] = cert.publicKey.e.toString(10);
    tpl_data['issuer'] = toStr(cert.issuer);
    tpl_data['subject'] = toStr(cert.subject);

    v = cert.subject.getField('C');
    tpl_data['subj_country'] = v ? v.value : ''
    v = cert.subject.getField('ST');
    tpl_data['subj_state'] = v ? v.value : ''
    v = cert.subject.getField('CN');
    tpl_data['subj_name'] = v ? v.value : ''
    v = cert.subject.getField('O');
    tpl_data['subj_org'] = v ? v.value : ''
    v = cert.subject.getField({ name: 'emailAddress' });
    var email = v ? v.value : '';
    tpl_data['subj_email'] = email;
    tpl_data['subj_email_mailto'] = 'mailto:' + email;
    tpl_data['subj_email_mailto_href'] = '<a href="mailto:' + email + '">' + email + '<a/>';

    tpl_data['date_before'] = cert.validity.notBefore.toISOString();
    tpl_data['date_after'] = cert.validity.notAfter.toISOString();
    tpl_data['webid'] = webid;
    tpl_data['pdp_url'] = '';
    tpl_data['pdp_url_row'] = '';
    tpl_data['pdp_url_head'] = '';
    tpl_data['ca_key_row'] = '';

    tpl_data['pubkey_pem_url'] = dir_url + gen.cert_name + '.crt';
    tpl_data['vcard_url'] = dir_url + this.files["vcard.vcf"].fname;
    tpl_data['prof_url'] = dir_url + this.files["profile.ttl"].fname;
    tpl_data['pubkey_url'] = dir_url + this.files["public_key.ttl"].fname;
    tpl_data['cert_url'] = dir_url + this.files["certificate.ttl"].fname;
    tpl_data['card_url'] = dir_url + this.files["index.html"].fname;
    tpl_data['jsonld_prof_url'] = dir_url + this.files["prof_jsonld"].fname;
    tpl_data['jsonld_cert_url'] = dir_url + this.files["certificate.jsonld"].fname;
    tpl_data['jsonld_pubkey_url'] = dir_url + this.files["public_key.jsonld"].fname;
    tpl_data['rdfa_prof_url'] = dir_url + this.files["profile_rdfa.html"].fname;
    tpl_data['rdfa_cert_url'] = dir_url + this.files["certificate.rdfa.html"].fname;
    tpl_data['rdfa_pubkey_url'] = dir_url + this.files["public_key.rdfa.html"].fname;

    tpl_data['qr_card_url'] = '';
    tpl_data['qr_rdfa_url'] = '';

    var md = forge.md.sha1.create();
    md.start();
    md.update(certData.der);
    var digest = md.digest();
    tpl_data['fingerprint'] = toHex(digest);
    tpl_data['fingerprint_colon'] = toHex(digest, ':');
    tpl_data['fingerprint-digest'] = 'sha1';
    tpl_data['serial'] = cert.serialNumber;
    tpl_data['cert_base64'] = forge.util.encode64(certData.der);

    var signName = forge.pki.oids[cert.signatureOid];
    var sign = forge.util.encode64(cert.signature).replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
    tpl_data['signature'] = 'ni:///' + signName + ';' + sign;

    md = forge.md.sha256.create();
    md.start();
    md.update(certData.der);
    digest = md.digest();
    v = forge.util.encode64(digest).replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
    tpl_data['vcard_digest_uri', "ni:///sha-256:" + v];

    this.getProfilesData(tpl_data, this.files);

    for (var key in this.files) {
      var f = this.files[key];
      if (f.tpl && f.tpl_text)
        f.out_text = this.parseTpl(f.tpl_text, tpl_data);
    }
    return true;
  }
}


class Uploader_Solid_OIDC extends Uploader {
  constructor(oidc, base_path) {
    super();
    this.gOidc = oidc;
    this.fetch = this.gOidc.fetch;
    this.base_path = base_path;
  }


  async uploadFile(dir, fname, data, type) {
    var path = dir + '/' + fname;
    var url = this.base_path + encodeURI(path);

    var options = {
      method: 'PUT',
      headers: {
        'Content-Type': type
      },
      credentials: 'include',
      body: data
    }

    DOM.qSel('#gen-cert-ready-dlg #u_msg').innerText = fname;
    try {
      var resp = await this.fetch(url, options);
      return { ok: resp.ok, code: resp.status, err: resp.statusText };
    } catch (e) {
      console.log(e);
      return { ok: false };
    } finally {
      DOM.qSel('#gen-cert-ready-dlg #u_msg').innerText = ''
    }
  }


  async updateProfileCard(webid, query) {
    var path = new URL(webid);
    path.hash = '';
    var url = path.href;

    var options = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/sparql-update; charset=utf-8'
      },
      credentials: 'include',
      body: query
    }

    DOM.qSel('#gen-cert-ready-dlg #u_msg').innerText = 'Updating Solid profile...';
    try {
      var resp = await this.fetch(url, options);
      return { ok: resp.ok, code: resp.status, err: resp.statusText };
    } catch (e) {
      console.log(e);
      return { ok: false };
    } finally {
      DOM.qSel('#gen-cert-ready-dlg #u_msg').innerText = ''
    }
  }

}


class Uploader_OPL_WebDav extends Uploader {

  constructor(uid, pwd, base_path, idp) {
    super();
    this.uid = uid;
    this.pwd = pwd;
    if (base_path) {
      if (!base_path.endsWith('/'))
        base_path += '/';
      this.base_path = base_path;
    }
    else {
      this.base_path = (idp && idp === 'opl_dav_https') ? 'https://id.myopenlink.net/DAV/home/' : 'http://id.myopenlink.net/DAV/home/';;
      if (uid)
        this.base_path += uid + '/';
    }

  }

  getBasePath() {
    return this.base_path;
  }

  getDirPath(dir) {
    if (dir.startsWith('/'))
      dir = dir.substring(1);

    var url = new URL(dir, new URL(this.base_path));
    return url.href;
  }

  async checkCredentials() {
    var rc = await this.propfind(this.base_path);
    if (rc && rc.ok)
      return true;
    else
      return false;
  }

  async checkDirExists(dir) {
    var url = this.getDirPath(dir);
    var rc = await this.propfind(url);
    if (rc.ok)
      return { exists: true };
    else
      return { err: rc.err };
  }

  async createProfileDir(dir) {
    var dir_lst = encodeURI(dir).split('/');
    var path = this.base_path;

    for (var i = 0; i < dir_lst.length; i++) {
      var s = dir_lst[i];
      if (s.length > 0) {
        path += s + '/';
        var rc = await this.propfind(path);
        if (rc && rc.ok) {
          continue;
        }
        else {
          var rc = await this.createDir(path);
          if (!rc.ok)
            return rc;
        }
      }
    }
    return { ok: true };
  }



  async head(url) {
    var options = {
      method: 'HEAD',
      headers: {
        'Authorization': this.createBasicDigest(this.uid, this.pwd),
      },
      credentials: 'omit'
    }

    try {
      var resp = await fetch(url, options);
      if (!resp.ok) {
        if (resp.status === 401) {
          return { ok: false, code: resp.status, 'err': 'Unauthorized' };
        } else if (resp.status === 404) {
          return { ok: false, code: resp.status, 'err': resp.statusText };
        }
      } else if (resp.status === 200) {
        //var data = await resp.text();
        return { ok: true, code: resp.status, err: null }
      } else {
        return { ok: resp.ok };
      }
    } catch (e) {
      console.log(e);
      return { ok: false };
    }
  }


  async propfind(url) {
    var content_type = 'text/xml';
    var post_msg = '<?xml version="1.0" encoding="utf-8" ?><D:propfind xmlns:D="DAV:"><D:allprop/></D:propfind>';

    var options = {
      method: 'PROPFIND',
      headers: {
        'Authorization': this.createBasicDigest(this.uid, this.pwd),
        'Depth': '0',
        'Content-Type': content_type
      },
      credentials: 'omit',
      body: post_msg
    }

    try {
      var resp = await fetch(url, options);
      if (!resp.ok) {
        if (resp.status === 401) {
          return { ok: false, code: resp.status, 'err': 'Unauthorized' };
        } else if (resp.status === 404) {
          return { ok: false, code: resp.status, 'err': resp.statusText };
        }
      } else if (resp.status === 207) {
        //var data = await resp.text();
        return { ok: true, code: resp.status, err: null }
      } else {
        return { ok: false };
      }
    } catch (e) {
      console.log(e);
      return { ok: false };
    }
  }


  async proppatch(url) {
    var content_type = 'text/xml';
    var post_msg = '<?xml version="1.0" encoding="utf-8" ?>' +
      '<D:propertyupdate xmlns:D="DAV:"><D:set><D:prop>' +
      '<virtpermissions xmlns="http://www.openlinksw.com/virtuoso/webdav/1.0/">110100100RM</virtpermissions>' +
      '</D:prop></D:set></D:propertyupdate>';

    var options = {
      method: 'PROPPATCH',
      headers: {
        'Authorization': this.createBasicDigest(this.uid, this.pwd),
        'Content-Type': content_type
      },
      credentials: 'omit',
      body: post_msg
    }

    try {
      var resp = await fetch(url, options);
      if (!resp.ok) {
        if (resp.status === 401) {
          return { ok: false, code: resp.status, 'err': 'Unauthorized' };
        } else if (resp.status === 404) {
          return { ok: false, code: resp.status, 'err': resp.statusText };
        }
      } else if (resp.status === 207) {
        return { ok: true, code: resp.status, err: null }
      } else {
        return { ok: false };
      }
    } catch (e) {
      console.log(e);
      return { ok: false };
    }
  }


  async createDir(url) {
    var options = {
      method: 'MKCOL',
      headers: {
        'Authorization': this.createBasicDigest(this.uid, this.pwd)
      },
      credentials: 'omit'
    }

    try {
      var resp = await fetch(url, options);
      return { ok: resp.ok, code: resp.status, err: resp.statusText };
    } catch (e) {
      console.log(e);
      return { ok: false };
    }
  }


  async uploadFile(dir, fname, data, type) {
    var path = dir + '/' + fname;
    var url = this.base_path + encodeURI(path);

    var options = {
      method: 'PUT',
      headers: {
        'Authorization': this.createBasicDigest(this.uid, this.pwd),
        'Content-Type': type
      },
      credentials: 'omit',
      body: data
    }

    DOM.qSel('#gen-cert-ready-dlg #u_msg').innerText = fname;
    try {
      var resp = await fetch(url, options);
      return { ok: resp.ok, code: resp.status, err: resp.statusText };
    } catch (e) {
      console.log(e);
      return { ok: false };
    } finally {
      DOM.qSel('#gen-cert-ready-dlg #u_msg').innerText = ''
    }
  }

}


class Uploader_LDP_TLS extends Uploader {

  constructor(base_path, solid_idp) {
    super();
    if (base_path) {
      if (!base_path.endsWith('/'))
        base_path += '/';
      this.base_path = base_path;
    }
    this.LDP_RESOURCE = '<http://www.w3.org/ns/ldp#Resource>; rel="type"';
    this.solid_idp;
  }


  getDirPath(dir) {
    if (dir.startsWith('/'))
      dir = dir.substring(1);

    var url = new URL(dir, new URL(this.base_path));
    return url.href;
  }

  async createProfileDir(dir) {
    var dir_lst = encodeURI(dir).split('/');
    var path = this.base_path;

    for (var i = 0; i < dir_lst.length; i++) {
      var s = dir_lst[i];
      if (s.length > 0) {
        path += s + '/';
        var rc = await this.head(path);
        if (rc && rc.ok) {
          continue;
        }
        else {
          var rc;

          if (solid_idp)
            rc = await this.createDir_solid(path);
          else
            rc = await this.createDir(path);

          if (!rc.ok)
            return rc;
        }
      }
    }
    return { ok: true };
  }



  async head(url) {
    var options = {
      method: 'HEAD',
      headers: {
        'webid-tls': 'true'
      },
      credentials: 'include'
    }

    try {
      var resp = await fetch(url, options);
      if (!resp.ok) {
        if (resp.status === 401) {
          return { ok: false, code: resp.status, 'err': 'Unauthorized' };
        } else if (resp.status === 404) {
          return { ok: false, code: resp.status, 'err': resp.statusText };
        }
      } else if (resp.status === 200) {
        return { ok: true, code: resp.status, err: null }
      } else {
        return { ok: false };
      }
    } catch (e) {
      console.log(e);
      return { ok: false };
    }
  }


  async createDir(url) {
    var rc;
    var options = {
      method: 'PUT',
      headers: {
        'webid-tls': 'true'
      },
      credentials: 'include'
    }

    url = url + '.dummy'
    try {
      var resp = await fetch(url, options);
      rc = { ok: resp.ok, code: resp.status, err: resp.statusText };
      if (!resp.ok)
        return rc;
    } catch (e) {
      console.log(e);
      return { ok: false };
    }

    options.method = 'DELETE';
    try {
      var resp = await fetch(url, options);
      return { ok: resp.ok, code: resp.status, err: resp.statusText };
    } catch (e) {
      console.log(e);
      return { ok: false };
    }
  }


  async createDir_solid(url) {
    var rc;
    var options = {
      method: 'POST',
      headers: {
        'webid-tls': 'true',
        'Link': this.LDP_DIR,
        'Slug': '.dummy',
        'Content-type': 'text/turtle'
      },
      credentials: 'include'
    }

    try {
      var resp = await fetch(url, options);
      return { ok: resp.ok, code: resp.status, err: resp.statusText };
    } catch (e) {
      console.log(e);
      return { ok: false };
    }
  }

  
  async uploadFile(dir, fname, data, type) {
    var path = dir + '/' + fname;
    var url = this.base_path + encodeURI(path);

    var options = {
      method: 'PUT',
      headers: {
        'webid-tls': 'true',
        'Content-Type': type
      },
      credentials: 'include',
      body: data
    }

    DOM.qSel('#gen-cert-ready-dlg #u_msg').innerText = fname;
    try {
      var resp = await fetch(url, options);
      return { ok: resp.ok, code: resp.status, err: resp.statusText };
    } catch (e) {
      console.log(e);
      return { ok: false };
    } finally {
      DOM.qSel('#gen-cert-ready-dlg #u_msg').innerText = ''
    }
  }

}


class Uploader_OPL_LDP extends Uploader {

  constructor(uid, pwd, base_path, idp) {
    super();
    this.uid = uid;
    this.pwd = pwd;
    if (base_path) {
      if (!base_path.endsWith('/'))
        base_path += '/';
      this.base_path = base_path;
    }
    else {
      this.base_path = (idp && idp === 'opl_ldp_https') ? 'https://id.myopenlink.net/DAV/home/' : 'http://id.myopenlink.net/DAV/home/';;
      if (uid)
        this.base_path += uid + '/';
    }
    this.LDP_RESOURCE = '<http://www.w3.org/ns/ldp#Resource>; rel="type"';
    this.LDP_DIR = '<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"';
  }

  getBasePath() {
    return this.base_path;
  }

  getDirPath(dir) {
    if (dir.startsWith('/'))
      dir = dir.substring(1);

    var url = new URL(dir, new URL(this.base_path));
    return url.href;
  }

  async checkCredentials() {
    var rc = await this.head(this.base_path);
    if (rc && rc.ok)
      return true;
    else
      return false;
  }

  async checkDirExists(dir) {
    var url = this.getDirPath(dir);
    var rc = await this.head(url);
    if (rc.ok)
      return { exists: true };
    else
      return { err: rc.err };
  }

  async createProfileDir(dir) {
    var dir_lst = encodeURI(dir).split('/');
    var path = this.base_path;

    for (var i = 0; i < dir_lst.length; i++) {
      var s = dir_lst[i];
      if (s.length > 0) {
        path += s + '/';
        var rc = await this.head(path);
        if (rc && rc.ok) {
          continue;
        }
        else {
          var rc = await this.createDir(path);
          if (!rc.ok)
            return rc;
        }
      }
    }
    return { ok: true };
  }



  async head(url) {
    var options = {
      method: 'HEAD',
      headers: {
        'Authorization': this.createBasicDigest(this.uid, this.pwd)
      },
      credentials: 'omit'
    }

    try {
      var resp = await fetch(url, options);
      if (!resp.ok) {
        if (resp.status === 401) {
          return { ok: false, code: resp.status, 'err': 'Unauthorized' };
        } else if (resp.status === 404) {
          return { ok: false, code: resp.status, 'err': resp.statusText };
        }
      } else if (resp.status === 200) {
        //var data = await resp.text();
        return { ok: true, code: resp.status, err: null }
      } else {
        return { ok: resp.ok };
      }
    } catch (e) {
      console.log(e);
      return { ok: false };
    }
  }


  async createDir(url) {
    var rc;
    var options = {
      method: 'POST',
      headers: {
        'Authorization': this.createBasicDigest(this.uid, this.pwd),
        'Link': this.LDP_DIR,
        'Slug': '.dummy',
        'Content-type': 'text/turtle'
      },
      credentials: 'omit'
    }

    try {
      var resp = await fetch(url, options);
      return { ok: resp.ok, code: resp.status, err: resp.statusText };
    } catch (e) {
      console.log(e);
      return { ok: false };
    }
  }


  async uploadFile(dir, fname, data, type) {
    var path = dir + '/' + fname;
    var url = this.base_path + encodeURI(path);

    var options = {
      method: 'PUT',
      headers: {
        'Authorization': this.createBasicDigest(this.uid, this.pwd),
        'Content-Type': type
      },
      credentials: 'omit',
      body: data
    }

    DOM.qSel('#gen-cert-ready-dlg #u_msg').innerText = fname;
    try {
      var resp = await fetch(url, options);
      return { ok: resp.ok, code: resp.status, err: resp.statusText };
    } catch (e) {
      console.log(e);
      return { ok: false };
    } finally {
      DOM.qSel('#gen-cert-ready-dlg #u_msg').innerText = ''
    }
  }

}



class CardFileTpl {
  constructor(tpl, fname, type) {
    this.tpl = tpl;
    this.fname = fname;
    this.type = type;
    this.tpl_text = null;
    this.out_text = null;
    this.out_blob = null;
    this.out_base64 = null;
    this.export = true;
  }

  async load() {
    if (this.loaded)
      return true;

    var url = '/tpl/' + this.fname + (this.tpl ? '.tpl' : '');
    try {
      var resp = await fetch(url);
      if (resp.ok) {
        if (this.tpl)
          this.tpl_text = await resp.text();
        else
          this.out_blob = await resp.blob();
        this.loaded = true;
        return true;
      }
      else {
        return false;
      }
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}


class CardFileBinary extends CardFileTpl {
  constructor(fname, type) {
    super(false, fname, type);
  }
}


class CardFileBase64 extends CardFileTpl {
  constructor(fname, type) {
    super(false, fname, type);
  }


  async load() {
    if (this.loaded)
      return true;

    function arrayBufferToBase64(buffer) {
      var binary = '';
      var bytes = [].slice.call(new Uint8Array(buffer));

      bytes.forEach((b) => binary += String.fromCharCode(b));
      return window.btoa(binary);
    };

    var url = '/tpl/' + this.fname;
    try {
      var resp = await fetch(url);
      if (resp.ok) {

        var data = await resp.arrayBuffer();
        this.out_base64 = arrayBufferToBase64(data);
        this.loaded = true;
        return true;
      }
      else {
        return false;
      }
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}


class CardFileData extends CardFileTpl {
  constructor(fname, type, out_text) {
    super(false, fname, type);
    this.out_text = out_text;
    this.loaded = true;
  }

  async load() {
    return true;
  }

}
