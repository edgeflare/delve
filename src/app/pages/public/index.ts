import { Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { AboutComponent } from "./about/about.component";
import { CommunityComponent } from "./community/community.component";
import { NotFoundComponent } from "./not-found/not-found.component";
// import { NavComponent } from "@app/shared/components";

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    // component: NavComponent, // 100vh reveal height
    children: [
      { path: 'about-delve', component: AboutComponent },
      { path: 'community', component: CommunityComponent },
      { path: '', component: HomeComponent },
      { path: '**', component: NotFoundComponent, title: 'Page Not Found' }
    ],
  },
];

