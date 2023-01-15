var targetObj = {};
var targetProxy = new Proxy(targetObj, {
  set: function (target, key, value) {
	  if (value == -1) {
		expired = 1;
		setPoints();
	  }
      target[key] = value;
      return true;
  }
});
targetProxy.diff = 0;

function CountDownTimer(duration, granularity) {
	this.duration = duration;
	this.granularity = granularity || 1000;
	this.tickFtns = [];
	this.running = false;
}

CountDownTimer.prototype.start = function () {
	if (this.running) {
		return;
	}
	this.running = true;
	var start = Date.now(),
		that = this,
		obj;

	(function timer() {
		targetProxy.diff = that.duration - (((Date.now() - start) / 1000) | 0);
		// console.log(targetProxy.diff)

		if (targetProxy.diff >= 0) {
			setTimeout(timer, that.granularity);
		} else {
			targetProxy.diff = 0;
			that.running = false;
			return;
		}

		obj = CountDownTimer.parse(targetProxy.diff);
		that.tickFtns.forEach(function (ftn) {
			ftn.call(this, obj.minutes, obj.seconds);
		}, that);
	}());
};

CountDownTimer.prototype.onTick = function (ftn) {
	if (typeof ftn === 'function') {
		this.tickFtns.push(ftn);
	}
	return this;
};

CountDownTimer.prototype.expired = function () {
	return !this.running;
};

CountDownTimer.parse = function (seconds) {
	return {
		'minutes': (seconds / 60) | 0,
		'seconds': (seconds % 60) | 0
	};
};

function start() {
    var display = document.querySelector("#timer"),
        timer = new CountDownTimer(600);

    timer.onTick(format(display)).start();

    function format(display) {
        return function (minutes, seconds) {
            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;
            display.textContent = minutes + ' : ' + seconds;
        };
    }

};