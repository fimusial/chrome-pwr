export function blade_maxScrollStart() {
	if (window.chromePwr_maxScrollLastTimeoutId > 0) {
		return;
	}

	window.chromePwr_maxScrollPrevY = 0;
	window.chromePwr_maxScrollLastTimeoutId = 0;

	const next = () => {
		if (window.chromePwr_maxScrollPrevY <= window.scrollY) {
			window.chromePwr_maxScrollPrevY = window.scrollY;
			window.scrollTo(0, Number.MAX_SAFE_INTEGER);
			window.chromePwr_maxScrollLastTimeoutId = setTimeout(next, 0);
		};
	}

	next();
}

export function blade_maxScrollCancel() {
	clearTimeout(window.chromePwr_maxScrollLastTimeoutId);
	window.chromePwr_maxScrollLastTimeoutId = 0;
}
