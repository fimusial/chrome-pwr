// kind: user-triggered
// usage: maxScroll() to start, clearTimeout(maxScrollLastTimeoutId) to cancel

var maxScrollPrevY = 0;
var maxScrollLastTimeoutId = 0;
var maxScroll = () => {
	if (maxScrollPrevY <= window.scrollY) {
		maxScrollPrevY = window.scrollY;
		window.scrollTo(0, Number.MAX_SAFE_INTEGER);
		maxScrollLastTimeoutId = setTimeout(maxScroll, 0);
	};
};

maxScroll();
