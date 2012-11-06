stalker
=======

A jQuery plugin allowing elements to follow the user as they scroll a page.

Here's a simple example: http://jsfiddle.net/mattwiller/s2Pgh/

Usage
-----

```js
$(elements).stalker()
```

Parameters
-----

**direction** (string - default: 'down'):
The direction the element should follow the user from its original position.  For example, specifying 'up' means that whenever the user is scrolled above the element's original position, the element will follow the user along the page.  When the user scrolls beneath the element's original position, the element will return to that position.

**offset** (integer - default: 0):
The number of pixels from the edge of the screen the element should position itself while following the user.

**stalkerStyle** (object/string - default: {}):
CSS properties to be applied to the element while it is following the user.  The element's original CSS will be saved and reapplied when it returns to its original position. If a string is given, it will be treated as a class to apply to the element while it is following the user.

**delay** (integer - default: 0):
The delay, in milliseconds, before the element leaves its original position to follow the user.

**startCallback** (function - default: none):
A callback to be executed when the element begins following the user.  The function context will be the DOM element which is starting to follow.

**stopCallback** (function - default: none):
A callback to be executed as soon as the element stops following the user and returns to its original position.  The function context will be the DOM element which is no longer following.
