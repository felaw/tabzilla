/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */

/**
 * Tabzilla global navigation for Mozilla projects
 *
 * This code is licensed under the Mozilla Public License 1.1.
 *
 * Event handling portions adapted from the YUI Event component used under
 * the following license:
 *
 *   Copyright © 2012 Yahoo! Inc. All rights reserved.
 *
 *   Redistribution and use of this software in source and binary forms,
 *   with or without modification, are permitted provided that the following conditions
 *   are met:
 *
 *   - Redistributions of source code must retain the above copyright notice,
 *     this list of conditions and the following disclaimer.
 *   - Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *   - Neither the name of Yahoo! Inc. nor the names of YUI's contributors may
 *     be used to endorse or promote products derived from this software
 *     without specific prior written permission of Yahoo! Inc.
 *
 *   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 *   "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 *   TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 *   PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 *   CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *   EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *   PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *   PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 *   LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *   NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *   SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * Portions adapted from the jQuery Easing plugin written by Robert Penner and
 * used under the following license:
 *
 *   Copyright 2001 Robert Penner
 *   All rights reserved.
 *
 *   Redistribution and use in source and binary forms, with or without
 *   modification, are permitted provided that the following conditions are
 *   met:
 *
 *   - Redistributions of source code must retain the above copyright notice,
 *     this list of conditions and the following disclaimer.
 *   - Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *   - Neither the name of the author nor the names of contributors may be
 *     used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 *   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 *   "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 *   TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 *   PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 *   CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *   EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *   PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *   PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 *   LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *   NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *   SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 *
 * @copyright 2012 silverorange Inc.
 * @license   http://www.mozilla.org/MPL/MPL-1.1.html Mozilla Public License 1.1
 * @author    Michael Gauthier <mike@silverorange.com>
 * @author    Steven Garrity <steven@silverorange.com>
 */

function Tabzilla()
{
    if (typeof jQuery != 'undefined' && jQuery) {
        jQuery(document).ready(Tabzilla.init);
    } else {
        Tabzilla.run();
    }
}

Tabzilla.READY_POLL_INTERVAL = 40;
Tabzilla.readyInterval = null;
Tabzilla.jQueryCDNSrc =
    '//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js';

Tabzilla.hasCSSTransitions = (function() {
    var div = document.createElement('div');
    div.innerHTML = '<div style="'
        + '-webkit-transition: color 1s linear;'
        + '-moz-transition: color 1s linear;'
        + '-ms-transition: color 1s linear;'
        + '-o-transition: color 1s linear;'
        + '"></div>';

    var hasTransitions = (
           (div.firstChild.style.webkitTransition !== undefined)
        || (div.firstChild.style.MozTransition !== undefined)
        || (div.firstChild.style.msTransition !== undefined)
        || (div.firstChild.style.OTransition !== undefined)
    );

    delete div;

    return hasTransitions;
})();

/**
 * Sets up the DOMReady event for Tabzilla
 *
 * Adapted from the YUI Event component. Defined in Tabzilla so we do not
 * depend on YUI or jQuery. The YUI DOMReady implementation is based on work
 * Dean Edwards, John Resig, Matthias Miller and Diego Perini.
 */
Tabzilla.run = function()
{
    var webkit = 0, isIE = false, ua = navigator.userAgent;
    var m = ua.match(/AppleWebKit\/([^\s]*)/);

    if (m && m[1]) {
        webkit = parseInt(m[1], 10);
    } else {
        m = ua.match(/Opera[\s\/]([^\s]*)/);
        if (!m || !m[1]) {
            m = ua.match(/MSIE\s([^;]*)/);
            if (m && m[1]) {
                isIE = true;
            }
        }
    }

    // Internet Explorer: use the readyState of a defered script.
    // This isolates what appears to be a safe moment to manipulate
    // the DOM prior to when the document's readyState suggests
    // it is safe to do so.
    if (isIE) {
        if (self !== self.top) {
            document.onreadystatechange = function() {
                if (document.readyState == 'complete') {
                    document.onreadystatechange = null;
                    Tabzilla.ready();
                }
            };
        } else {
            var n = document.createElement('p');
            Tabzilla.readyInterval = setInterval(function() {
                try {
                    // throws an error if doc is not ready
                    n.doScroll('left');
                    clearInterval(Tabzilla.readyInterval);
                    Tabzilla.readyInterval = null;
                    Tabzilla.ready();
                    n = null;
                } catch (ex) {
                }
            }, Tabzilla.READY_POLL_INTERVAL);
        }

    // The document's readyState in Safari currently will
    // change to loaded/complete before images are loaded.
    } else if (webkit && webkit < 525) {
        Tabzilla.readyInterval = setInterval(function() {
            var rs = document.readyState;
            if ('loaded' == rs || 'complete' == rs) {
                clearInterval(Tabzilla.readyInterval);
                Tabzilla.readyInterval = null;
                Tabzilla.ready();
            }
        }, Tabzilla.READY_POLL_INTERVAL);

    // FireFox and Opera: These browsers provide a event for this
    // moment.  The latest WebKit releases now support this event.
    } else {
        Tabzilla.addEventListener(document, 'DOMContentLoaded', Tabzilla.ready);
    }
};

Tabzilla.ready = function()
{
    if (!Tabzilla.DOMReady) {
        Tabzilla.DOMReady = true;

        // if we don't have CSS3 transitions, dynamically load jQuery from CDN
        if (!Tabzilla.hasCSSTransitions && typeof jQuery == 'undefined') {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = Tabzilla.jQueryCDNSrc;
            document.getElementsByTagName('body')[0].appendChild(script);
        }

        Tabzilla.init();
        Tabzilla.removeEventListener(
            document,
            'DOMContentLoaded',
            Tabzilla.ready
        );
    }
};

Tabzilla.init = function()
{
    if (!Tabzilla.hasCSSTransitions) {
        // add easing functions
        jQuery.extend(jQuery.easing, {
            'easeInOut':  function (x, t, b, c, d) {
                if (( t /= d / 2) < 1) {
                    return c / 2 * t * t + b;
                }
                return -c / 2 * ((--t) * (t - 2) - 1) + b;
            }
        });
    }

    Tabzilla.link  = document.getElementById('tabzilla');
    Tabzilla.panel = Tabzilla.buildPanel();

    // add panel as first element of body element
    var body = document.getElementsByTagName('body')[0];
    body.insertBefore(Tabzilla.panel, body.firstChild);

    // set up event listeners for link
    Tabzilla.addEventListener(Tabzilla.link, 'click', function(e) {
        Tabzilla.preventDefault(e);
        Tabzilla.toggle();
    });

    Tabzilla.$panel = jQuery(Tabzilla.panel);
    Tabzilla.$link  = jQuery(Tabzilla.link);

    Tabzilla.$panel.addClass('tabzilla-closed');
    Tabzilla.$link.addClass('tabzilla-closed');
    Tabzilla.$panel.removeClass('tabzilla-opened');
    Tabzilla.$link.removeClass('tabzilla-opened');

    Tabzilla.opened = false;
};

Tabzilla.buildPanel = function()
{
    var panel = document.createElement('div');
    panel.id = 'tabzilla-panel';
    panel.innerHTML = Tabzilla.content;
    return panel;
};

Tabzilla.addEventListener = function(el, ev, handler)
{
    if (typeof el.attachEvent != 'undefined') {
        el.attachEvent('on' + ev, handler);
    } else {
        el.addEventListener(ev, handler, false);
    }
};

Tabzilla.removeEventListener = function(el, ev, handler)
{
    if (typeof el.detachEvent != 'undefined') {
        el.detachEvent('on' + ev, handler);
    } else {
        el.removeEventListener(ev, handler, false);
    }
};

Tabzilla.toggle = function()
{
    if (Tabzilla.opened) {
        Tabzilla.close();
    } else {
        Tabzilla.open();
    }
};

Tabzilla.open = function()
{
    if (Tabzilla.opened) {
        return;
    }

    if (Tabzilla.hasCSSTransitions) {
        Tabzilla.$panel.addClass('tabzilla-opened');
        Tabzilla.$link.addClass('tabzilla-opened');
        Tabzilla.$panel.removeClass('tabzilla-closed');
        Tabzilla.$link.removeClass('tabzilla-closed');
    } else {
        // jQuery animation fallback
        jQuery(Tabzilla.panel).animate({ height: 200 }, 200, 'easeInOut');
    }

    Tabzilla.opened = true;
};

Tabzilla.close = function()
{
    if (!Tabzilla.opened) {
        return;
    }

    if (Tabzilla.hasCSSTransitions) {
        Tabzilla.$panel.removeClass('tabzilla-opened');
        Tabzilla.$link.removeClass('tabzilla-opened');
        Tabzilla.$panel.addClass('tabzilla-closed');
        Tabzilla.$link.addClass('tabzilla-closed');
    } else {
        // jQuery animation fallback
        jQuery(Tabzilla.panel).animate({ height: 0 }, 200, 'easeInOut');
    }

    Tabzilla.opened = false;
};

Tabzilla.preventDefault = function(ev)
{
    if (ev.preventDefault) {
        ev.preventDefault();
    } else {
        ev.returnValue = false;
    }
};

Tabzilla.content =
    '<div id="tabzilla-contents">'
    + '  <div id="tabzilla-promo">'
    + '    <div class="snippet">'
    + '      <!--icon:https://lh6.googleusercontent.com/-0XMee5NUGtY/TwOOY-G3CCI/AAAAAAAADO0/bIyQM5UXWSQ/w60-h75-k/snippet_androidtablet.png-->'
    + '      <img class="icon" src="data:image/png;base64,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 "/>'
    + '      <p><a href="https://www.mozilla.org/en-US/mobile/android-download.html?WT.mc_id=fxtus_snip&amp;WT.mc_ev=click">Firefox for Android</a> is now optimized for the way you browse on tablets. Get the power of the Web at your fingertips.</p>'
    + '    </div>'
    + '  </div>'
    + '  <div id="tabzilla-nav">'
    + '    <ul>'
    + '      <li><h2>Mozilla</h2>'
    + '        <ul>'
    + '          <li><a href="http://www.mozilla.org/about/mission.html">Mission</a></li>'
    + '          <li><a href="http://www.mozilla.org/about/">About</a></li>'
    + '          <li><a href="http://www.mozilla.org/products">Products</a></li>'
    + '          <li><a href="http://support.mozilla.org/">Support</a></li>'
    + '          <li><a href="https://developer.mozilla.org">Developers Network</a></li>'
    + '        </ul>'
    + '      </li>'
    + '      <li><h2>Products</h2>'
    + '        <ul>'
    + '          <li><a href="http://www.mozilla.org/firefox">Firefox</a></li>'
    + '          <li><a href="http://www.mozilla.org/thunderbird">Thunderbird</a></li>'
    + '        </ul>'
    + '      </li>'
    + '      <li><h2>Innovations</h2>'
    + '        <ul>'
    + '          <li><a href="https://webfwd.org/">WebFWD</a></li>'
    + '          <li><a href="http://mozillalabs.com/">Labs</a></li>'
    + '        </ul>'
    + '      </li>'
    + '      <li><h2>Get Involved</h2>'
    + '        <ul>'
    + '          <li><a href="http://www.mozilla.org/contribute/">Volunteer</a></li>'
    + '          <li><a href="http://www.mozilla.org/en-US/about/careers.html">Work</a></li>'
    + '          <li><a href="http://www.mozilla.org/en-US/about/mozilla-spaces/">Find us</a></li>'
    + '          <li><a href="https://donate.mozilla.org/">Join us</a></li>'
    + '          <li><a href="http://www.mozilla.org/contribute/">Learn more</a></li>'
    + '        </ul>'
    + '      </li>'
    + '      <li id="tabzilla-search">'
    + '        <a href="http://www.mozilla.org/community/directory.html">Website Directory</a>'
    + '        <form title="Search Mozilla sites" action="http://www.google.com/cse">'
    + '          <input type="hidden" value="002443141534113389537:ysdmevkkknw" name="cx">'
    + '          <input type="hidden" value="FORID:0" name="cof">'
    + '          <input type="search" placeholder="Search" id="q" name="q">'
    + '        </form>'
    + '      </li>'
    + '    </ul>'
    + '  </div>'
    + '</div>';

Tabzilla();
