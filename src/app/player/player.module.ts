import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PlayerComponent } from "./player.component";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { TopbarComponent } from "./topbar/topbar.component";
import { TabComponent } from './tab/tab.component';
import { EditTopbarComponent } from './edit-topbar/edit-topbar.component';
import { EditTabComponent } from "./edit-tab/edit-tab.component";
import { UncheckDirective } from "./directives/uncheck.directive";
import { NoteDirective } from "./directives/note.directive";
import { BarDirective } from "./directives/bar.directive";
import { SegmentDirective } from './directives/segment.directive';
import { PreventUnfocusDirective } from "./directives/prevent-unfocus.directive";
import { NotFoundComponent } from './not-found/not-found.component';
import { SearchComponent } from './sidebar/search/search.component';
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";

@NgModule({
  declarations: [
    PlayerComponent,
    SidebarComponent,
    TopbarComponent,
    TabComponent,
    EditTopbarComponent,
    EditTabComponent,
    UncheckDirective,
    NoteDirective,
    BarDirective,
    SegmentDirective,
    PreventUnfocusDirective,
    NotFoundComponent,
    SearchComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule
  ]
})

export class PlayerModule { }
