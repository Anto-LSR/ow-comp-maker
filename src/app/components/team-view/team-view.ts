import { Component, inject, ChangeDetectionStrategy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OwService } from '../../services/ow.service';
import { Player, HEROES, Role, MapMode, MAP_MODES, Side } from '../../models/ow.models';
import { HeroSelectorModalComponent } from '../hero-selector-modal/hero-selector-modal';

interface SelectedPlayer extends Player {
  assignedRole: Role;
}

@Component({
  selector: 'app-team-view',
  imports: [CommonModule, HeroSelectorModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './team-view.html',
  styleUrl: './team-view.css',
})
export class TeamViewComponent {
  private owService = inject(OwService);

  players$ = this.owService.getPlayers();
  selectedPlayers = signal<SelectedPlayer[]>([]);
  selectedCounterIds = signal<string[]>([]);
  selectedMapMode = signal<MapMode | null>(null);
  selectedSide = signal<Side>('Attaque');
  detailedPlaybook = signal<boolean>(false);
  mapModes = MAP_MODES;
  showHeroModal = signal(false);

  constructor() {
    // Load from cache
    const cachedPlayers = localStorage.getItem('team_view_players');
    if (cachedPlayers) {
      try {
        this.selectedPlayers.set(JSON.parse(cachedPlayers));
      } catch (e) {
        console.error('Error parsing cached players', e);
      }
    }

    const cachedCounters = localStorage.getItem('team_view_counters');
    if (cachedCounters) {
      try {
        this.selectedCounterIds.set(JSON.parse(cachedCounters));
      } catch (e) {
        console.error('Error parsing cached counters', e);
      }
    }

    const cachedMapMode = localStorage.getItem('team_view_map_mode');
    if (cachedMapMode && MAP_MODES.includes(cachedMapMode as MapMode)) {
      this.selectedMapMode.set(cachedMapMode as MapMode);
    }

    const cachedSide = localStorage.getItem('team_view_side');
    if (cachedSide === 'Attaque' || cachedSide === 'Défense') {
      this.selectedSide.set(cachedSide);
    }

    const cachedDetailed = localStorage.getItem('team_view_detailed_playbook');
    if (cachedDetailed === 'true') {
      this.detailedPlaybook.set(true);
    }

    // Persist to cache
    effect(() => {
      localStorage.setItem('team_view_players', JSON.stringify(this.selectedPlayers()));
    });
    effect(() => {
      localStorage.setItem('team_view_counters', JSON.stringify(this.selectedCounterIds()));
    });
    effect(() => {
      const mode = this.selectedMapMode();
      if (mode) {
        localStorage.setItem('team_view_map_mode', mode);
      } else {
        localStorage.removeItem('team_view_map_mode');
      }
    });
    effect(() => {
      localStorage.setItem('team_view_side', this.selectedSide());
    });
    effect(() => {
      localStorage.setItem('team_view_detailed_playbook', String(this.detailedPlaybook()));
    });
  }

  toggleSelection(player: Player) {
    const current = this.selectedPlayers();
    const index = current.findIndex(p => p.id === player.id);
    if (index > -1) {
      this.selectedPlayers.update(players => players.filter(p => p.id !== player.id));
    } else {
      if (current.length < 5) {
        this.selectedPlayers.update(players => [...players, { ...player, assignedRole: player.preferredRole }]);
      } else {
        alert('Une équipe est composée de 5 joueurs max.');
      }
    }
  }

  setRole(player: SelectedPlayer, role: Role) {
    this.selectedPlayers.update(players =>
      players.map(p => p.id === player.id ? { ...p, assignedRole: role } : p)
    );
  }

  isSelected(player: Player) {
    return this.selectedPlayers().some(p => p.id === player.id);
  }

  getHeroNames(heroIds: string[]) {
    if (!heroIds || heroIds.length === 0) return 'Aucun';
    return heroIds.map(id => HEROES.find(h => h.id === id)?.name || 'Inconnu').join(', ');
  }

  selectedCounters = computed(() => {
    const ids = this.selectedCounterIds();
    return HEROES.filter(h => ids.includes(h.id));
  });

  reset() {
    if (confirm('Voulez-vous vraiment réinitialiser les choix ?')) {
      this.selectedPlayers.set([]);
      this.selectedCounterIds.set([]);
      this.selectedMapMode.set(null);
      this.selectedSide.set('Attaque');
    }
  }

  setMapMode(mode: MapMode) {
    this.selectedMapMode.set(mode);
  }

  setSide(side: Side) {
    this.selectedSide.set(side);
  }

  toggleDetailedPlaybook() {
    this.detailedPlaybook.update(v => !v);
  }

  toggleHeroModal() {
    this.showHeroModal.set(!this.showHeroModal());
  }

  onHeroSelectionChange(heroIds: string[]) {
    this.selectedCounterIds.set(heroIds);
  }

  copyJson() {
    const exportData = this.getExportData();
    const json = JSON.stringify(exportData, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      alert('JSON copié dans le presse-papier !');
    });
  }

  private getExportData() {
    return this.selectedPlayers().map(p => ({
      name: p.name,
      assignedRole: p.assignedRole,
      preferredRole: p.preferredRole,
      secondaryRoles: p.secondaryRoles,
      mainHeroes: this.getHeroNames(p.mainHeroIds),
      secondaryHeroes: this.getHeroNames(p.secondaryHeroIds),
      notes: p.notes
    }));
  }

  copyPrompt() {
    const prompt = this.getPrompt();

    navigator.clipboard.writeText(prompt).then(() => {
      alert('Prompt copié dans le presse-papier ! ');
    });
  }

  private getPrompt(): string {
    const players = this.selectedPlayers();
    const counters = this.selectedCounters();
    const mapMode = this.selectedMapMode();
    const side = this.selectedSide();
    const detailed = this.detailedPlaybook();
    const teamData = this.getExportData();
    const jsonStr = JSON.stringify(teamData, null, 2);

    let roleContext = '';
    if (players.length < 5) {
      roleContext = `Note : Il y a seulement ${players.length} joueurs. Les rôles restants pour compléter une équipe de 5 (1 Tank, 2 Damage, 2 Support) seront occupés par des joueurs aléatoires (random).`;
    }

    let extraContext = '';
    if (mapMode) {
      extraContext += `\nMODE DE JEU : La partie se joue en mode ${mapMode}.`;
    }
    extraContext += `\nCÔTÉ : L'équipe est actuellement en ${side.toUpperCase()}.`;

    if (detailed) {
      extraContext += `\nOPTION : "Plan de jeu détaillé" activée. Les joueurs ont un niveau environ PLATINE. Fournis des instructions tactiques plus précises, incluant le positionnement (ex: high ground), la gestion des priorités de cible et l'utilisation optimale des capacités pour ce niveau.`;
    }

    if (counters.length > 0) {
      extraContext += `\nHÉROS À COUNTER : L'équipe adverse joue ou risque de jouer : ${counters.map(h => h.name).join(', ')}. Il est CRUCIAL de proposer des compositions qui contrent efficacement ces héros.
      Pour chaque composition, inclus impérativement :
      - Dans le "Plan de jeu général" : Comment la composition globale neutralise la menace des héros adverses listés.
      - Dans les "Plans de jeu individuel" : Des conseils spécifiques pour chaque joueur sur la manière de gérer ou de contrer ces héros avec leur personnage assigné.`;
    }

    return `En tant qu'expert coach Overwatch 2, analyse cette équipe et propose DEUX compositions optimisées basées sur la META ACTUELLE : une composition pour l'ATTAQUE et une composition pour la DÉFENSE.
Met un accent particulier sur la composition de ${side.toUpperCase()} car c'est le côté actuel du match.
${extraContext}

${roleContext}

Adresse-toi à des joueurs qui connaissent très bien le jeu, ses mécaniques et ses termes techniques. Evite cependant le jargon trop technique.
L'objectif est que les conseils soient immédiatement compréhensibles et applicables par les joueurs.

CONTRAINTE DE SÉLECTION (STRICTE) :
- Pour chaque joueur listé ci-dessous, tu DOIS lui attribuer le rôle spécifié dans son champ "assignedRole".
- Pour chaque joueur, tu ne peux proposer QUE des héros présents dans sa liste "mainHeroes" ou "secondaryHeroes" ET correspondant à son "assignedRole".
- Les héros secondaires ("secondaryHeroes") comptent aussi beaucoup pour s'adapter à la situation.
- Une équipe standard se compose de : 1 Tank, 2 Damage, 2 Support. Complète les rôles manquants avec des héros meta si moins de 5 joueurs sont fournis.

Propose une première composition idéale pour l'ATTAQUE, puis une DEUXIÈME proposition pour la DÉFENSE.
Les deux compositions doivent garder les MÊMES joueurs sur les MÊMES rôles assignés ("assignedRole"), mais peuvent proposer des héros différents pour ces joueurs si leur pool de héros le permet (en piochant dans leurs mains ou secondaires).

Voici les données des joueurs de mon équipe au format JSON :
${jsonStr}

Pour CHAQUE composition (Attaque et Défense), respecte scrupuleusement cet ordre de présentation :
1. Composition : Liste chaque joueur associé à son héros conseillé (ex: "Joueur A (Tank) : Reinhardt"). Pour les rôles complétés par des "random", indique juste "Random (Rôle) : Héros".
2. Plan de jeu général : Le style de jeu global de l'équipe et comment gagner ensemble en quelques phrases simples. Si des héros à counter sont spécifiés, explique ici la stratégie globale de contre.
3. Objectifs concrets : 3 points clés simples à appliquer pendant la partie (ex: "Rester groupés derrière le bouclier").
4. Plans de jeu individuel : Un conseil court et actionnable pour chaque joueur présent sur son héros. Si des héros à counter sont spécifiés, précise ici son rôle individuel dans le contre de ces héros.

Retourne une réponse structurée, simple et encourageante pour aider l'équipe à progresser.`;
  }
}
