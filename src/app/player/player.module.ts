import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PlayerComponent } from "./player.component";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { TopbarComponent } from "./topbar/topbar.component";
import { TabComponent } from './tab/tab.component';
import { EditTopbarComponent } from './edit-topbar/edit-topbar.component';
import { EditTabComponent } from "./edit-tab/edit-tab.component";

@NgModule({
  declarations: [
    PlayerComponent,
    SidebarComponent,
    TopbarComponent,
    TabComponent,
    EditTopbarComponent,
    EditTabComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})

export class PlayerModule { }
