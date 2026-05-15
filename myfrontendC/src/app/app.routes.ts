import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { adminGuard } from './auth/admin.guard';

import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { ProfileComponent } from './pages/profile/profile';
import { ListComponent } from './petition/list-component/list-component';
import { CreateComponent } from './petition/create-component/create-component';
import { EditComponent } from './petition/edit-component/edit-component';
import { ShowComponent } from './petition/show-component/show-component';
import { HomeComponent } from './home/home-component/home-component';
import { MyPetitionsComponent } from './petition/my-petitions-component/my-petitions-component';
import { MySignsComponent } from './petition/my-signs-component/my-signs-component';

// Componentes del panel admin
import { AdminLayoutComponent } from './admin/layout/admin-layout.component';
import { AdminPeticionesListComponent } from './admin/peticiones/admin-peticiones-list/admin-peticiones-list.component';
import { AdminShowPeticionComponent } from './admin/peticiones/admin-show-peticion/admin-show-peticion.component';
import { AdminEditPeticionComponent } from './admin/peticiones/admin-edit-peticion/admin-edit-peticion.component';
import { AdminUsersListComponent } from './admin/users/admin-users-list/admin-users-list.component';
import { AdminShowUserComponent } from './admin/users/admin-show-user/admin-show-user.component';
import { AdminEditUserComponent } from './admin/users/admin-edit-user/admin-edit-user.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },

    // Rutas de peticiones (las especificas las pongo antes que las dinamicas)
    { path: 'petitions', component: ListComponent },
    { path: 'petitions/create', component: CreateComponent, canActivate: [authGuard] },
    { path: 'petitions/edit/:id', component: EditComponent, canActivate: [authGuard] },
    { path: 'petitions/:id', component: ShowComponent },

    // Mis peticiones y mis firmas
    { path: 'mypetitions', component: MyPetitionsComponent, canActivate: [authGuard] },
    { path: 'mysigns', component: MySignsComponent, canActivate: [authGuard] },

    // Login / registro / perfil
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },

    // Zona admin: rutas hijas anidadas dentro del layout
    {
        path: 'admin',
        component: AdminLayoutComponent,
        canActivate: [adminGuard],
        children: [
            { path: '', redirectTo: 'peticiones', pathMatch: 'full' },

            // Peticiones
            { path: 'peticiones', component: AdminPeticionesListComponent },
            { path: 'peticiones/edit/:id', component: AdminEditPeticionComponent },
            { path: 'peticiones/:id', component: AdminShowPeticionComponent },

            // Usuarios
            { path: 'users', component: AdminUsersListComponent },
            { path: 'users/edit/:id', component: AdminEditUserComponent },
            { path: 'users/:id', component: AdminShowUserComponent },
        ]
    },

    // Si la ruta no existe, te mando al login
    { path: '**', redirectTo: 'login' },
];
