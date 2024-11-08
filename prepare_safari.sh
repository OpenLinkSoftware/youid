#!/bin/bash
EXT_DIRNAME=./Safari/Shared\ \(Extension\)/Resources


export SRC_DIR=./
export DST_DIR="./Safari/Shared (Extension)/Resources"

#copy info files
for I_DIR in AUTHORS COPYING CREDITS; do
  cp -va $SRC_DIR/$I_DIR "$DST_DIR/"
done


SRC_DIR=./src


#copy common files                                       
for I_DIR in background.html background.js cert_manual.js certificate.js content-script.js countries.js; do
  cp -va $SRC_DIR/$I_DIR "$DST_DIR/"
done

for I_DIR in OidcWebid.js oidc-webid-inject.js options.css options.html options.js; do
  cp -va $SRC_DIR/$I_DIR "$DST_DIR/"
done

for I_DIR in popup.css popup.html popup.js settings.js uploader.js utils.js webrequest.js youid_view.js; do
  cp -va $SRC_DIR/$I_DIR "$DST_DIR/"
done


#copy Firefox related files
cp -va $SRC_DIR/manifest.json.sf "$DST_DIR/manifest.json"
cp -va $SRC_DIR/browser_sf.js "$DST_DIR/browser.js"

for I_DIR in fonts images lib oauth2 tpl; do
  mkdir -pv "$DST_DIR/$I_DIR"
  tar --exclude 'original' -cf - -C $SRC_DIR/$I_DIR .|tar -xf - -C "$DST_DIR/$I_DIR"
done

rm "$DST_DIR/lib/solid-client-authn.bundle.js.map"

