import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OwService } from '../../services/ow.service';
import { HEROES } from '../../models/ow.models';

@Component({
  selector: 'app-player-list',
  imports: [RouterModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './player-list.html',
  styleUrl: './player-list.css',
})
export class PlayerListComponent {
  private owService = inject(OwService);
  players$ = this.owService.getPlayers();

  getHeroNames(heroIds: string[]) {
    if (!heroIds || heroIds.length === 0) return 'Aucun';
    return heroIds.map(id => HEROES.find(h => h.id === id)?.name || 'Inconnu').join(', ');
  }

  deletePlayer(id: string | undefined) {
    if (id && confirm('Supprimer ce joueur ?')) {
      this.owService.deletePlayer(id);
    }
  }
}
