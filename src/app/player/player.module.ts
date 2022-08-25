import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PlayerComponent } from "./player.component";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { TopbarComponent } from "./topbar/topbar.component";
import { TabComponent } from './tab/tab.component';
import { EditTopbarComponent } from './edit-topbar/edit-topbar.component';

@NgModule({
  declarations: [
    PlayerComponent,
    SidebarComponent,
    TopbarComponent,
    TabComponent,
    EditTopbarComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ]
})

export class PlayerModule { }
