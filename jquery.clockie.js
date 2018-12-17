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
			var collapsedDiv = settings.collapsedInit;
			var currentTime =(typeof Cookies.get('currentTime') == 'undefined')?0:Cookies.get('currentTime');
			var timer;
			
			var clockieBlock = 	'<div class="btn btn-xl clk_btn"><span class="fa fa-stopwatch"></span></div>'+
										'<div class="btn clk_resetpos"><span class="fa fa-power-off"></span></div>'+
										'<div class="btn clk_play" id="startButton"><span class="fa fa-play"></span></div>'+
										'<div class="btn clk_pause" id="pauseButton"><span class="fa fa-pause"></span></div>'+
										'<div class="btn clk_reset" id="clearButton"><span class="fa fa-redo-alt"></span></div>'+
										'<div class="clk_ctn">'+
											'<div class="timer stopwatch" id="timer"></div>'+
											( settings.hasActionBtn ?'<div class="btn_action">' + settings.actionBtnTxt + '</div>' : '')+
										'</div>';
			elem.addClass('clockie');
			elem.html(clockieBlock);	
			
			$('.stopwatch').css('color', settings.timerColor);
			elem.addClass('clockie');
			
			if (settings.positionInit=='left') elem.addClass('leftpos');
			else elem.removeClass('leftpos');
			
			expandcollapseChrono();
			resetPosOnClick();
			
			transformMSToTime(Cookies.get('currentTime'));
			
			var statusTimer = (typeof Cookies.get('statusTimer') == 'undefined')?settings.statusTimerInit:Cookies.get('statusTimer');
			if (statusTimer=='running') {
				$('#startButton').css('display', 'none');
				$('#clearButton').css('display', 'none');
				$('#pauseButton').css('display', 'inline-block');
				startTimer();
			}
			
			startTimerOnClick();
			pauseTimerOnClick();
			clearTimerOnClick();
			saveTimerOnExit();
			
			if (Cookies.get('clockieX') != null && Cookies.get('clockieX') > -160 && Cookies.get('clockieX') < $(window).width()-20) elem.css('left', Cookies.get('clockieX')+'px');
			else $('.clk_resetpos').trigger('click');
			
			if (Cookies.get('clockieY') != null && Cookies.get('clockieY') < $(window).height()-20 && Cookies.get('clockieY') > -160) elem.css('top', Cookies.get('clockieY')+'px');
			else $('.clk_resetpos').trigger('click');
			
			if (Cookies.get('collapsedDiv')=='true')	{
				elem.addClass("active");
				collapsedDiv = elem.hasClass('active');
			}
			
			// CALLBACK SEND CURRENT TIME
			if (settings.hasActionBtn) {
				$('.btn_action').on('click', function (e) {
					e.preventDefault();
					settings.launchAction(parseInt(currentTime/1000));
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
				//console.log(Cookies.get('clockieX'));
			}
			
			// DRAGGABLE
			if (settings.isDraggable) {
				var memo;
				elem.addClass('cursor_move');
				$('.clk_btn').addClass('cursor_move');
				elem.draggable({
					start: function() {
						memo = $(this).css('transition');
						$(this).css('transition', 'none');
					},
					stop: function(event, ui) { 
						memoChronoPos();
						$(this).css('transition', memo);
					}
				});
			}
			else elem.removeClass('cursor_move');
			
			// RESET POSITION
			function resetPosOnClick() {
				$('.clk_resetpos').on('click', function (e) {
					if (elem.hasClass('active')) elem.toggleClass("active");
					Cookies.set('collapsedDiv', elem.hasClass('active'), { expires: 7 });
					if (settings.positionInit=='left') elem.css({ left: '-180px', right: 'auto', top: '40%' });
					else elem.css({ left: 'auto', right: '-180px', top: '40%' });
					elem.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e) {
						memoChronoPos();
					});
				});	
			}
			
			// COLLAPSE / EXPAND
			function expandcollapseChrono() {
				$(".clk_btn").click(function(e) {
					elem.toggleClass("active");
					collapsedDiv = elem.hasClass('active');
					if (settings.positionInit=='left') {
						if (collapsedDiv) elem.css('left', "+=180");
						else elem.css('left', "-=180");						
					}
					else {
						if (collapsedDiv) elem.css('right', "+=180");
						else elem.css('right', "-=180");
					}
					elem.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e) {
						memoChronoPos();
					});
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

