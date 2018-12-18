/*
 *
 * jquery.clockie.js jQuery plugin
 * Author: @sebastien_chaudot
 * Webulous
 *	
 *	Library required :
 * jquery > v10
 * jquery ui > v1.11
 * js.cookie.js	
 *	bootstrap3 css
 * font awesome
 *
 * Demo: http://www.webulous.fr/git/clockie/clockie.html
 * 
 */

(function($) {
	'use strict';
	
	$.fn.clockie = function(options) {
		
		var settings = $.extend({
			collapsedInit		: true,
			statusTimerInit	: 'paused',
			hasMilliSec			: false,
			positionInit		: 'right',
			hasActionBtn		: true,
			isDraggable			: true,
			actionBtnTxt		: 'Assign',
			timerColor			: '#f25824',
			launchAction: function() {}
		}, options);
		
		return this.each(function() {
			
			/******************************************************************************************************/
			/*                           INIT																							*/
			/******************************************************************************************************/
			
			var elem = $(this);			
			var collapsedDiv = (typeof Cookies.get('collapsedDiv') == 'undefined')?settings.collapsedInit:Cookies.get('collapsedDiv');
			var positionDiv = (typeof Cookies.get('positionDiv') == 'undefined')?settings.positionInit:Cookies.get('positionDiv');
			var statusTimer = (typeof Cookies.get('statusTimer') == 'undefined')?settings.statusTimerInit:Cookies.get('statusTimer');
			var hasMilliSec = (typeof Cookies.get('hasMilliSec') == 'undefined')?settings.hasMilliSec:Cookies.get('hasMilliSec');
			var currentTime = (typeof Cookies.get('currentTime') == 'undefined')?0:Cookies.get('currentTime');
			var timer;
			
			var clockieBlock = 	'<div class="btn btn-xl clk_btn"><span class="fa fa-stopwatch"></span></div>'+
										'<div class="btn clk_resetpos" data-toggle="tooltip" title="Reset position"><span class="fa fa-power-off"></span></div>'+
										'<div class="btn clk_play" id="startButton" data-toggle="tooltip" title="Play"><span class="fa fa-play"></span></div>'+
										'<div class="btn clk_pause" id="pauseButton" data-toggle="tooltip" title="Pause"><span class="fa fa-pause"></span></div>'+
										'<div class="btn clk_reset" id="clearButton" data-toggle="tooltip" title="Clear"><span class="fa fa-redo-alt"></span></div>'+
										'<div class="clk_ctn">'+
											'<div class="timer stopwatch" id="timer"></div>'+
											( settings.hasActionBtn ?'<div class="btn_action">' + settings.actionBtnTxt + '</div>' : '')+
										'</div>';
			elem.addClass('clockie');
			elem.html(clockieBlock);	
			
			$('.stopwatch').css('color', settings.timerColor);
			if (hasMilliSec) $('.stopwatch').addClass('hasmillisec');
			
			elem.addClass('clockie');
			
			//console.log(Cookies.get('collapsedDiv')+' | '+Cookies.get('positionDiv')+' | '+Cookies.get('clockieX'));
			
			if (typeof Cookies.get('clockieX') != 'undefined') elem.css('left', Cookies.get('clockieX')+'px');
			if (typeof Cookies.get('clockieY') != 'undefined') elem.css('top', Cookies.get('clockieY')+'px');
			if (typeof Cookies.get('clockieX') == 'undefined' || typeof Cookies.get('clockieY') == 'undefined') resetPos();
			if (Cookies.get('clockieX') < -170 || Cookies.get('clockieX') > $(window).width()-30) resetPos();
			
			if (statusTimer=='running') {
				$('#startButton').css('display', 'none');
				$('#clearButton').css('display', 'none');
				$('#pauseButton').css('display', 'inline-block');
				startTimer();
			}
			
			expandcollapseOnClick();
			resetPosOnClick();
			transformMSToTime(Cookies.get('currentTime'));
			startTimerOnClick();
			pauseTimerOnClick();
			clearTimerOnClick();
			saveTimerOnExit();
			
			if (Cookies.get('collapsedDiv')=='true')	{
				elem.addClass("active");
				collapsedDiv = elem.hasClass('active');
			}
			if (Cookies.get('positionDiv')=='left')	{
				elem.addClass("leftpos");
				positionDiv = elem.hasClass('leftpos')?'left':'right';
			}
			
			// CALLBACK SEND CURRENT TIME
			if (settings.hasActionBtn) {
				$('.btn_action').on('click', function (e) {
					e.preventDefault();
					settings.launchAction(parseInt(currentTime/(hasMilliSec?1:1000)));
				});
			}
			
			/******************************************************************************************************/
			/*                           PRIVATE FUNCTIONS																			*/
			/******************************************************************************************************/
			
			// MEMO POSITION
			function memoChronoPos() {
				Cookies.set('clockieX', elem.css('left').replace(/[^-\d\.]/g, ''), { expires: 7 });
				Cookies.set('clockieY', elem.css('top').replace(/[^-\d\.]/g, ''), { expires: 7 });
				Cookies.set('collapsedDiv', collapsedDiv, { expires: 7 });		
				Cookies.set('positionDiv', positionDiv, { expires: 7 });							
				//console.log(Cookies.get('positionDiv'));
			}
			
			// RESET POSITION
			function resetPos() {
				collapsedDiv = false;
				elem.removeClass("active");
				if (positionDiv=='left') elem.css({ left: '-175px', top: '40%' }).addClass('leftpos');
				else elem.css({ left: parseInt($(window).width()-25)+'px', top: '40%' }).removeClass('leftpos');
				elem.one('webkitTransitionEnd oTransitionEnd msTransitionEnd transitionend', function(e) {
					memoChronoPos();
				});
			}
			
			// COLLAPSE / EXPAND
			function expandCollapse() {
				elem.toggleClass("active");
				collapsedDiv = elem.hasClass('active');
				if (positionDiv=='left') {
					if (collapsedDiv) elem.css('left', "+=180");
					else elem.css('left', "-=180");						
				}
				else {
					if (collapsedDiv) elem.css('left', "-=180");
					else elem.css('left', "+=180");
				}
				
				elem.one('webkitTransitionEnd oTransitionEnd msTransitionEnd transitionend', function(e) {
					var position = elem.position();
					if (position.left < -170) elem.css('left', "-170px");	
					if (position.left > $(window).width()-30) elem.css('left',  parseInt($(window).width()-30)+"px"); 
					memoChronoPos();
				});
			}
			
			// DRAGGABLE
			if (settings.isDraggable) {
				var memo;
				elem.addClass('cursor_move');
				elem.draggable({
					//cancel: ".clk_btn",
					containment: [-170, -160, $(window).width()-30, $(window).height()-30],
					start: function() {
						memo = $(this).css('transition');
						$(this).css('transition', 'none');
					},
					drag: function(event, ui) {
						if (ui.position.left < $(window).width()/2 - 100) {
							$(this).addClass('leftpos');
							positionDiv = 'left';				
						}
						else {
							$(this).removeClass('leftpos');
							positionDiv = 'right';				
						}
					},
					stop: function(event, ui) { 
						memoChronoPos();
						$(this).css('transition', memo);
					}
				});
			}
			else elem.removeClass('cursor_move');
			
			
			function resetPosOnClick() {
				$('.clk_resetpos').on('click', function () {
					resetPos();
				});	
			}
			
			function expandcollapseOnClick() {
				$(".clk_btn").click(function(e) {
					expandCollapse()
				});	
			}
			
			/******************************************************************************************************/
			/*                           TIMER																							*/
			/******************************************************************************************************/
			
			function addZeros(number, length) {
				var string = '' + number;
				while (string.length < length) { string = '0' + string; }
				return string;
			}

			function now() {
				return (new Date().getTime());
			}

			function transformMSToTime(time) {
				if (time) {
					var hours = parseInt(time / 3600000);
					var minutes = parseInt(time / 60000) - (hours * 60);
					var seconds = parseInt(time / 1000) - (minutes * 60) - (hours * 3600);
					$('#timer').text(addZeros(hours, 2) + ':' + addZeros(minutes, 2) + ':' + addZeros(seconds, 2));
					if (hasMilliSec) {
						var milliseconds = parseInt(time % 1000);
						$('#timer').text(addZeros(hours, 2) + ':' + addZeros(minutes, 2) + ':' + addZeros(seconds, 2) + '.' + addZeros(milliseconds, 3));
					}
					
				}
				else $('#clearButton').trigger('click');
			}

			function startTimer() {
				var startTime = now();
				
				timer = setInterval(function() {
					currentTime = (now() - startTime) + parseInt(Cookies.get('currentTime'));
					transformMSToTime(currentTime);
				}, 55);
			}

			function pauseTimerOnClick() {
				$('#pauseButton').click(function() {
					Cookies.set('currentTime', currentTime, { expires: 7 });
					Cookies.set('statusTimer', 'paused', { expires: 7 });
					clearInterval(timer);
					
					$(this).css('display', 'none');
					$('#startButton').css('display', 'inline-block');
					$('#clearButton').css('display', 'inline-block');
				});
			}

			function startTimerOnClick() {
				$('#startButton').click(function () {
					Cookies.set('statusTimer', 'running', { expires: 7 });
					startTimer();
					
					$(this).css('display', 'none');
					$('#clearButton').css('display', 'none');
					$('#pauseButton').css('display', 'inline-block');
				});
			}

			function clearTimerOnClick() {
				$('#clearButton').click(function() {
					$(this).css('display', 'none');
					$('#timer').text('00:00:00');
					if (hasMilliSec) $('#timer').text('00:00:00.000');
					currentTime = 0;
					Cookies.set('currentTime', currentTime, { expires: 7 });
				});
			}
			
			function saveTimerOnExit() {
				window.onbeforeunload = function() {
					clearInterval(timer);
					Cookies.set('currentTime', currentTime, { expires: 7 });
					Cookies.set('collapsedDiv', collapsedDiv, { expires: 7 });
				}
			}
			
		});	
	}
	/******************************************************************************************************/
	/*                           PUBLIC FUNCTIONS																			*/
	/******************************************************************************************************/
	
	// CLEAR & PAUSE TIMER
	$.fn.clearPauseTimer = function() {
		$('#pauseButton').trigger('click');
		$('#clearButton').trigger('click');
	}

})(jQuery);

