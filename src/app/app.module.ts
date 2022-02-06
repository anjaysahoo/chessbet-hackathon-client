import {HttpClientModule} from '@angular/common/http';
import {SearchBarPipe} from './pipes/searchbar/search-bar.pipe';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LiveBetComponent} from './components/live-bet/live-bet.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatStepperModule} from '@angular/material/stepper';
import {MatIconModule} from '@angular/material/icon';
import {STEPPER_GLOBAL_OPTIONS} from '@angular/cdk/stepper';


import {FormsModule} from '@angular/forms';
import {NewBetComponent} from './components/new-bet/new-bet.component';
import {MatSortModule} from '@angular/material/sort';
import {HowToBetComponent} from './components/how-to-bet/how-to-bet.component';
import {RulesComponent} from './components/rules/rules.component';
import {FaqComponent} from './components/faq/faq.component';
import {ResultsComponent} from './components/results/results.component';
import {ContactUsComponent} from './components/contact-us/contact-us.component';
import {ClaimComponent} from './components/claim/claim.component';
import {AnimatedDigitComponent} from './animated/animated-digit/animated-digit.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import { RoutingService } from './services/routing/routing.service';


@NgModule({
  declarations: [
    AppComponent,
    LiveBetComponent,
    SearchBarPipe,
    NewBetComponent,
    HowToBetComponent,
    RulesComponent,
    FaqComponent,
    ResultsComponent,
    ContactUsComponent,
    ClaimComponent,
    AnimatedDigitComponent

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatPaginatorModule,
    FormsModule,
    MatSortModule,
    MatStepperModule,
    MatIconModule,
    HttpClientModule,
    MatTooltipModule,
    RoutingService
  ],
  exports: [
    MatStepperModule
  ],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: {displayDefaultIndicatorType: false}
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
