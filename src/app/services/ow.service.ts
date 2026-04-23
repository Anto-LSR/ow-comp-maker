import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, getDoc, query, orderBy } from '@angular/fire/firestore';
import { Player, Team, AnalysisResult } from '../models/ow.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OwService {
  private firestore = inject(Firestore);

  // Players
  getPlayers(): Observable<Player[]> {
    const playersRef = collection(this.firestore, 'players');
    return new Observable<Player[]>(subscriber => {
      const unsubscribe = onSnapshot(playersRef, snapshot => {
        const players = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Player));
        console.log(`Récupération de ${players.length} joueurs depuis Firestore`);
        subscriber.next(players);
      }, error => {
        console.error('Erreur lors de la récupération des joueurs:', error);
        subscriber.error(error);
      });
      return () => unsubscribe();
    });
  }

  getPlayer(id: string): Observable<Player> {
    const playerRef = doc(this.firestore, `players/${id}`);
    return new Observable<Player>(subscriber => {
      const unsubscribe = onSnapshot(playerRef, snapshot => {
        if (snapshot.exists()) {
          subscriber.next({ id: snapshot.id, ...snapshot.data() } as Player);
        }
      }, error => subscriber.error(error));
      return () => unsubscribe();
    });
  }

  async addPlayer(player: Player) {
    const playersRef = collection(this.firestore, 'players');
    // Nettoyage des données pour éviter les undefined
    const cleanedPlayer = JSON.parse(JSON.stringify(player));
    if (cleanedPlayer.id) delete cleanedPlayer.id;

    const docRef = await addDoc(playersRef, cleanedPlayer);
    console.log('Document écrit avec l\'ID:', docRef.id);
    return docRef;
  }

  async updatePlayer(player: Player) {
    const { id, ...data } = player;
    const playerRef = doc(this.firestore, `players/${id}`);
    const cleanedData = JSON.parse(JSON.stringify(data));

    await updateDoc(playerRef, cleanedData);
    console.log('Document mis à jour:', id);
  }

  deletePlayer(id: string) {
    const playerRef = doc(this.firestore, `players/${id}`);
    return deleteDoc(playerRef);
  }

  // Teams
  getTeams(): Observable<Team[]> {
    const teamsRef = collection(this.firestore, 'teams');
    return new Observable<Team[]>(subscriber => {
      const unsubscribe = onSnapshot(teamsRef, snapshot => {
        const teams = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Team));
        subscriber.next(teams);
      }, error => subscriber.error(error));
      return () => unsubscribe();
    });
  }

  addTeam(team: Team) {
    const teamsRef = collection(this.firestore, 'teams');
    return addDoc(teamsRef, team);
  }

  deleteTeam(id: string) {
    const teamRef = doc(this.firestore, `teams/${id}`);
    return deleteDoc(teamRef);
  }

  // Analysis Results
  getAnalysisResults(): Observable<AnalysisResult[]> {
    const resultsRef = collection(this.firestore, 'analysis_results');
    const q = query(resultsRef, orderBy('createdAt', 'desc'));

    return new Observable<AnalysisResult[]>(subscriber => {
      const unsubscribe = onSnapshot(q, snapshot => {
        const results = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as AnalysisResult));
        subscriber.next(results);
      }, error => subscriber.error(error));
      return () => unsubscribe();
    });
  }

  addAnalysisResult(result: AnalysisResult) {
    const resultsRef = collection(this.firestore, 'analysis_results');
    return addDoc(resultsRef, {
      ...result,
      createdAt: new Date()
    });
  }

  deleteAnalysisResult(id: string) {
    const resultRef = doc(this.firestore, `analysis_results/${id}`);
    return deleteDoc(resultRef);
  }
}
