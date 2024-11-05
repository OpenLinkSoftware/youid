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
        this.token = token;
        this.session = { info: { sessionId: crypto.randomUUID(), isLoggedIn: true }, };
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
