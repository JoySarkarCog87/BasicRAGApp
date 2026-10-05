import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService, AppUser, NewUser, UserPatch } from '../../services/admin-service';

type ModalMode = 'create' | 'edit';

@Component({
  selector: 'app-adashboard',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './adashboard.html',
  styleUrl: './adashboard.css',
})
export class Adashboard {

  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);

  users = signal<AppUser[]>([]);
  isLoading = signal(false);
  loadError = signal<string | null>(null);

  search = signal('');
  roleFilter = signal('ALL');

  // null means the modal is closed. 'edit' pairs with editing().

  mode = signal<ModalMode | null>(null);
  editing = signal<AppUser | null>(null);
  isSaving = signal(false);
  saveError = signal<string | null>(null);
  toast = signal<string | null>(null);

  showPassword = false;

  // Role is intentionally absent: UserCreate only carries email and password.
  // Bounds mirror the Pydantic schema: email minLength 5, password 6-12.
  userForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email, Validators.minLength(5)]],
    password: ['', [Validators.minLength(6), Validators.maxLength(12)]],
  });

  roles = computed(() => {
    const found = new Set<string>();
    for (const user of this.users()) {
      if (user.role) found.add(user.role);
    }
    return [...found].sort();
  });

  filteredUsers = computed(() => {
    const term = this.search().trim().toLowerCase();
    const role = this.roleFilter();
    return this.users().filter(user => {
      const matchesRole = role === 'ALL' || user.role === role;
      const matchesTerm = !term
        || user.email.toLowerCase().includes(term)
        || String(user.id).toLowerCase().includes(term);
      return matchesRole && matchesTerm;
    });
  });

  adminCount = computed(() => this.users().filter(u => u.role === 'ADMIN').length);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users ?? []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.loadError.set(this.readError(err, 'Could not load users.'));
        this.isLoading.set(false);
      },
    });
  }

  openCreate(): void {
    this.resetModal();
    // A brand new account has no password to preserve, so one is mandatory here.
    this.userForm.reset({ email: '', password: '' });
    this.setPasswordRequired(true);
    this.editing.set(null);
    this.mode.set('create');
  }

  openEdit(user: AppUser): void {
    this.resetModal();
    // Password starts blank: a blank field means "leave the password alone".
    this.userForm.reset({ email: user.email, password: '' });
    this.setPasswordRequired(false);
    this.editing.set(user);
    this.mode.set('edit');
  }

  closeModal(): void {
    if (this.isSaving()) return;
    this.mode.set(null);
    this.editing.set(null);
  }

  private resetModal(): void {
    this.saveError.set(null);
    this.showPassword = false;
  }

  private setPasswordRequired(required: boolean): void {
    const control = this.userForm.controls['password'];
    const bounds = [Validators.minLength(6), Validators.maxLength(12)];
    control.setValidators(required ? [Validators.required, ...bounds] : bounds);
    control.updateValueAndValidity();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Builds the PATCH body from changed fields only.
  private buildPatch(user: AppUser): UserPatch {
    const { email, password } = this.userForm.value;
    const patch: UserPatch = {};
    if (email?.trim() && email.trim() !== user.email) patch.email = email.trim();
    if (password) patch.password = password;
    return patch;
  }

  // Create is always submittable; edit needs an actual change.
  get canSubmit(): boolean {
    if (this.userForm.invalid || this.isSaving()) return false;
    if (this.mode() === 'create') return true;
    const user = this.editing();
    return !!user && Object.keys(this.buildPatch(user)).length > 0;
  }

  save(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    if (this.mode() === 'create') {
      this.createUser();
    } else {
      this.saveEdit();
    }
  }

  private createUser(): void {
    const { email, password } = this.userForm.value;
    const payload: NewUser = {
      email: (email as string).trim(),
      password: password as string,
    };

    this.isSaving.set(true);
    this.saveError.set(null);
    this.adminService.createUser(payload).subscribe({
      next: (created) => {
        if (created?.id) {
          this.users.update(list => [...list, created]);
        } else {
          // No usable id in the response - refetch so the new row can be edited.
          this.loadUsers();
        }
        this.isSaving.set(false);
        this.closeModalAfterSave();
        this.showToast(`Created ${payload.email}.`);
      },
      error: (err) => {
        this.saveError.set(this.readError(err, 'Could not create the user.'));
        this.isSaving.set(false);
      },
    });
  }

  private saveEdit(): void {
    const user = this.editing();
    if (!user) return;

    const patch = this.buildPatch(user);
    if (!Object.keys(patch).length) {
      this.closeModal();
      return;
    }

    this.isSaving.set(true);
    this.saveError.set(null);

    this.adminService.updateUser(user.id, patch).subscribe({
      next: (updated) => {
        // Trust the server's response, but fall back to the patch if it returns nothing useful.
        const merged = updated?.id ? updated : { ...user, ...patch };
        this.users.update(list => list.map(u => (u.id === user.id ? { ...u, ...merged } : u)));
        this.isSaving.set(false);
        this.closeModalAfterSave();
        this.showToast(`Updated ${merged.email}.`);
      },
      error: (err) => {
        this.saveError.set(this.readError(err, 'Could not save changes.'));
        this.isSaving.set(false);
      },
    });
  }

  private closeModalAfterSave(): void {
    this.mode.set(null);
    this.editing.set(null);
  }

  private showToast(message: string): void {
    this.toast.set(message);
    setTimeout(() => this.toast.set(null), 3500);
  }

  private readError(err: any, fallback: string): string {
    return err?.error?.detail || err?.error?.message || err?.message || fallback;
  }

  deleteUser(user: AppUser): void {

    const confirmed = confirm(
      `Are you sure you want to delete ${user.email}?`
    );

    if (!confirmed) {
      return;
    }

    this.adminService.deleteUser(user.id)
      .subscribe({
        next: () => {

          this.users.update(users =>
            users.filter(
              u => u.id !== user.id
            )
          );

          this.showToast(
            `${user.email} deleted successfully.`
          );
        },

        error: (err) => {

          this.showToast(
            this.readError(
              err,
              'Could not delete user.'
            )
          );
        }
      });
  }

}
