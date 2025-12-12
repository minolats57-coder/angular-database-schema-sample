import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { LogService } from '../log.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ FormsModule, CommonModule ],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  user = { username: '', password: '' };
  profile: any = null;
  isAdmin = false;

  constructor(private authService: AuthService, private log: LogService) { }

  async onRegister() {
    try {
      const response = await this.authService.register(this.user);
      this.log.info('User registered:', response);
    } catch (error) {
      this.log.error('Error registering user:', error);
    }
  }

  async onRegisterAdmin() {
    try {
      const response = await this.authService.registerAdmin(this.user);
      this.log.info('Admin registered:', response);
    } catch (error) {
      this.log.error('Error registering admin:', error);
    }
  }

  async onLogin() {
    try {
      const response = await this.authService.login(this.user);
      this.log.info('User logged in:', response);
    } catch (error) {
      this.log.error('Error logging in:', error);
    }
  }

  async onGetProfile() {
    try {
      this.profile = await this.authService.getProfile();
      this.log.info('Profile:', this.profile);
    } catch (error) {
      this.log.error('Error getting profile:', error);
    }
  }

  async onGetAdminData() {
    try {
      const response = await this.authService.getAdminData();
      this.log.info('Admin data:', response);
      this.isAdmin = true;
    } catch (error) {
      this.log.error('Error getting admin data:', error);
      this.isAdmin = false;
    }
  }
}
