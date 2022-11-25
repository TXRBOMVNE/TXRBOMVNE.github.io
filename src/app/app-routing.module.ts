import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthComponent } from "./auth/auth.component";
import { AuthGuard } from "./auth/auth.guard";
import { NotFoundComponent } from "./player/not-found/not-found.component";
import { PlayerComponent } from "./player/player.component";
import { TabResolver } from "./player/tab/tab.resolver";
import { UserComponent } from "./user/user.component";

const appRoutes: Routes = [
  { path: "", pathMatch: "full", redirectTo: "play/3lyHyxVE8JHvNz75wBmExR/2" },
  { path: "auth", component: AuthComponent },
  { path: "user", component: UserComponent, canActivate: [AuthGuard] },
  {
    path: "play", canActivate: [AuthGuard], children:
      [
        { path: "", pathMatch: "full", redirectTo: "3lyHyxVE8JHvNz75wBmExR/0" },
        {
          path: ":id", children: [
            { path: "", pathMatch: "full", redirectTo: "0" },
            { path: ":tabId", resolve: { "tab": TabResolver }, component: PlayerComponent },
          ]
        },
        { path: "**", redirectTo: "/not-found" }
      ],
  },
  { path: "not-found", component: NotFoundComponent },
]

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes),
  ],
  exports: [RouterModule]
})

export class AppRoutingModule { }
