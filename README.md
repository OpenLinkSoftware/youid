# OpenLink YouID Browser Extension

YouID is a simple — but powerful — system for generating, managing, and 
controlling Web- and Internet-scale verifiable identity that's totally 
controlled by you. It makes you the master curator of your profile data 
and associated content indexes, without compromising your privacy.

## Intro

The YouID browser extension (currently for for 
[Google Chrome](http://www.google.com/chrome/browser/),
[Mozilla Firefox](http://www.mozilla.org/firefox/) and 
[Opera](http://www.opera.com/)) 
enables you to register and switch Web Identities (WebIDs) across 
a single HTTPS (TLS) session without restarting your browser. Each 
WebID is a hyperlink that both identifies an application user and 
resolves to a user profile document containing claims (readable by 
both machines and humans) that are verifiable using existing Public 
Key Infrastructure (PKI) standards.

Support for additional browsers like
[Apple Safari](http://www.apple.com/safari/) and
[Microsoft Edge](https://www.microsoft.com/microsoft-edge)
is under investigation.

## License
Copyright © 2013-2017 [OpenLink Software](mailto:opensource@openlinksw.com)

This software is licensed under the GNU General Public License (see
[`COPYING`](https://github.com/OpenLinkSoftware/youid/blob/master/COPYING)).

**Note**: that the only valid version of the GPL license as far as this project is concerned is the
original GNU General Public License Version 2, dated June 1991.

## Deployment
To deploy this extension on your local machine you can either *clone the git source tree* or
*download a source archive* and then *install the extension* into your browser on
the same system.

### Clone the git source tree
Clone the sources from github using the following commands, which will automatically download the latest develop branch.
```shell
$ cd src
$ git clone https://github.com/OpenLinkSoftware/youid
```


### Download a source archive
Download and extract a `.tar.gz` or `.zip` from one of the
[stable releases](https://github.com/OpenLinkSoftware/youid/releases/latest)
or directly from one of the following links:

- [latest stable `.tar.gz`](https://github.com/OpenLinkSoftware/youid/archive/master.tar.gz)
- [latest stable `.zip`](https://github.com/OpenLinkSoftware/youid/archive/master.zip)
- [latest development `.tar.gz`](https://github.com/OpenLinkSoftware/youid/archive/develop.tar.gz)
- [latest development `.zip`](https://github.com/OpenLinkSoftware/youid/archive/develop.zip)

### Install the extension in Chrome
To install this extension manually use the following steps:

- Open the Chrome browser
- Select from menu: **Chrome** → **Preferences** → **Extensions**
- Tick the checkbox for **Developer mode** 
- Choose the option **Load unpacked extension...**
- Navigate to the folder containing the extracted source code
- Press the **Select** button

### Install the extension in Opera
To install this extension manually use the following steps:

- Open the Opera browser
- In address bar type in **opera:extensions**
- Press the **Developer Mode** button
- Choose the option **Load unpacked extension...**
- Navigate to the folder containing the extracted source
- Press the **Select** button

### Install the extension in Firefox
Download the [Firefox YouID `.zip`](https://github.com/OpenLinkSoftware/youid/releases/download/)
file and extract the `.xpi` file.

To install this extension manually in Firefox v28+, use the following steps:
- Open the **Firefox** browser
- In address bar type: **`about:config`**
- Press the **I'll be careful, i promise** button
- Search for **`xpinstall.signatures.required`**
- Double click that line so the value is set to **`false`**
- In address bar type: **`about:addons`**
- Click on the Gear icon and select **Install Add-On from file...** from the menu
- Navigate to the directory where you extracted the `YouID_FF.xpi` file, 
  select this file, and press the **Open** button
- Press the **Install** button
