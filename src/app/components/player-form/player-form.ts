import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { OwService } from '../../services/ow.service';
import { HEROES, Player, Role } from '../../models/ow.models';
import { HeroSelectorModalComponent } from '../hero-selector-modal/hero-selector-modal';

@Component({
  selector: 'app-player-form',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NgOptimizedImage, HeroSelectorModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './player-form.html',
  styleUrl: './player-form.css',
})
export class PlayerFormComponent implements OnInit {
  private owService = inject(OwService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  roles: Role[] = ['Tank', 'Damage', 'Support'];
  heroes = HEROES;
  playerId: string | null = null;
  showHeroModal = signal(false);
  modalMode = signal<'main' | 'secondary'>('main');
  isSubmitting = signal(false);

  playerForm = this.fb.group({
    name: ['', [Validators.required]],
    preferredRole: new FormControl<Role>('Damage', { nonNullable: true }),
    secondaryRoles: this.fb.array<Role>([]),
    mainHeroIds: this.fb.nonNullable.control<string[]>([]),
    secondaryHeroIds: this.fb.nonNullable.control<string[]>([]),
    notes: ['']
  });

  private mainHeroIds = toSignal(this.playerForm.controls.mainHeroIds.valueChanges, { initialValue: [] as string[] });
  private secondaryHeroIds = toSignal(this.playerForm.controls.secondaryHeroIds.valueChanges, { initialValue: [] as string[] });

  player = signal<Player | null>(null);

  ngOnInit() {
    this.playerId = this.route.snapshot.paramMap.get('id');
    if (this.playerId) {
      this.owService.getPlayer(this.playerId).subscribe(p => {
        if (p) {
          this.player.set(p);
          this.playerForm.patchValue({
            name: p.name,
            preferredRole: p.preferredRole,
            mainHeroIds: p.mainHeroIds || [],
            secondaryHeroIds: p.secondaryHeroIds || [],
            notes: p.notes
          }, { emitEvent: true });

          // Clear and rebuild secondaryRoles array
          const secondaryRolesArray = this.playerForm.controls.secondaryRoles;
          secondaryRolesArray.clear();
          p.secondaryRoles.forEach(role => {
            secondaryRolesArray.push(new FormControl(role, { nonNullable: true }) as any);
          });
        }
      });
    }
  }

  selectedMainHeroes = computed(() => {
    const ids = this.mainHeroIds();
    return HEROES.filter(h => ids.includes(h.id));
  });

  selectedSecondaryHeroes = computed(() => {
    const ids = this.secondaryHeroIds();
    return HEROES.filter(h => ids.includes(h.id));
  });

  getFilteredHeroes(role?: Role) {
    if (!role) return this.heroes;
    return this.heroes.filter(h => h.role === role);
  }

  onRoleChange(role: Role, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const secondaryRolesArray = this.playerForm.controls.secondaryRoles;

    if (checkbox.checked) {
      secondaryRolesArray.push(this.fb.control(role) as any);
    } else {
      const index = secondaryRolesArray.value.indexOf(role);
      if (index > -1) {
        secondaryRolesArray.removeAt(index);
      }
    }
  }

  isRoleSelected(role: Role) {
    return this.playerForm.value.secondaryRoles?.includes(role) ?? false;
  }

  toggleHeroModal(mode: 'main' | 'secondary' = 'main') {
    this.modalMode.set(mode);
    this.showHeroModal.set(!this.showHeroModal());
  }

  onHeroSelectionChange(heroIds: string[]) {
    if (this.modalMode() === 'main') {
      this.playerForm.patchValue({ mainHeroIds: heroIds });
    } else {
      this.playerForm.patchValue({ secondaryHeroIds: heroIds });
    }
  }

  async save() {
    if (this.playerForm.invalid) {
      this.playerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const playerData = this.playerForm.getRawValue() as Player;

    console.log('Tentative d\'enregistrement du joueur...', playerData);

    try {
      if (this.playerId) {
        console.log('Mise à jour du joueur existant ID:', this.playerId);
        await this.owService.updatePlayer({ ...playerData, id: this.playerId });
        console.log('Mise à jour réussie');
      } else {
        console.log('Ajout d\'un nouveau joueur');
        await this.owService.addPlayer(playerData);
        console.log('Ajout réussi');
      }
      this.router.navigate(['/players']);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du joueur:', error);
      alert('Une erreur est survenue lors de l\'enregistrement du joueur. Veuillez vérifier la console.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
