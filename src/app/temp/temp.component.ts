// import { Component, OnInit } from '@angular/core';

// @Component({
//   selector: 'app-temp',
//   templateUrl: './temp.component.html',
//   styleUrls: ['./temp.component.css']
// })
// export class TempComponent implements OnInit {

//   constructor() { }

//   ngOnInit() {
//   }

// }



import { Component } from '@angular/core';

@Component({
    selector: 'app-temp',
    template: `
      <h2>Drag / drop the item</h2>
      <div class="card" [sortablejs]="items.t1">
        <div *ngFor="let item of items.t1">{{ item }}</div>
      </div>
    `
})
export class TempComponent {

   items = { t1: [1, 2, 3, 4, 5] };
}
