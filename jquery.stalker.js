/*
 *  Project: Stalker jQuery plugin
 *  Description: Allowing elements to follow the user as the scroll around the page in a
 *    single direction
 *  Version: 1.0 (Sep 9, 2012)
 *  Author: Matt Willer, Box Inc (http://www.box.com)
 *  License: BSD
 *
 *
 *  Usage:
 *    JS -
 *      $(elements).stalker()
 *
 *  Optional params:
 *    direction (string - default: 'down') -
 *      The direction the element should follow the user from its original position.  For
 *      example, specifying 'up' means that whenever the user is scrolled above the
 *      element's original position, the element will follow the user along the page.
 *      When the user scrolls beneath the element's original position, the element will
 *      return to that position.
 *    offset (integer - default: 0) -
 *      The number of pixels from the edge of the screen the element should position itself
 *      while following the user.
 *    stalkerStyle (object/string - default: {}) -
 *      CSS properties to be applied to the element while it is following the user.  The
 *      element's original CSS will be saved and reapplied when it returns to its original
 *      position. If a string is given, it will be treated as a class to apply to the
 *      element while it is following the user.
 *    delay (integer - default: 0) -
 *      The delay, in milliseconds, before the element leaves its original position to
 *      follow the user.
 *    startCallback (function - default: none) -
 *      A callback to be executed when the element begins following the user.  The function
 *      context will be the DOM element
 *    stopCallback (function - default: none) -
 *      A callback to be executed as soon as the element stops following the user and
 *      returns to its original position.  The function context will be the DOM element
 *
*/

// the semi-colon before function invocation is a safety net against concatenated
//  scripts and/or other plugins which may not be closed properly.
;(function ( $, window, undefined ) {

	// undefined is used here as the undefined global variable in ECMAScript 3 is
	// mutable (ie. it can be changed by someone else). undefined isn't really being
	// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
	// can no longer be modified.

	// window and document are passed through as local variables rather than globals
	// as this (slightly) quickens the resolution process and can be more efficiently
	// minified (especially when both are regularly referenced in your plugin).

	// Create the defaults once
	var pluginName = 'stalker'
		,document = window.document
		,defaults = {
			direction: 'down'
			,offset: 0
			,stalkerStyle: {}
			,delay: 0
			,startCallback: null
			,stopCallback: null
		}
		// change this to fit the CSS of the site if necessary
		,stalkerZIndex = 50;

	// The actual plugin constructor
	function Stalker( element, options )
	{
		this.element = element;

		// jQuery has an extend method which merges the contents of two or
		// more objects, storing the result in the first object. The first object
		// is generally empty as we don't want to alter the default options for
		// future instances of the plugin
		this.options = $.extend( {}, defaults, options) ;

		this._defaults = defaults;
		this._name = pluginName;

		this.init();
	}

	/**
	 * Handles an element stalking
	 */
	Stalker.prototype.init = function()
	{
		this.jElement = $(this.element);

		// save the element's original position and CSS
		this._baseOffset = this.jElement.offset();
		this._baseWidth = this.jElement.width();

		// we need a placeholder to keep the document from reflowing
		// use a clone to keep styles (esp. those related to width) but remove
		//  children to reduce id conflicts
		this.placeholder = this.jElement.clone(false).empty().css('height', this.jElement.outerHeight());

		this.stalking = false;

		var me = this;

		/**
		 * Starts an element stalking; applies custom styles and handles positioning
		 */
		function setPosition(edge)
		{
			me.stalking = true;

			var initial = {position: 'fixed'}, ending = $.extend({}, initial);
			initial[edge] = -(me.jElement.outerHeight()) + 'px';
			ending[edge] = parseInt(me.options.offset) + 'px';

			var handler = function()
			{
				// give the element custom style while stalking; by default,
				//  force the element to have its original width and appear on top
				var basicStalkerCSS = {width: me._baseWidth + 'px', left: me._baseOffset.left + 'px', 'z-index': stalkerZIndex};
				if (typeof me.options.stalkerStyle == 'object')
				{
					me.jElement.css($.extend(basicStalkerCSS, me.options.stalkerStyle));
				}
				else
				{
					me.jElement.css(basicStalkerCSS).addClass(me.options.stalkerStyle);
				}

				me.jElement.before(me.placeholder).css(ending);
			};

			if (me.options.delay)
			{
				setTimeout(handler, me.options.delay);
			}
			else
			{
				handler();
			}
		}

		/**
		 * Restores an element to its original state after stalking
		 *  by refreshing it with its clone
		 */
		function restoreOriginalState()
		{
			// discard the stalker and all its weird inline styles
			me.jElement.detach();

			// rip the guts out of the original and dump them into the clone
			var contents = me.jElement.contents();
			me._jElementClone.empty().append(contents);

			me.placeholder.replaceWith(me._jElementClone);

			// make the old clone the element we're tracking
			me.jElement = me._jElementClone;

			// create a new clone later, when we start stalking again

			me.stalking = false;

			if (me.options.stopCallback)
			{
				me.options.stopCallback.call(me.jElement[0]);
			}
		}

		/**
		 * Performs the necessary checks of element position relative to
		 *  the window, and causes the element to start or stop stalking
		 *  accordingly
		 */
		function stalk()
		{
			var pageTop = $(document).scrollTop();
			var viewportHeight = $(window).height();
			var pageBottom = pageTop + viewportHeight;

			if (me.options.direction == 'down')
			{
				if (me._baseOffset.top < pageTop)
				{
					if (!me.stalking)
					{
						// create a clone of the element, which will be used to keep the
						//  element's original styles intact for when we're done stalking
						//  We want to do this as late as possible.
						// We won't need the descendents, so don't bother with them
						me._jElementClone = me.jElement.clone(true, false);

						setPosition('top');

						if (me.options.startCallback)
						{
							me.options.startCallback.call(me.jElement[0]);
						}
					}
				}
				else if (me.stalking)
				{
					restoreOriginalState();
				}
			}
			else
			{
				if (me._baseOffset.top + me.jElement.outerHeight() > pageBottom)
				{
					if (!me.stalking)
					{
						// create a clone of the element, which will be used to keep the
						//  element's original styles intact for when we're done stalking
						//  We want to do this as late as possible.
						// We won't need the descendents, so don't bother with them
						me._jElementClone = me.jElement.clone(true, false);

						setPosition('bottom');

						if (me.options.startCallback)
						{
							me.options.startCallback.call(me.jElement[0]);
						}
					}
				}
				else if (me.stalking)
				{
					restoreOriginalState();
				}

			}
		}

		function handleEvent()
		{
			// since resize gets called when window zooms, re-cache element width
			if (me.stalking)
			{
				if (me.options.stalkerStyle && me.options.stalkerStyle.width)
				{
					me._baseWidth = me.options.stalkerStyle.width;
				}
				else
				{
					me._baseWidth = me.placeholder.width();
				}

				me._baseOffset = me.placeholder.offset();
				me.jElement.width(me._baseWidth).css('left', me._baseOffset.left+'px');
			}
			else
			{
				me._baseWidth = me.jElement.width();
				me._baseOffset = me.jElement.offset();
			}
			stalk();
		}

		// set up event handlers and call immediately
		$(window).on('scroll.stalker', handleEvent).on('resize.stalker', handleEvent);

		stalk();
	};

	// A really lightweight plugin wrapper around the constructor,
	// preventing against multiple instantiations
	$.fn[pluginName] = function ( options )
	{
		return this.each(function ()
		{
			if (!$.data(this, 'plugin_' + pluginName))
			{
				$.data(this, 'plugin_' + pluginName, new Stalker( this, options ));
			}
		});
	};

}(jQuery, window));
