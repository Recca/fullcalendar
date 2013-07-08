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
    return eventsWithCollision.apply(t, arguments);
  }

  function eventsWithCollision(start, end, ev, events_or_location_id) {
    if(!end){ end = eventEnd({start: start}); }
    if(ev && ev.cross_display && !ev.parent_id){events_or_location_id = null;}

    var collision = false, 
        dates = [start, end].sort(cmp)
        events = getEvents(events_or_location_id);


    var parent_event;
    var children_event;
    var parent_id;
    if(ev) {
     parent_id = ev.new_parent_id || (ev.new_parent_id == 0 ? null : ev.parent_id);
    }
    $.each(events, function(index, e){
      var event_end = eventEnd(e);

      //Event inside other event allowed
      if(
        (!ev //Si ce n'est pas un event (selection pour creation)
         ||
         e._id != ev._id //Ne pas faire le test sur l'event lui même
         &&
         (parent_id != e.id && e.parent_id != ev.id) //Ne pas prendre en compte les enfants
        )
        &&
        !e.allDay // Ne pas tester les event qui occupe toute la journée
        &&
        (!e.cross_display && e.parent_id || !e.parent_id) // Ne pas tester les enfant cross_display
        &&
        ((dates[0] < e.start && dates[1] > e.start) || (dates[0] < event_end && dates[1] > event_end)) //Si intersection des dates
        ) {
          collision = true;
          return false; //break jquery each
        }

      //Test sur les enfants, ne dépacent pas du parent
      //test désactivé pour les parents car les enfants sont déplacés en même temps.
      if(ev && (parent_id == e.id || e.parent_id == ev.id) && parent_id) {
        if(parent_id) {
          parent_event = e;
          children_event = { start: dates[0], end: dates[1] };
        } else {
          parent_event = { start: dates[0], end: dates[1] };
          children_event = e;
        }

        if(parent_event.start > children_event.start || parent_event.end < children_event.end) {
          collision = true;
          return false; //break jquery each
        }
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
