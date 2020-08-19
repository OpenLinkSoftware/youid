/*
 * Copyright 2011 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This script serves as an intermediary between oauth2.html and oauth2.js.

var views = chrome.extension.getViews();
for (var i = 0, view; view = views[i]; i++) {
   if (view['youid_pdp_oauth'] && view['youid_pdp_oauth_mode']) {
     var adapterName = view['youid_pdp_oauth'];
     var oauth_mode = view['youid_pdp_oauth_mode'];
//     console.log(adapterName);
     if (oauth_mode == 2) {
       var finisher = new OAuth2(adapterName, OAuth2.FINISH);
     } else {
       var finisher = new OAuth1(adapterName, OAuth1.FINISH);
     }
   }
}
