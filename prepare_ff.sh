#!/bin/bash
EXT_DIRNAME=./YouID_FF
EXT_SRC=./src

rm -rf $EXT_DIRNAME

mkdir -pv $EXT_DIRNAME


SRC_DIR=./
DST_DIR=$EXT_DIRNAME

#copy info files
for I_DIR in AUTHORS COPYING CREDITS; do
  cp -va $SRC_DIR/$I_DIR $DST_DIR/
done


SRC_DIR=$EXT_SRC
DST_DIR=$EXT_DIRNAME

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



cp -va $SRC_DIR/browser_ff.js    $DST_DIR/browser.js
cp -va $SRC_DIR/manifest.json.ff $DST_DIR/manifest.json


for I_DIR in fonts images lib tpl oauth2; do
  mkdir -pv $DST_DIR/$I_DIR
  tar --exclude 'original' -cf - -C $SRC_DIR/$I_DIR .|tar -xf - -C $DST_DIR/$I_DIR
done

