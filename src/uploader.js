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


class Uploader {
  constructor() {
    this.files = {};
    this.uploadTimeout = 500;
    this.tpl_data = {};
  }

  create_qrcode(text) 
  {
    var errorCorrectionLevel = 'Q';
    var typeNumber = 8;
    qrcode.stringToBytes = qrcode.stringToBytesFuncs['default'];

    var qr = qrcode(typeNumber || 4, errorCorrectionLevel || 'M');
    qr.addData(text, 'Byte');
    qr.make();

    return qr.createImgTag(null, 2, 'QR code');
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
    this.files["p_none.png"] = new CardFileBinary('p_none.png', 'image/png');
    this.files["p_cal.com_32.png"] = new CardFileBinary('p_cal.com_32.png', 'image/png');
    this.files["p_carrd_32.png"] = new CardFileBinary('p_carrd_32.png', 'image/png');
    this.files["p_disha_32.png"] = new CardFileBinary('p_disha_32.png', 'image/png');
    this.files["p_facebook_32.png"] = new CardFileBinary('p_facebook_32.png', 'image/png');
    this.files["p_github_32.png"] = new CardFileBinary('p_github_32.png', 'image/png');
    this.files["p_glitch_32.png"] = new CardFileBinary('p_glitch_32.png', 'image/png');
    this.files["p_insta_32.png"] = new CardFileBinary('p_insta_32.png', 'image/png');
    this.files["p_linkedin_32.png"] = new CardFileBinary('p_linkedin_32.png', 'image/png');
    this.files["p_linktree_32.png"] = new CardFileBinary('p_linktree_32.png', 'image/png');
    this.files["p_mastodon_32.png"] = new CardFileBinary('p_mastodon_32.png', 'image/png');
    this.files["p_myopenlink_32.png"] = new CardFileBinary('p_myopenlink_32.png', 'image/png');
    this.files["p_tiktok_32.png"] = new CardFileBinary('p_tiktok_32.png', 'image/png');
    this.files["p_twitter_32.png"] = new CardFileBinary('p_twitter_32.png', 'image/png');

    this.files["addrbook.png"] = new CardFileBinary('addrbook.png', 'image/png');
    this.files["qrcode.js"] = new CardFileBinary('qrcode.js', 'text/javascript');
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

      if (this.uploadTimeout > 0)
        await this.timeout(500);
    }
    return true;
  }


  getProfilesData(tpl_data, files) {
    var f = files["profile.ttl"];
    f.out_text = new TplPrep(f.tpl_text, tpl_data).tplStrSubstVal();
    tpl_data['profile_ttl'] = f.out_text;

    f = files["prof_jsonld"];
    f.out_text = new TplPrep(f.tpl_text, tpl_data).tplStrSubstVal();
    tpl_data['json_ld'] = f.out_text;

    f = files["prof_microdata"];
    f.out_text = new TplPrep(f.tpl_text, tpl_data).tplStrSubstVal();
    tpl_data['microdata'] = f.out_text;

    f = files["prof_rdfa"];
    f.out_text = new TplPrep(f.tpl_text, tpl_data).tplStrSubstVal();
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

    if (certData.ca_fname && certData.ca_fname.length > 0) {
      var ca_cert_url = dir_url + certData.ca_fname+'#this';
      tpl_data['ca_cert_url'] = ca_cert_url;
    }

    if (this.manual_card_url) {
      try {
        let card = new URL(this.manual_card_url);
        let card_ident = new URL(this.manual_card_url);
        if (card_ident.hash.length <= 1)
          card_ident.hash = "identity";

        card.hash = '';

        certData.card = card.toString();
        certData.card_ident = card_ident.toString();
      } catch(e) {
        certData.card = dir_url + this.files["index.html"].fname;
        certData.card_ident = certData.card + '#identity';
      }
      tpl_data['card_url'] = certData.card;
      tpl_data['card_ident_url'] = certData.card_ident;
    }
    else {
      certData.card = tpl_data['card_url'] = dir_url + this.files["index.html"].fname;
      certData.card_ident = tpl_data['card_ident_url'] = certData.card + '#identity';
    }

    if (gen.relList && gen.relList.length > 0) {
      var s_ttl = '';
      var s_rdfa = '';
      var s_rdfa_schema = '';
      var s_json = '';
      var s_micro = '';
      var s_micro_schema = '';
      var s_rdf = '';
      var s_rdf_schema = '';
      var s_html = '';
      var s_header = '';

      for(var i=0; i < gen.relList.length; i++) {
        const r_url = gen.relList[i].v;
        const r_type = gen.relList[i].type;
        var nl = (i==gen.relList.length-1) ? '' : '\n';
        s_ttl += `	<${r_url}#identity> ,${nl}`;

        s_json += '        {\n'
                 +`          "@id": "${r_url}#identity"\n`
                 +`        },${nl}`;

        s_rdfa += `    <div rel="owl:sameAs" resource="${r_url}#identity"></div>${nl}`;
        s_rdfa_schema += `    <div rel="schema:sameAs" resource="${r_url}#identity"></div>${nl}`;
        s_micro += `    <link itemprop="http://www.w3.org/2002/07/owl#sameAs" href="${r_url}#identity" />${nl}`;
        s_micro_schema += `    <link itemprop="http://schema.org/sameAs" href="${r_url}#identity" />${nl}`;
        s_rdf += `        <owl:sameAs rdf:resource="${r_url}"/>\n`;
        s_rdf_schema += `        <schema:sameAs rdf:resource="${r_url}"/>\n`;

        s_header += `<link rel="me" href="${r_url}" />${nl}`;

        var p_image = '';
        var p_alt = ''
        switch(r_type) {
          case 'ca': p_image = 'p_cal.com_32.png';    p_alt='Cal.com'; break;
          case 'cr': p_image = 'p_carrd_32.png';      p_alt='Carrd'; break;
          case 'di': p_image = 'p_disha_32.png';      p_alt='Disha'; break;
          case 'fb': p_image = 'p_facebook_32.png';   p_alt='Facebook'; break;
          case 'gh': p_image = 'p_github_32.png';     p_alt='Github'; break;
          case 'gl': p_image = 'p_glitch_32.png';     p_alt='Glitch'; break;
          case 'id': p_image = 'p_myopenlink_32.png'; p_alt='ID.MyOpenLink.NET'; break;
          case 'in': p_image = 'p_insta_32.png';      p_alt='Instagram'; break;
          case 'li': p_image = 'p_linkedin_32.png'; p_alt='LinkedIn'; break;
          case 'lt': p_image = 'p_linktree_32.png'; p_alt='Linktree'; break;
          case 'ma': p_image = 'p_mastodon_32.png'; p_alt='Mastodon'; break;
          case 'ti': p_image = 'p_tiktok_32.png';   p_alt='TikTok'; break;
          case 'tw': p_image = 'p_twitter_32.png';  p_alt='Twitter'; break;
          default: p_image = 'p_none.png'; break;
        }
        s_html += `		  <a href="${r_url}" target="_blank"><img src="${p_image}" alt="${p_alt}" class="rel_item"></a>\n`;

      }

      tpl_data['relList']  = s_ttl;
      tpl_data['relList_json']  = s_json;
      tpl_data['relList_rdfa']  = s_rdfa;
      tpl_data['relList_rdf']  = s_rdf;
      tpl_data['relList_micro']  = s_micro;

      tpl_data['relList_rdfa_schema']  = s_rdfa_schema;
      tpl_data['relList_rdf_schema']  = s_rdf_schema;
      tpl_data['relList_micro_schema']  = s_micro_schema;
      
      tpl_data['relList_html'] = s_html;
      tpl_data['rel_header_html'] = s_header;
    }

    const pdp_html = '';

    tpl_data['qr_card_img'] = this.create_qrcode(dir_url + this.files["index.html"].fname);
    tpl_data['qr_rdfa_img'] = this.create_qrcode(dir_url + this.files["profile_rdfa.html"].fname);

    tpl_data['ian'] = '';

    tpl_data['modulus'] = cert.publicKey.n.toString(16).toUpperCase();
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
    tpl_data['pdp_url_head'] = '';

    if (pdp_html) {
      tpl_data['pdp_url'] = pdp_html;
      tpl_data['pdp_url_head'] = `<link rel="related" href="${pdp_html}" title="Related Document"  type="text/html" />`;
    }

    tpl_data['pubkey_pem_url'] = dir_url + gen.cert_name + '.crt';
    tpl_data['vcard_url'] = dir_url + this.files["vcard.vcf"].fname;
    tpl_data['prof_url'] = dir_url + this.files["profile.ttl"].fname;
    tpl_data['pubkey_url'] = dir_url + this.files["public_key.ttl"].fname;
    tpl_data['cert_url'] = dir_url + this.files["certificate.ttl"].fname;

    tpl_data['jsonld_prof_url'] = dir_url + this.files["prof_jsonld"].fname;
    tpl_data['jsonld_cert_url'] = dir_url + this.files["certificate.jsonld"].fname;
    tpl_data['jsonld_pubkey_url'] = dir_url + this.files["public_key.jsonld"].fname;
    tpl_data['rdfa_prof_url'] = dir_url + this.files["profile_rdfa.html"].fname;
    tpl_data['rdfa_cert_url'] = dir_url + this.files["certificate.rdfa.html"].fname;
    tpl_data['rdfa_pubkey_url'] = dir_url + this.files["public_key.rdfa.html"].fname;

    tpl_data['qr_card_url'] = '';
    tpl_data['qr_rdfa_url'] = '';

    tpl_data['pdp_mail'] = email;
    var md = forge.md.sha1.create();
    md.start();
    md.update(email);
    var digest = md.digest();
    tpl_data['pdp_mail_sha1'] = toHex(digest);


    md = forge.md.sha1.create();
    md.start();
    md.update(certData.der);
    digest = md.digest();
    tpl_data['fingerprint'] = toHex(digest);
    tpl_data['fingerprint_colon'] = toHex(digest, ':');
//    tpl_data['fingerprint_ni'] = cert.fingerprint_ni;
//    tpl_data['fingerprint-digest'] = 'sha1';
    tpl_data['serial'] = cert.serialNumber;
    tpl_data['cert_base64'] = forge.util.encode64(certData.der);

    tpl_data['fingerprint_di'] = certData.fingerprint_di;
    tpl_data['fingerprint_ni'] = certData.fingerprint_ni;
    tpl_data['fingerprint_256_di'] = certData.fingerprint_256_di;
    tpl_data['fingerprint_256_ni'] = certData.fingerprint_256_ni;

    tpl_data['fingerprint_hex'] = certData.fingerprint_hex;
    tpl_data['fingerprint_256_hex'] = certData.fingerprint_256_hex;

//    var signName = forge.pki.oids[cert.signatureOid];
//    var sign = forge.util.encode64(cert.signature).replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
//    tpl_data['signature'] = 'ni:///' + signName + ';' + sign;

    md = forge.md.sha256.create();
    md.start();
    md.update(certData.der);
    digest = md.digest();
    v = forge.util.encode64(digest).replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
    tpl_data['vcard_digest_uri', "ni:///sha-256:" + v];

    this.getProfilesData(tpl_data, this.files);

    this.tpl_data = certData.tpl_data = tpl_data;

    for (var key in this.files) {
      var f = this.files[key];
      if (key === 'profile.ttl')
        console.log(key);
      if (f.tpl && f.tpl_text)
        f.out_text = new TplPrep(f.tpl_text, tpl_data).tplStrSubstVal();
    }
    return true;
  }
}


class Uploader_Manual extends Uploader {
  constructor(netid) 
  {
    super();
    this.zip = new JSZip();
    this.uploadTimeout = 0;
    this.manual_card_url = netid;
  }

  async uploadFile(dir, fname, data, type) 
  {
    if (data instanceof Blob) {
      this.zip.file(fname, data);
    } else {
      this.zip.file(fname, data);
    } 

    return {ok: true};
  }

  async genZIP_base64()
  {
    return await this.zip.generateAsync({type:"base64"});
  }

  async genZIP_base64_href()
  {
    const v = await this.zip.generateAsync({type:"base64"});
    return "data:application/zip;base64,"+v;
  }

}



class Uploader_Solid_OIDC extends Uploader {
  constructor(oidc, base_path) {
    super();
    this.gOidc = oidc;
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
      var resp = await this.gOidc.fetch(url, options);
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
      var resp = await this.gOidc.fetch(url, options);
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

  constructor(uid, pwd, idp) {
    super();
    this.uid = uid;
    this.pwd = pwd;

    var base_path = (idp && idp === 'opl_dav_https') ? 'https://id.myopenlink.net/DAV/home/' : 'http://id.myopenlink.net/DAV/home/';;

    if (uid)
      this.base_path = base_path + uid + '/';
    else
      this.base_path = base_path;
  }

  getBasePath() {
    return this.base_path;
  }

  getDirPath(dir) {
    if (dir.startsWith('/'))
      dir = dir.substring(1);

    var url = new URL(dir, new URL(this.base_path));
    var path = url.href;
    if (path.endsWith('/'))
      path = path.substring(0, path.length-1);
    return path;
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
    else if (rc.code == 404)
      return { exists: false };
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
    var path = url.href;
    if (path.endsWith('/'))
      path = path.substring(0, path.length-1);
    return path;
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

  constructor(uid, pwd, idp) {
    super();
    this.uid = uid;
    this.pwd = pwd;

    var base_path = (idp && idp === 'opl_ldp_https') ? 'https://id.myopenlink.net/DAV/home/' : 'http://id.myopenlink.net/DAV/home/';

    if (uid)
      this.base_path = base_path + uid + '/';
    else
      this.base_path = base_path;
    
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
    var path = url.href;
    if (path.endsWith('/'))
      path = path.substring(0, path.length-1);
    return path;
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


class Uploader_AWS_S3 extends Uploader {
  constructor(bucket, path, acc_key, sec_key) {
    super();
    if (path.endsWith('/'))
      path = path.substring(0, path.length-1);

    this.path = path;
    this.bucket = bucket;
    this.acc_key = acc_key;
    this.sec_key = sec_key;
    this.s3 = null;

    try {
      this.s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        accessKeyId: acc_key,
        secretAccessKey: sec_key
      });
    } catch(e) { }
  }

  async checkCredentials() {
    try {
      return await this._listBuckets();
    } catch(e) {
      return null;
    }
  }

  async checkDirExists(dir) {
    try {
      var lst = await this._listBuckets();
      var exists = false;
      for(var id of lst) {
        if (id === this.bucket) {
          exists = true;
          break;
        }
      }
      if (exists) {
        exists = false;
        lst = await this._listDirs();
        for(var id of lst) {
          if (id === dir) {
            exists = true;
            break;
          }
        }
      }
      return {exists};
    } catch(e) {
      return {err: e.toString()};
    }
  }

  
  getDirPath(dir) {
    if (dir.startsWith('/'))
      dir = dir.substring(1);
    var url = new URL(dir, new URL('https://'+this.bucket+'.s3.amazonaws.com'+'/'+dir));
    var path = url.href;
    if (path.endsWith('/'))
      path = path.substring(0, path.length-1);
    return path;
  }

  async createProfileDir(dir) {
    try {
      var lst = await this._listBuckets();
      var exists = false;
      for(var id of lst) {
        if (id === this.bucket) {
          exists = true;
          break;
        }
      }

      if (!exists) {  //create Blob
        await this._createBucket(this.bucket);
      }
      //Don't neet create dir for AWS S3, the Dir is just a prefix for filename.
      return {ok: true};
    } catch (e) {
      return { err: e};
    }
  }

  async uploadFile(dir, fname, data, type) {
    DOM.qSel('#gen-cert-ready-dlg #u_msg').innerText = fname;
    try {
      var rc = await this._putObject(dir, fname, data, type);
      return { ok: true };
    } catch (e) {
      return { err: e};
    } finally {
      DOM.qSel('#gen-cert-ready-dlg #u_msg').innerText = '';
    }
  }

  async _listBuckets() {
    var self = this;
    return new Promise((resolve, reject) => {
      self.s3.listBuckets( (err, data) => { 
        if (err)
          reject(err);
        else {
          var lst = [];
          for(var id of data.Buckets)
            lst.push(id.Name);

          resolve(lst); 
        }
      });
    });
  }


  async _listDirs() {
    var self = this;
    return new Promise((resolve, reject) => {
      var params = {
        Bucket: self.bucket,
        Delimiter: '/'
      };

      self.s3.listObjectsV2(params, (err, data) => {
        if (err)
          reject(err);
        else {
          var lst = [];
          for(var item of data.CommonPrefixes) {
            var dir = item.Prefix;
            lst.push(dir.substring(0, dir.length-1));
          }
          resolve(lst); 
        }
      });
    });
  }


  async _putObject(dir, fname, body, type) {
    var self = this;
    var file_name = this.path + '/'+ fname;
    return new Promise((resolve, reject) => {
      var params = {
        Body: body,
        Bucket: self.bucket,
        Key: file_name,
        ACL: "public-read",
        ContentType: type
      };

      self.s3.putObject(params, (err, data) => {
        if (err)
          reject(err);
        else
          resolve(data); 
      });
    });
  }

  async _deleteObject(bucket, key) {
    var self = this;
    return new Promise((resolve, reject) => {
      var params = {
        Bucket: bucket,
        Key: key
      };

      self.s3.deleteObject(params, (err, data) => {
        if (err)
          reject(err);
        else
          resolve(data); 
      });
    });
  }

  async _deleteObjects(bucket, keys) {
    var self = this;
    lst = [];
    for(var id of keys) {
      lst.push = {Key: id};
    }

    return new Promise((resolve, reject) => {
      var params = {
        Bucket: bucket,
        Delete: { Objects: lst, Quiet: false }
      };

      self.s3.deleteObjects(params, (err, data) => {
        if (err)
          reject(err);
        else
          resolve(data); 
      });
    });
  }

  async _deleteBucket(bucket) {
    var self = this;
    return new Promise((resolve, reject) => {
      var params = {
        Bucket: bucket
      };

      self.s3.deleteBucket(params, (err, data) => {
        if (err)
          reject(err);
        else
          resolve(data); 
      });
    });
  }

  async _createBucket(bucket) {
    var self = this;
    return new Promise((resolve, reject) => {
      var params = {
        Bucket: encodeURIComponent(bucket),
        ACL: 'public-read'
      };

      self.s3.createBucket(params, (err, data) => {
        if (err)
          reject(err);
        else
          resolve(data); 
      });
    });
  }

  async _listObjects(bucket) {
    var self = this;
    return new Promise((resolve, reject) => {
      var params = {
        Bucket: bucket
      };

      self.s3.listObjectsV2(params, (err, data) => {
        if (err)
          reject(err);
        else {
          resolve(data); 
        }
      });
    });
  }

}



class Uploader_Azure extends Uploader {
  constructor(path, account, acc_key) {
    super();
    if (path.endsWith('/'))
      path = path.substring(0, path.length-1);

    this.path = path;
    this.blob = 'youid';
    this.account = account;
    if (acc_key.startsWith('?'))
      this.acc_key = acc_key;
    else
      this.acc_key = '?'+acc_key;

    this.serviceClient = null;

    try {
      this.serviceClient = new Azure.BlobServiceClient(
         `https://${this.account}.blob.core.windows.net${this.acc_key}`  //${sas}
       );
    } catch(e) { }
  }

  async checkCredentials() {
    try {
      return await this._listContainers();
    } catch(e) {
      return null;
    }
  }

  async checkDirExists(dir) {
    try {
      var lst = await this._listContainers();
      var exists = false;
      for(var id of lst) {
        if (id === this.blob) {
          exists = true;
          break;
        }
      }
      if (exists) {
        exists = false;
        lst = await this._listDirs();
        for(var id of lst) {
          if (id === dir) {
            exists = true;
            break;
          }
        }
      }
      return {exists};
    } catch(e) {
      return {err: e.toString()};
    }
  }

  
  getDirPath(dir) {
    var base = `https://${this.account}.blob.core.windows.net/`;
    var url = new URL(`${this.blob}/${dir}`, new URL(base));
    var path = url.href;
    if (path.endsWith('/'))
      path = path.substring(0, path.length-1);
    return path;
  }

  async createProfileDir(dir) {
    try {
      var lst = await this._listContainers();
      var exists = false;
      for(var id of lst) {
        if (id === this.blob) {
          exists = true;
          break;
        }
      }
      const containerClient = this.serviceClient.getContainerClient(this.blob);
      if (!exists) {  //create Blob
        await containerClient.create({access: 'blob'});
      }
      //Don't neet create dir for Azure Blob, the Dir is just a prefix for filename.
      return {ok: true};
    } catch(e) {
      return {err: e.toString()};
    }
  }

  async uploadFile(dir, fname, data, type) {
    DOM.qSel('#gen-cert-ready-dlg #u_msg').innerText = fname;
    try {
      var rc = await this._putObject(dir, fname, data, type);
      return { ok: true };
    } catch (e) {
      return { err: e};
    } finally {
      DOM.qSel('#gen-cert-ready-dlg #u_msg').innerText = '';
    }
  }

  async _listContainers() {
    var lst = [];

    for await (const blob of this.serviceClient.listContainers()) {
      lst.push(blob.name);
    }
    return lst;
  }

  async _listDirs() {
    var lst = [];
    const containerClient = this.serviceClient.getContainerClient(this.blob);

    for await (const entity of containerClient.listBlobsByHierarchy('/')) {
      if (entity.kind === "prefix") {
        var name = entity.name;
        lst.push(name.substring(0, name.length-1));
      } 
    }
    return lst;
  }


  async _putObject(dir, fname, body, type) {
    var file_name = this.path + '/'+ fname;
    const containerClient = this.serviceClient.getContainerClient(this.blob);
    const blobClient = containerClient.getBlockBlobClient(file_name);

    const len = (body instanceof Blob) ? body.size : body.length;
    const blobOptions = { blobHTTPHeaders: { blobContentType: type } };
    await blobClient.upload(body, len, blobOptions);
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


class LocalTextFile {
  constructor(fname, type) {
    this.fname = fname;
    this.type = type;
    this.text = null;
    this.loaded = false;
  }

  async load() {
    if (this.loaded)
      return true;

    try {
      var resp = await fetch(this.fname);
      if (resp.ok) {
        this.text = await resp.text();
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

            
class TplPrep {
  constructor(tpl, vals) {
    this.tpl = tpl;
    this.vals = vals;
    this.pos = 0;
  }

  _nextChar() {
    if (this.pos >= this.tpl.length)
      return '\0';
    return this.tpl[this.pos++];
  }

  _peekNextChar() {
    if (this.pos >= this.tpl.length)
      return '\0';
    return this.tpl[this.pos];
  }

  _getToken(cend) {
    var data = [];
    while(true) {
      var c = this._nextChar();
      if (c==='\0' || c===cend)
        break;
      data.push(c);
    }
    return data.join('');
  }

  _skipToDefineEnd() {
    while (true) {
      var ch = this._nextChar();
      if (ch==='!') {
        if ((ch = this._nextChar())==='!')
          if ((ch = this._nextChar())==='.')
            break;
      }
    }
  }


  tplStrSubstVal() {
    var ret = [];
    var ch;
    
    if (!this.tpl)
        return '';
    
    while (true) {
        ch = this._nextChar();
        if (ch==='\0')
            break;

        if (ch === '%') {
            var c1 = this._nextChar();
            if (c1=='{') {
                var key = this._getToken('}');
                if (key.length > 0) {
                    var v = this.vals[key];
                    if (v!==undefined)
                      ret.push(v);
                }
            }
            else {
                ret.push('%');
                ret.push(c1);;
            }
        }
        else if (ch === '!') {
            var c1 = this._nextChar();
            if (c1==='{') {
                var key = this._getToken('}');
                if (key.length > 0) {
                    var v = this.vals[key];
                    if (v===undefined || v.length==0) {
                        //Skip to line end
                        while(true) {
                            ch = this._nextChar();
                            if (ch==='\n' || ch==='\0')
                                break;             
                        }
                    }
                }
            }
            else if (c1==='!') {
                var c2 = this._nextChar();
                if (c2==='{') {
                    var key = this._getToken('}');
                    if (key.length > 0) {
                        var v = this.vals[key];
                        if (v===undefined || v.length==0) {
                            //Skip to define end  !!.
                            this._skipToDefineEnd();
                        }
                    }
                }
                else if (c2==='.') {
                    // skip
                }
                else {
                    ret.push('!!');
                    ret.push(c2);
                }
            }
            else {
                ret.push('!');
                ret.push(c1);
            }
        }
        else {
            ret.push(ch);
        }
        
    }
    
    return ret.join('');
  }
}

