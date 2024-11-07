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

class OpalX {
    constructor (authClient = null, host = null, cb = null, ecb = null, data = {}) {
        let pageUrl = new URL(window.location);
        let thisHost = host ? host : pageUrl.host;
        this.version = 1.1;
        this.messages_sent = 0;
        this.authClient = authClient ? authClient : solidClientAuthentication?.default;
        this.session = this.authClient ? this.authClient.getDefaultSession() : undefined;
        this.wsUrl = new URL('wss://' + thisHost + '/ws/assistant');
        this.apiBaseUrl = 'https://' + thisHost + '/chat/api/';
        this.model = data?.model ? data.model : 'gpt-4';
        this.top_p = data?.top_p ? data.top_p : 0.5;
        this.temperature = data?.temperature ? data.temperature : 0.2;
        this.apiKey = data?.apiKey ? data.apiKey : null;
        this.supportedAudioType = data?.audio_media_type ? data?.audio_media_type : null;
        this.ws = undefined;
        this.assistants = [];
        this.files = [];
        this.images = [];
        this.thread_id = undefined;
        this.run_id = undefined;
        this.assistant_id = data?.assistant;
        this.promtInProgress = false;
        this.functions = data?.functions ? data.functions : [];
        this.messageCallback = typeof cb === 'function' ? cb : stubCallback;
        this.errorCallback = typeof ecb === 'function' ? ecb : stubError;
    }

    stubCallback (kind, data) {
        // do nothing
    }

    stubError(error) {
        throw(error);
    }

    async authenticate () {
        let url = new URL('chatAuthenticate', this.apiBaseUrl);
        let params = new URLSearchParams(url.search);
        params.append('session_id', this.session.info.sessionId);
        url.search = params.toString();
        this.authClient.fetch (url.toString(), { headers: { 'X-OPAL-Version': this.version, }, }).then((resp) => {
            if (resp.ok) {
                return resp.json();
            }
            throw Error ('Can not authenticate');
        }).then((data) => {
            if (data.apiKeyRequired) {
                this.errorCallback('Your login is not authorized to ask OPAL');
            }
        });
    }

    async connect () {
        if (!this.session?.info?.isLoggedIn) {
            throw Error ('Not logged-in');
        }
        let params = new URLSearchParams();
        params.append ('sessionId',this.session.info.sessionId);
        this.wsUrl.search = params.toString();
        this.ws = new WebSocket (this.wsUrl.toString ());

        this.ws.onopen = this.onOpen.bind(this);
        this.ws.onclose = this.onClose.bind(this);
        this.ws.onmessage = this.onMessage.bind(this);
        this.ws.onerror = this.onError.bind(this);
        this.loadAssistants();
    }

    onOpen (event) {
        this.authenticate().then(() => this.getThread()).catch ((error) => this.errorCallback(error));
    }

    onClose (event) {
        this.ws = undefined;
        this.thread_id = undefined;
        this.promtInProgress = false;
    }

    onMessage (event) {
        try {
            let obj = JSON.parse(event.data);
            if ('info' === obj.kind) {
                this.run_id = obj.data.run_id;
            }
            this.promtInProgress = true;
            this.messageCallback(obj.kind, obj.data);
            if ('function' === typeof(obj.data.trim) && (obj.data.trim() === '[DONE]' || obj.data.trim() === '[LENGTH]')) {
                this.promtInProgress = false;
                this.run_id = undefined;
                if (!this.thread_id) {
                    this.getThread();
                }
            }
        } catch (e) {
            this.promtInProgress = false;
            this.errorCallback(e);
        }
    }

    onError (event) {
        this.promtInProgress = false;
        this.errorCallback('Connection error')
    }

    async getThread() {
        let url = new URL('threads', this.apiBaseUrl);
        let params = new URLSearchParams(url.search);
        params.append('session_id', this.session.info.sessionId);
        params.append('apiKey', this.apiKey ? this.apiKey : '');
        url.search = params.toString();
        this.authClient.fetch (url.toString(), { method: 'POST', headers: { 'X-OPAL-Version': this.version, }, }).then((resp) => {
            if (resp.status != 200) {
                throw Error ('Can not get thread');
            }
            return resp.text();
        }).then((thread_id) => {
            this.thread_id = thread_id;
        });
    }

    getPromptId () {
        return Math.random().toString(36).replace('0.','usr-');
    }

    async send(text, options = null) {
        let prompt_id = this.getPromptId();
        text = text ? text.trim() : null;
        if (!text || !text.length) {
            return;
        }
        if (!this.thread_id) {
            let error_message = this.session?.info && !this.session?.info.isLoggedIn ? 'You are not logged in' :
                'The chat session is not established';
            this.errorCallback (error_message);
            return;
        }
        let thread_id = this.thread_id;
        let assistant_id = this.assistant_id;
        let request = {
            type: 'user',
            prompt: text,
            thread_id: thread_id,
            assistant_id: assistant_id,
            model: this.model,
            functions: this.functions,
            apiKey: this.apiKey,
            temperature: this.temperature,
            top_p: this.top_p,
            prompt_id: prompt_id,
            files: this.files,
            images: this.images,
            image_resolution: options?.image_resolution != undefined ? options.image_resolution : null,
            max_tokens: options?.max_tokens != undefined ? options.max_tokens : null,
        };
        this.ws.send(JSON.stringify(request));
        this.messages_sent++;
        this.images = [];
        this.files = [];
    }

    async stop() {
        let url = new URL('threads', this.apiBaseUrl);
        let params = new URLSearchParams(url.search);
        if (!this.session?.info?.isLoggedIn) {
             this.errorCallback('Not logged-in');
        }
        params.append('thread_id', this.thread_id);
        params.append('run_id', this.run_id);
        params.append('ctl', 1);
        url.search = params.toString();
        this.authClient.fetch (url.toString(), { headers: { 'X-OPAL-Version': this.version, }, }).then((resp) => {
            if (resp.ok) {
                return resp.text();
            }
            this.errorCallback('Can not stop prompt generation');
        }).then((data) => {
            return true;
        }).catch ((error) => this.errorCallback(error));
    }

    setAudioFormat(mime) {
        this.supportedAudioType = mime;
    }

    async transcibe(blob) {
        let url = new URL('voice2text', this.apiBaseUrl);
        const formData  = new FormData();
        if (!this.supportedAudioType) {
            this.errorCallback ('Supported audio format is not set.');
            return;
        }
        formData.append('format', this.supportedAudioType);
        if (null != this.apiKey) {
            formData.append('apiKey', this.apiKey);
        }
        formData.append('data', blob);
        try {
            const resp = await this.authClient.fetch (url.toString(), { method: 'POST', body: formData, headers: { 'X-OPAL-Version': this.version, }, });
            if (resp.ok) {
                let jt = await resp.json();
                let text = jt.text;
                if (text.length) {
                    this.messageCallback ('transcription', text);
                    return text;
                } else {
                    this.errorCallback ('Recording cannot be transcribed.');
                }
            } else {
                this.errorCallback ('Can not access voice transcription service ' + resp.statusText);
            }
        } catch (e) {
            this.errorCallback ('Can not access voice transcription service ' + e);
        }
    }

    async getPermaLink() {
        let url = new URL('storeThread', this.apiBaseUrl);
        let params = new URLSearchParams(url.search);
        if (!this.thread_id) {
            throw Error ('No active chat session.');
        }
        params.append('thread_id', this.thread_id);
        params.append('apiKey', this.apiKey ? this.apiKey : '');
        url.search = params.toString();
        try {
            let resp = await this.authClient.fetch (url.toString(), { headers: { 'X-OPAL-Version': this.version, }, });
            if (resp.ok) {
                let share_id = await resp.text();
                let linkUrl = new URL('/assist/', this.apiBaseUrl);
                linkUrl.search = 'share_id=' + share_id;
                return linkUrl.toString();
            } else {
                this.errorCallback ('Can not get Permalink ' + resp.statusText);
            }
        } catch (e) {
            this.errorCallback ('Can not get Permalink ' + e);
        }
    }

    async addFile(name, type, blob, purpose = 'assistants') {
        let url = new URL('files', this.apiBaseUrl);
        let params = new URLSearchParams(url.search);
        const formData  = new FormData();
        params.append('thread_id', this.thread_id);
        params.append('apiKey', this.apiKey ? this.apiKey : '');
        formData.append('name', name);
        formData.append('format', type);
        formData.append('purpose', purpose);
        formData.append('data', blob);
        url.search = params.toString();
        const file_id = await this.authClient.fetch(url.toString(), { method:'POST', body: formData }).
            then((resp)=>{
                if (!resp.ok) {
                    throw new Error(resp.statusText);
                }
                return resp.text();
            }).
            catch((e)=>{ 
                this.errorCallback ('Can not upload file ' + e);
            });
        if ('assistants' === purpose) {
            this.files.push(file_id);
        } else if ('vision' === purpose) {
            this.images.push(file_id);
        }
        return file_id;
    }

    async deleteFile(file_id) {
        let url = new URL('files', this.apiBaseUrl);
        let params = new URLSearchParams(url.search);
        params.append('thread_id', this.thread_id);
        params.append('file_id', file_id);
        params.append('apiKey', this.apiKey ? this.apiKey : '');
        url.search = params.toString();
        await this.authClient.fetch(url.toString(), { method:'DELETE' }).then((resp) => {
            if (resp.status != 204) {
                throw new Error (resp.statusText);
            }
            this.files = this.files.filter(item => item !== file_id);
            this.images = this.images.filter(item => item !== file_id);
        }).catch((e) => {
            this.errorCallback('Delete failed: ' + e);
        });
    }


    async loadAssistants() {
        try {
            const url = new URL('assistants', this.apiBaseUrl);
            await fetch (url.toString()).then (resp => {
                if (resp.ok) {
                    return resp.json();
                } else {
                    throw new Error(resp.statusText);
                }
            }).then(items => {
                this.assistants = items;
            });
        } catch (e) {
            this.errorCallback('Can not get Assistants:' + e);
        }
    }

    getAssistants() {
        return this.assistants;
    }

    setAssistant(assistant_id) {
        this.assistant_id = assistant_id;
    }

    async share (mode) {
        if (typeof ClipboardItem != 'undefined') {
            const clipboardItem = new ClipboardItem({ 'text/plain': this.getPermaLink().then((url) => {
                if (!url) {
                    throw Error ('Can not get permalink');
                }
                return new Promise(async (resolve) => {
                    resolve(new Blob([url],{ type:'text/plain' }))
                })
            }),
            });
            navigator.clipboard.write([clipboardItem]).then(() => { this.messageCallback('notice', 'Permalink to the chat copied.'); },
                                                            () => { this.errorCallback('Permalink copy failed.'); },);
        }
        else if (navigator.clipboard.writeText != 'undefined') {
            this.getPermaLink().then ((text) => {
                navigator.clipboard.writeText(text).then(() => { this.messageCallback('notice', 'Permalink to the chat copied.'); },
                                                         () => { this.errorCallback('Permalink copy failed.'); },);
            });
        } else {
            this.errorCallback('Your browser does not support this function.');
        }
    }

    async close() {
        this.ws.close();
        this.thread_id = undefined;
    }
}

