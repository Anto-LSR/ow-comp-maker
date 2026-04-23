import { Component, input, output, computed, signal, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Hero, HEROES, Role } from '../../models/ow.models';

@Component({
  selector: 'app-hero-selector-modal',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="modal-backdrop" (click)="close.emit()" (keydown.escape)="close.emit()" tabindex="-1">
      <div class="modal-content" (click)="$event.stopPropagation()" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header>
          <h2 id="modal-title">{{ title() }} ({{ localSelectedIds().length }})</h2>
          <button type="button" class="close-btn" (click)="close.emit()" aria-label="Fermer">×</button>
        </header>

        <div class="modal-search">
          <input
            type="search"
            [value]="searchTerm()"
            (input)="onSearch($event)"
            placeholder="Rechercher un héros..."
            aria-label="Rechercher un héros"
          >
        </div>

        <div class="modal-body">
          @for (role of roles; track role) {
            @if (getHeroesByRole(role).length > 0) {
              <section class="role-section">
                <h3>{{ role }}</h3>
                <div class="hero-grid">
                  @for (hero of getHeroesByRole(role); track hero.id) {
                    <button
                      type="button"
                      class="hero-card"
                      [class.selected]="isSelected(hero.id)"
                      (click)="toggleHero(hero.id)"
                      [attr.aria-pressed]="isSelected(hero.id)"
                    >
                      <div class="hero-image-container">
                        <img
                          [src]="hero.portraitUrl || 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/v2/heroes/' + hero.id + '/icon.png'"
                          [alt]="hero.name"
                          width="80"
                          height="80"
                        >
                      </div>
                      <span class="hero-name">{{ hero.name }}</span>
                    </button>
                  }
                </div>
              </section>
            }
          }
        </div>

        <footer>
          <button type="button" class="btn-primary" (click)="confirmSelection()">Terminer</button>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .modal-content {
      background: #1a1a1a;
      color: white;
      border-radius: 8px;
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }
    header {
      padding: 1rem;
      border-bottom: 1px solid #333;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    header h2 { margin: 0; font-size: 1.25rem; }
    .close-btn {
      background: none;
      border: none;
      color: #ccc;
      font-size: 2rem;
      cursor: pointer;
    }
    .modal-body {
      padding: 1rem;
      overflow-y: auto;
      flex: 1;
    }
    .modal-search {
      padding: 0 1rem 1rem 1rem;
      border-bottom: 1px solid #333;
    }
    .modal-search input {
      width: 100%;
      padding: 0.75rem;
      background: #2a2a2a;
      border: 1px solid #444;
      border-radius: 4px;
      color: white;
      font-size: 1rem;
    }
    .modal-search input:focus {
      outline: none;
      border-color: #f99e1a;
    }
    .role-section h3 {
      border-left: 4px solid #f99e1a;
      padding-left: 0.5rem;
      margin-top: 1.5rem;
      margin-bottom: 1rem;
    }
    .hero-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 1rem;
    }
    .hero-card {
      background: #2a2a2a;
      border: 2px solid transparent;
      border-radius: 4px;
      padding: 0.5rem;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: all 0.2s;
      color: white;
    }
    .hero-card:hover { background: #3a3a3a; }
    .hero-card.selected {
      border-color: #f99e1a;
      background: #3d2a0e;
    }
    .hero-image-container {
      width: 80px;
      height: 80px;
      margin-bottom: 0.5rem;
      overflow: hidden;
      border-radius: 4px;
    }
    .hero-name {
      font-size: 0.8rem;
      text-align: center;
      word-break: break-word;
    }
    footer {
      padding: 1rem;
      border-top: 1px solid #333;
      display: flex;
      justify-content: flex-end;
    }
    .btn-primary {
      background: #f99e1a;
      color: black;
      border: none;
      padding: 0.5rem 1.5rem;
      border-radius: 4px;
      font-weight: bold;
      cursor: pointer;
    }
    .btn-primary:hover { background: #ffb84d; }
  `]
})
export class HeroSelectorModalComponent {
  selectedIds = input.required<string[]>();
  title = input<string>('Sélectionner les héros');
  selectionChange = output<string[]>();
  close = output<void>();

  roles: Role[] = ['Tank', 'Damage', 'Support'];
  allHeroes = HEROES;
  localSelectedIds = signal<string[]>([]);
  searchTerm = signal('');

  constructor() {
    effect(() => {
      this.localSelectedIds.set([...this.selectedIds()]);
    }, { allowSignalWrites: true });
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  getHeroesByRole(role: Role): Hero[] {
    const term = this.searchTerm().toLowerCase().trim();
    return this.allHeroes.filter(h =>
      h.role === role &&
      (term === '' || h.name.toLowerCase().includes(term))
    );
  }

  isSelected(heroId: string): boolean {
    return this.localSelectedIds().includes(heroId);
  }

  toggleHero(heroId: string): void {
    const current = [...this.localSelectedIds()];
    const index = current.indexOf(heroId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(heroId);
    }
    this.localSelectedIds.set(current);
  }

  confirmSelection(): void {
    this.selectionChange.emit(this.localSelectedIds());
    this.close.emit();
  }
}
