import { Component, OnInit } from '@angular/core';
import {Event} from '../event';
import {FirebaseUTEService} from '../firebase-ute.service';
import {Location} from '@angular/common';


@Component({
  selector: 'app-event-add',
  templateUrl: './event-add.component.html',
  styleUrls: ['./event-add.component.css']
})
export class EventAddComponent implements OnInit {
  indexer: number = Event.length;
  eventAdd: Event = new Event(this.indexer - 1);
  constructor(private location: Location,
              private fbUTEService: FirebaseUTEService) { }

  ngOnInit() {
    this.eventAdd.date.setFullYear( 2019, 0, 1);
  }

  onSubmit(): void {
    this.fbUTEService.addEvent(this.eventAdd);
    this.location.back();
  }

  goBack() {
    this.location.back();
  }
}
