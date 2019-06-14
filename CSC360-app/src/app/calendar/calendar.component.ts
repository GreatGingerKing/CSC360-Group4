import {   Component, ChangeDetectionStrategy, ViewChild, TemplateRef, OnInit } from '@angular/core';
import { Location} from '@angular/common';
import { startOfDay, endOfDay, subDays, addDays, endOfMonth, isSameDay, isSameMonth, addHours } from 'date-fns';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarView } from 'angular-calendar';
import {Router, ActivatedRoute} from '@angular/router';
import {Trip} from '../trip';
import {AngularFireList} from '@angular/fire/database';
import {FirebaseUTEService} from '../firebase-ute.service';
import { load } from '@angular/core/src/render3';

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF'
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  }
};

@Component({
  selector: 'app-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})

export class CalendarComponent implements OnInit {
  trips: Trip[];
  hideWhenNoTrips = false;
  noTrips = false;
  preLoader = true;
  userName: string;
  
@ViewChild('modalContent') modalContent: TemplateRef<any>;

  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fa fa-fw fa-pencil"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      }
    },
    {
      label: '<i class="fa fa-fw fa-times"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter(iEvent => iEvent !== event);
        this.handleEvent('Deleted', event);
      }
    }
  ];

  refresh: Subject<any> = new Subject();

  events: CalendarEvent[] = [];
 
  activeDayIsOpen: boolean = false;

  constructor(private modal: NgbModal,
              private location: Location,
              private router: Router,
              private fbUTEService: FirebaseUTEService,
              private route: ActivatedRoute) {}

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      this.viewDate = date;
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;

      } else {
        this.activeDayIsOpen = true;
      }
    }
    let month = date.getMonth() + 1; //Stores numeric month value
    let day = date.getDate(); //Stores numeric day value
    this.router.navigate(['/day'], {state: {month : month, day : day}}); //Sends data over to day page
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map(iEvent => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd
        };
      }
      return iEvent;
    });
    this.handleEvent('Dropped or resized', event);
  }

  handleEvent(action: string, event: CalendarEvent): void {
    this.modalData = { event, action };
    this.modal.open(this.modalContent, { size: 'lg' });
  }


  deleteEvent(eventToDelete: CalendarEvent) {
    this.events = this.events.filter(event => event !== eventToDelete);
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  populateTrips(){
    if(this.trips.length > 0){
      for(let vaca of this.trips){
        this.events = [...this.events, {
          title: vaca.name,
          start: startOfDay(vaca.startDate),
          end: endOfDay(vaca.endDate),
          color: colors.blue,
          actions: this.actions,
          allDay: true
        }];
      }
      this.refresh.next();
    }
  }

  ngOnInit() {
    this.dataState();
    let t = this.fbUTEService.getTripsByUserId();
    t.snapshotChanges().subscribe( data => {
      this.trips = [];
      data.forEach( item => {
        let a = item.payload.toJSON();
        a['$key'] = item.key;
        this.trips.push(a as Trip);
      });

      this.populateTrips();
      
    });
    
  }

  dataState() {
    this.fbUTEService.getTripsByUserId().valueChanges().subscribe(data => {
      this.preLoader = false;
      if (data.length <= 0) {
        this.hideWhenNoTrips = false;
        this.noTrips = true;
      } else {
        this.hideWhenNoTrips = true;
        this.noTrips = false;
      }
    });
  }

  goBack() {
    this.location.back();
  }
}
