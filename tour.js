//var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

function Tour(options) {
    this.options = {};
    $.extend(this.options, options);

    this.i = -1;
    this.steps = this.options.steps;
    delete this.options.steps;

    console.log('Tour.config:', this);
}

Tour.prototype.start = function () {
    console.log('Tour.start');

    $('body').addClass('tour-on');

    this.createContainer();
    this.createOverlay();
    this.next();
};

Tour.prototype.createContainer = function () {
    $('body')
        .append(`<div class="tour-container">
        		<div class="tour-content"></div>
        	</div>
        	<svg class="tour-arrow" width="200" height="220">
        	<defs>
        	    <marker id="markerArrow" markerWidth="13" markerHeight="13" refX="9" refY="6" orient="auto-start-reverse">
                    <path d="M2,10 L10,6 L2,2" style="fill:none; stroke:#FFF" />
                </marker>
        	</defs>
        	<path d="M10,10 C20,200 90,220 200,218"
        		style="fill:none; stroke:#FFF; stroke-width:2px; marker-start: url(#markerArrow);"/>
			</svg>
        	`);
};

Tour.prototype.createOverlay = function () {
    console.log('createOverlay:', this.overlay);
    var div = '<div class="tour-overlay"></div>';
    this.overlay = {
        top: $(div),
        left: $(div),
        right: $(div),
        bottom: $(div)
    };

    var body = $('body');
    body.append(this.overlay.top);
    body.append(this.overlay.left);
    body.append(this.overlay.right);
    body.append(this.overlay.bottom);

    return this;
};

Tour.prototype.next = function () {
    if (this.currentStep) this.currentStep.off();
    this.i++;
    this.currentStep = new Step(this.steps[this.i], this).on();
};


function Step(data, tour) {
    $.extend(this, data);
    this.tour = tour;
    this.overlay = tour.overlay;
}

Step.prototype.positionOverlay = function () {
    var max = {
        height: $(window).height(),
        width: $(document).outerWidth()
    };

    this.overlay.top.css({
        top: 0,
        left: 0,
        height: this.position.top,
        width: "100%"
    });

    this.overlay.left.css({
        top: this.position.top,
        left: 0,
        height: $(window).height(),
        width: this.position.left
    });

    this.overlay.right.css({
        top: this.position.top,
        left: this.position.right,
        height: max.height,
        width: max.width
    });

    this.overlay.bottom.css({
        top: this.position.bottom,
        left: this.position.left,
        height: max.height,
        width: this.position.width
    });

    return this;
};


Step.prototype.positionContent = function () {
    $('.tour-container').css({
        top: this.position.top + 200,
        left: this.position.left + 200
    });
    return this;
};

Step.prototype.setContent = function () {
    $('.tour-content').html(this.content);
    return this;
};

Step.prototype.setTarget = function () {
    this.element = $(this.selector);
    this.element.addClass('tour-target');
    return this;
};

Step.prototype.positionArrow = function () {
    var arrowAdjust = 16;
    var left = Math.round(this.position.left + (this.position.width / 2)) - arrowAdjust;
    $('.tour-arrow').css({
        left: left,
        top: this.position.bottom + 10
    });

    return this;
};

Step.prototype.setPosition = function () {
    this.position = this.element.offset();
    this.position.top = this.position.top - $(window).scrollTop();
    this.position.left = this.position.left - $(window).scrollLeft();
    this.position.width = this.element.outerWidth();
    this.position.height = this.element.outerHeight();
    this.position.right = this.position.left + this.position.width;
    this.position.bottom = this.position.top + this.position.height;
    return this;
};

Step.prototype.on = function () {
    console.log('step.on:', this);
    this.setTarget()
        .setPosition()
        .positionOverlay()
        .setContent()
        .positionContent()
        .positionArrow();

    var self = this;
    $(window).on('resize', function () {
        self.setPosition()
            .positionOverlay()
            .positionArrow();
    }).on('scroll', function () {
        self.setPosition()
            .positionOverlay()
            .positionArrow();
    });


    $(document).off(this.event, this.selector);
    $(document).on(this.event, this.selector, function (event) {
        console.log('step.on:', event);
        self.tour.next();
    });

    return this;
};

Step.prototype.off = function () {
    this.element.removeClass('tour-target');
}