/*
 *  This file is part of the OpenLink Software OpenLink Software Personal Assistant project.
 *
 *  Copyright (C) 2024 OpenLink Software
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

class AuthClient {
    constructor (token) {

        var lut = []; for (var i=0; i<256; i++) { lut[i] = (i<16?'0':'')+(i).toString(16); }
        function genUUID()
        {
           var d0 = Math.random()*0xffffffff|0;
           var d1 = Math.random()*0xffffffff|0;
           var d2 = Math.random()*0xffffffff|0;
           var d3 = Math.random()*0xffffffff|0;
           return lut[d0&0xff]+lut[d0>>8&0xff]+lut[d0>>16&0xff]+lut[d0>>24&0xff]+'-'+
             lut[d1&0xff]+lut[d1>>8&0xff]+'-'+lut[d1>>16&0x0f|0x40]+lut[d1>>24&0xff]+'-'+
             lut[d2&0x3f|0x80]+lut[d2>>8&0xff]+'-'+lut[d2>>16&0xff]+lut[d2>>24&0xff]+
             lut[d3&0xff]+lut[d3>>8&0xff]+lut[d3>>16&0xff]+lut[d3>>24&0xff];
        }

        this.token = token;
        this.session = { info: { sessionId: genUUID(), isLoggedIn: true }, };
    }

   fetch (resource, options = {}) {
       options.headers = { 
           ...options.headers,
           'Authorization': 'Bearer '+ this.token,
       };
       return fetch(resource, options);
   }

   getDefaultSession() {
       return this.session;
   }

   handleIncomingRedirect() {
       return undefined;
   }
}
