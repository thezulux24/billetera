import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SupabaseService } from './services/supabase.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'billetera';

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    // Check authentication state on app initialization
    this.supabaseService.currentUser.subscribe(user => {
      const currentRoute = this.router.url;
      
      if (user) {
        // User is logged in
        if (currentRoute === '/login' || currentRoute === '/signup' || currentRoute === '/') {
          this.router.navigate(['/dashboard']);
        }
      } else if (currentRoute === '/dashboard') {
        // User is not logged in and trying to access dashboard
        this.router.navigate(['/login']);
      }
    });
  }
}
