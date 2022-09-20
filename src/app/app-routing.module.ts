import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthComponent } from "./auth/auth.component";
import { AuthGuard } from "./auth/auth.guard";
import { PlayerComponent } from "./player/player.component";
import { TabResolver } from "./player/tab/tab.resolver";

const appRoutes: Routes = [
  { path: "", pathMatch: "full", redirectTo: "play/tracks/0" },
  { path: "auth", component: AuthComponent },
  { path: "play/tracks/:id", component: PlayerComponent, canActivate: [AuthGuard], resolve: { "tab": TabResolver } },
]

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes),
  ],
  exports: [RouterModule]
})

export class AppRoutingModule { }
