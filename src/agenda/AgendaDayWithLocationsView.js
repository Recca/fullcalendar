fcViews.agendaDayWithLocations = AgendaDayWithLocationsView;

function AgendaDayWithLocationsView(element, calendar) {
	var t = this,
      options = calendar.options,
      locations = options.locations,
      colCnt;

	// exports
	t.render = render;
	t.reRender = reRender;
  t.init = init;
  t.next = next;
  t.prev = prev;
  t.locations = locations;
  t.hasLocations = (t.locations ? t.locations.length > 0 : false);
  t.locationsLimit = calendar.options.locationsLimit;
  t.locationsStartAt = calendar.options.locationsStartAt;
  t.reloadContentHeight = reloadContentHeight;
  t.resetLocations =  resetLocations;


	
	// imports
  init();
	AgendaView.call(t, element, calendar, 'agendaDayWithLocations');
	var opt = t.opt;
	var renderAgenda = t.renderAgenda;
	var reRenderAgenda = t.reRenderAgenda;
	var formatDate = calendar.formatDate;

  function reloadContentHeight() {
    setContentHeight();
    calendar.render();
  }

  function setContentHeight() {
    var headHeight = element.find('tbody:first').position().top;
    var height = (21*(60/options.slotMinutes)*((24-options.minTime)-(24-options.maxTime)))+14+headHeight+21;
     //14 is allDayCell margin
     options.contentHeight = height;
  }

  function init(step) {
    if(t.locationsLimit) {
      if(!step) { step = t.locationsLimit; }
      if(isNaN(t.locationsStartAt)) { t.locationsStartAt = 0; }
      t.locations = locations.slice(t.locationsStartAt, t.locationsStartAt+step);
    }

    colCnt = t.locations.length;

    EventWithLocationManager.call(t, calendar);
  }

  function next(step) {
    t.locationsLimit = calendar.options.locationsLimit;

    if(!step) { step = t.locationsLimit; }
    t.locationsStartAt += step;

    if(step < 0) { step = 0-step; }

    if(t.locationsStartAt < 0) {
      t.locationsStartAt = locations.length - step;
    }

    if(t.locationsStartAt >= locations.length) {
      t.locationsStartAt= 0;
    }

    var modulo = t.locationsStartAt%step
    if(modulo != 0) {
      t.locationsStartAt = locations.length - modulo;
      step = modulo;
    }

    init(step);
    reRender();
    calendar.render();
  }

  function prev(step) {
    if(!step) { step = t.locationsLimit; }
    step = 0-step;
    next(step);
  }

  function reRender() {
    t.reRenderAgenda(colCnt);
  }

	function render(date, delta) {
    if(!date) {
      date = new Date(calendar.options.day);
    }

		if (delta) {
			addDays(date, delta);
			if (!opt('weekends')) {
				skipWeekend(date, delta < 0 ? -1 : 1);
			}
		}

		var start = cloneDate(date, true);
		var end = addDays(cloneDate(start), 1);
		t.title = formatDate(date, opt('titleFormat'));
		t.start = t.visStart = start;
		t.end = t.visEnd = end;
		renderAgenda(colCnt);

    if(options.autoHeight) {
      reloadContentHeight();
    }
	}

  function resetLocations(newLocations) {
    locations = newLocations;
    t.locations = locations;
    init();
    reRender();
    reloadContentHeight();
  }
}
