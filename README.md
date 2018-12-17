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
- positionInit | Initial position on window (right or left) | 'right'
- isDraggable	| Enable to drag clockie plugin | true
- hasActionBtn | Show/hide action button | true
- actionBtnTxt | Action button label | 'Assign'
- timerColor | Timer color | '#f25824'
- launchAction | Callback function when action button is clicked  | return value : currentTime in seconds


Features
--------

This plugin work with js-cookie to save some values (default expiration: 7 days):
- clockie position on your browser window (clockieX and clockieY)
- clockie collapse or expand status (collapsedDiv)
- current time in milliseconds (currentTime)
- timer playing/running status (statusTimer)

Re-positionning when clockie dragged outside (page refresh needed)
