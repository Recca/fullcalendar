fcViews.agendaDayWithLocations = AgendaDayWithLocationsView;

function AgendaDayWithLocationsView(element, calendar) {
	var t = this,
      options = calendar.options,
      locations = options.locations,
      colCnt = locations.length;

	
	
	// exports
	t.render = render;
  t.locations = calendar.options.locations;
  t.hasLocations = (t.locations ? t.locations.length > 0 : false);
	
	
	// imports
	EventWithLocationManager.call(t, calendar);
	AgendaView.call(t, element, calendar, 'agendaDayWithLocations');
	var opt = t.opt;
	var renderAgenda = t.renderAgenda;
	var formatDate = calendar.formatDate;
	
	
	
	function render(date, delta) {
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
	}

}
