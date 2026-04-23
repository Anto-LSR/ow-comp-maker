import { Injectable } from '@angular/core';
// import { GoogleGenerativeAI } from '@google/generative-ai';
// import { geminiConfig } from '../../environments/environment';
import { groqConfig } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GroqService {
  /*
  private readonly genAI = new GoogleGenerativeAI(geminiConfig.apiKey);
  private readonly model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

  async generateAnalysisGemini(prompt: string): Promise<string> {
    if (!geminiConfig.apiKey || geminiConfig.apiKey === 'METTRE_VOTRE_CLE_API_ICI') {
      throw new Error('Clé API Gemini non configurée. Veuillez l\'ajouter dans src/environments/environment.ts');
    }

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Erreur lors de l\'appel à Gemini:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur lors de l\'appel à Gemini');
    }
  }
  */

  async generateAnalysis(prompt: string): Promise<string> {
    throw new Error('L\'appel à Groq est temporairement désactivé.');
    /*
    if (!groqConfig.apiKey || groqConfig.apiKey === 'VOTRE_CLE_API_GROQ_ICI') {
      throw new Error('Clé API Groq non configurée. Veuillez l\'ajouter dans src/environments/environment.ts');
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqConfig.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erreur lors de l\'appel à Groq');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Erreur lors de l\'appel à Groq:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur lors de l\'appel à Groq');
    }
    */
  }
}
