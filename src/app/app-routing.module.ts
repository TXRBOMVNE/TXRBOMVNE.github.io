import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthComponent } from "./auth/auth.component";
import { AuthGuard } from "./auth/auth.guard";
import { PlayerComponent } from "./player/player.component";

const appRoutes: Routes = [
  { path: "", pathMatch: "full", redirectTo: "auth" },
  { path: "auth", component: AuthComponent },
  { path: "play", component: PlayerComponent, canActivate: [AuthGuard] }
]

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes),
  ],
  exports: [RouterModule]
})

export class AppRoutingModule { }
