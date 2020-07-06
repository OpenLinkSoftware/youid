/*
 *  This file is part of the OpenLink Structured Data Sniffer
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

(function(){

  function sniff_data()
  {
    var idata = {ttl:[], ldjson:[], rdfxml:[]}
    var all = document.getElementsByTagName('script');
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
    return idata;
  }

  function frame_getSelectionString(el, win) 
  {
    win = win || window;
    var doc = win.document, sel, range, prevRange, selString;

    if (win.getSelection && doc.createRange) {
        sel = win.getSelection();
        if (sel && sel.rangeCount) {
          prevRange = sel.getRangeAt(0);
        }
        range = doc.createRange();
        range.selectNodeContents(el);
        sel.removeAllRanges();
        sel.addRange(range);
        selString = sel.toString();
        sel.removeAllRanges();
        prevRange && sel.addRange(prevRange);
    } 
    else if (doc.body.createTextRange) {
        range = doc.body.createTextRange();
        range.moveToElementText(el);
        range.select();
    }
    return selString;
  }




  function recvMessage(event)
  {
    var ev_data;

    if (String(event.data).lastIndexOf("youid_sniff:",0)!==0) 
      return;

    try {
      ev_data = JSON.parse(event.data.substr(12));
    } catch(e) {
      console.log(e);
    }

  
    if (ev_data && ev_data.sniff) {
       var txt = document.body.innerText;

       if (txt === undefined || (txt!==null && txt.length==0))
         txt = frame_getSelectionString(document.body);

       txt = txt? txt : " ";

       idata = sniff_data();
       idata.txt = txt;
       idata.popup = ev_data.popup;

       var url = new URL(document.baseURI);
       url.hash = '';
       idata.baseURI = url.toString();

       Browser.api.runtime.sendMessage({sendBack:true, idata});
    }
  }


window.addEventListener("message", recvMessage, false);

})();