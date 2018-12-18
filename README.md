# clockie
Stop-watch jquery plugin with js cookie save

Usage
--------
```javascript
$("#Clockie").clockie();
```

Options
--------
- NAME | DESCRIPTION | DEFAULT

- collapsedInit | Initial collapsed status | true
- statusTimerInit | Initial timer status (paused or running) | 'paused'
- hasMilliSec | Show milliseconds | false,
- positionInit | Initial position on window (right or left) | 'right'
- hasActionBtn | Show/hide action button | true
- isDraggable	| Enable to drag clockie plugin | true
- actionBtnTxt | Action button label | 'Assign'
- timerColor | Timer color | '#f25824'
- launchAction | Callback function when action button is clicked  | return value : currentTime in seconds


Features
--------

This plugin work with js-cookie (MIT License https://github.com/js-cookie/js-cookie) to save some values (default expiration: 7 days):
- clockie position on your browser window (clockieX and clockieY)
- clockie collapse or expand status (collapsedDiv)
- current time in seconds or milliseconds (if option selected)
- timer playing/running status (statusTimer)

Fixed bug : jquery ui draggable didn't work on mobile devices so i added jquery ui touch-punch plugin (MIT License)


Depends
--------
- jquery 1.11.3
- jquery ui 1.11.4
- bootstrap 3.6 (optional)
- jquery ui touch punch fork 0.4.0 plugin
- js cookie 2.2.0 plugin


Demo
--------
http://www.webulous.fr/git/clockie/clockie.html
