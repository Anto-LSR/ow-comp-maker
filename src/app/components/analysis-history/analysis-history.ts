import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OwService } from '../../services/ow.service';
import { AnalysisResult } from '../../models/ow.models';

@Component({
  selector: 'app-analysis-history',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './analysis-history.html',
  styleUrl: './analysis-history.css',
})
export class AnalysisHistoryComponent {
  private owService = inject(OwService);
  results$ = this.owService.getAnalysisResults();

  deleteResult(id: string | undefined) {
    if (id && confirm('Supprimer ce résultat de l\'historique ?')) {
      this.owService.deleteAnalysisResult(id);
    }
  }

  formatDate(date: any) {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleString();
  }
}
