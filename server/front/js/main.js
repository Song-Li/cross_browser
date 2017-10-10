jQuery(function($) {
  // 'addEventlistener' is the standard method for adding an event listener to an EventTarget
  // 'attachEvent' is the IE-specific version
  var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
  // eventer contains the 'addEventlistener' (or 'attachEvent') function of the EventTarget 'window'
  var eventer = window[eventMethod];
  // 'message' is the default event type name for receiving messages; 'onmessage' is the IE version
  var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
  
  // The following function is called when the window receives a message
  eventer(messageEvent,function(e) {
    $("#fingerprint-iframe").addClass("hide");
    $("#fingerprint-iframe").attr("src", "./fingerprint/details.html?" + e.data['single']);
    $("#fingerprint-button").prop('disabled', false);
    $("#fingerprint-button").html("Details");
    $("#fingerprint_result").removeClass("hide");
    $("#browser_fingerprint").html(e.data['single']);
    $("#computer_fingerprint").html(e.data['cross']);
  },false);


  //Preloader
  var preloader = $('.preloader');
  $(window).load(function(){
    preloader.remove();
  });

  //#main-slider
  var slideHeight = $(window).height();
  $('#home-slider .item').css('height',slideHeight);

	$(window).resize(function(){'use strict',
		$('#home-slider .item').css('height',slideHeight);
	});
	
	//Scroll Menu
	$(window).on('scroll', function(){
		if( $(window).scrollTop()>slideHeight ){
			$('.main-nav').addClass('navbar-fixed-top');
		} 
    /*
    else {
			$('.main-nav').removeClass('navbar-fixed-top');
		}
    */
	});

  /*
	// Navigation Scroll
	$(window).scroll(function(event) {
		Scroll();
	});
  */

	$('.navbar-collapse ul li a').on('click', function() {  
		$('html, body').animate({scrollTop: $(this.hash).offset().top - 5}, 1000);
		return false;
	});

  /*
	// User define function
	function Scroll() {
		var contentTop      =   [];
		var contentBottom   =   [];
		var winTop      =   $(window).scrollTop();
		var rangeTop    =   200;
		var rangeBottom =   500;
		$('.navbar-collapse').find('.scroll a').each(function(){
			contentTop.push( $( $(this).attr('href') ).offset().top);
			contentBottom.push( $( $(this).attr('href') ).offset().top + $( $(this).attr('href') ).height() );
		})
		$.each( contentTop, function(i){
			if ( winTop > contentTop[i] - rangeTop ){
				$('.navbar-collapse li.scroll')
				.removeClass('active')
				.eq(i).addClass('active');			
			}
		})
	};
*/
	$('#tohash').on('click', function(){
		$('html, body').animate({scrollTop: $(this.hash).offset().top - 5}, 1000);
		return false;
	});
	
	//Initiat WOW JS
	new WOW().init();
	//smoothScroll
	smoothScroll.init();
	
	// Progress Bar
	$('#about-us').bind('inview', function(event, visible, visiblePartX, visiblePartY) {
		if (visible) {
			$.each($('div.progress-bar'),function(){
				$(this).css('width', $(this).attr('aria-valuetransitiongoal')+'%');
			});
			$(this).unbind('inview');
		}
	});

	//Countdown
	$('#features').bind('inview', function(event, visible, visiblePartX, visiblePartY) {
		if (visible) {
			$(this).find('.timer').each(function () {
				var $this = $(this);
				$({ Counter: 0 }).animate({ Counter: $this.text() }, {
					duration: 2000,
					easing: 'swing',
					step: function () {
						$this.text(Math.ceil(this.Counter));
					}
				});
			});
			$(this).unbind('inview');
		}
	});

  //add fingerprint iframe
  $("#fingerprint-button").click(function() {
    if ($("#fingerprint-button").text() != "Details") {
      $("#fingerprint-button").html("Running");
      $("#fingerprint-button").prop('disabled', true);
      $("#fingerprint-iframe").attr("src", "./fingerprint/index.html");
    } else {
      $("#fingerprint-result").addClass("hide");
      $("#fingerprint-iframe").removeClass("hide");
      $("#fingerprint-iframe").attr("width", "1024");
      $("#fingerprint-iframe").attr("height", "2048");
    }
    $('html, body').animate({
      scrollTop: $("#fingerprint").offset().top - 5
    }, 1000);
  });

});

