
function EventWithLocationManager(calendar) {
  var t = this;

  // exports
  t.sortEventsByLocations = sortEventsByLocations;
  t.collideWithOtherEvents = collideWithOtherEvents;

  t.locationsColMapping = {}
  $.each(t.locations, function(index, l){
    t.locationsColMapping[l.id] = index;
  });

  //imports
  var clientEvents = calendar.clientEvents;
  var opt = calendar.options;

  function fetchEventsForTheDay(day) {
    var day_as_string = day.toDateString();
    return clientEvents(function(e) {
      return e.start.toDateString() == day_as_string;
    });
  }

  function sortEventsByLocations(events) {
    var events_by_locations = {cross_event: []}, location_id;

    $.each(events, function(index, e){
      location_id = (e.cross_display ? 'cross_event' : e.location_id);

      if(!$.isArray(events_by_locations[location_id])) {
        events_by_locations[location_id] = new Array();
      }

      events_by_locations[location_id].push(e)
    });

    return events_by_locations;
  }

  function collideWithOtherEvents(start, end, ev, events_or_location_id) {
    res = eventsWithCollision.apply(t, arguments).length > 0;
    return res;
  }

  function eventsWithCollision(start, end, ev, events_or_location_id) {
    if(!end){ end = eventEnd({start: start}); }

    var collision = [], 
        dates = [start, end].sort(cmp)
        events = getEvents(events_or_location_id);


    $.each(events, function(index, e){
      var event_end = eventEnd(e);

      if((!ev || e._id != ev._id) && !e.allDay && ((dates[0] < e.start && dates[1] > e.start) || (dates[0] < event_end && dates[1] > event_end))) {
        collision.push(e);
      }
    });
    
    return collision;
  }

  function getEvents(events_or_location_id) {
    if(events_or_location_id == undefined || $.isNumeric(events_or_location_id)) {
      events = clientEvents();
      if(events_or_location_id) {
        sorted_events = sortEventsByLocations(events)
        events = sorted_events[events_or_location_id]
        if(!events) { events = [] }
        events = events.concat(sorted_events['cross_event'])
      }
    } else {
      events = events_or_location_id;
    }
    return events;
  }

  function eventEnd(event) {
    if (event.end) {
      return cloneDate(event.end);
    }else{
      return addMinutes(cloneDate(event.start), opt.defaultEventMinutes);
    }
  }
}
