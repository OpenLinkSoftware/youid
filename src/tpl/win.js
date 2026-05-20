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


function dragElement(el, elHeader) 
{
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    var vpH = 0, vpW = 0;


    if (elHeader) {
      // if present, the header is where you move the DIV from:
      elHeader.onmousedown = onMouseDown;
    } else {
      // otherwise, move the DIV from anywhere inside the DIV:
      el.onmousedown = onMouseDown;
    }

    function onMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      el.style.cursor = "move";
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;

      vpWH = getViewPortWidthHeight();
      vpW = vpWH[0];
      vpH = vpWH[1];

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }

    function onMouseMove(e) {
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      var top = (el.offsetTop - pos2);
      var left = (el.offsetLeft - pos1);

      top = top<0? 0: top;
      top = top>vpH-20? vpH-20: top;
      left = left<0? 0: left;
      left = left>vpW-30? vpW-30: left;

      el.style.top = top + "px";
      el.style.left = left + "px";
    }

    function onMouseUp() {
      // stop moving when mouse button is released:
      el.style.cursor = "auto";
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }
}


function makeResizable(el, elResizer, min_width=400, min_height=150) 
{
    var orig_height = 0;
    var orig_width = 0;
    var orig_mouse_x = 0;
    var orig_mouse_y = 0;
    var mode = "";

    el.addEventListener("mousedown", (e) => {
      if (e.offsetX > el.offsetWidth - 5) {
        orig_width = parseFloat(getComputedStyle(el, null).getPropertyValue('width').replace('px', ''));
        orig_mouse_x = e.pageX;
        document.body.style.cursor = "ew-resize";
        mode = "ew"

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      } 
      else if (e.offsetY > el.offsetHeight - 5) {
        orig_height = parseFloat(getComputedStyle(el, null).getPropertyValue('height').replace('px', ''));
        orig_mouse_y = e.pageY;
        document.body.style.cursor = "ns-resize";
        mode = "ns"

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      }
    });

    elResizer.onmousedown = (e) => {
        e.preventDefault();
        orig_width = parseFloat(getComputedStyle(el, null).getPropertyValue('width').replace('px', ''));
        orig_height = parseFloat(getComputedStyle(el, null).getPropertyValue('height').replace('px', ''));
        orig_mouse_x = e.pageX;
        orig_mouse_y = e.pageY;

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }
    
    function onMouseMove(e) {
      if (mode==="ew")
        el.style.width = Math.max(orig_width + (e.pageX - orig_mouse_x), min_width) + 'px';
      else if (mode==="ns")
        el.style.height = Math.max(orig_height + (e.pageY - orig_mouse_y), min_height) + 'px';
      else {
        el.style.width = Math.max(orig_width + (e.pageX - orig_mouse_x), min_width) + 'px';
        el.style.height = Math.max(orig_height + (e.pageY - orig_mouse_y), min_height) + 'px';
      }
    }
    
    function onMouseUp() {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = "default";
      mode = "";
    }
}


function getViewPortWidthHeight()
{
    var viewPortWidth;
    var viewPortHeight;

    // the more standards compliant browsers (mozilla/netscape/opera/IE7)
    // use window.innerWidth and window.innerHeight
    if (typeof window.innerWidth != 'undefined')
    {
      viewPortWidth = window.innerWidth;
      viewPortHeight = window.innerHeight;
    }
    
    return [viewPortWidth, viewPortHeight];
}

