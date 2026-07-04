import type { DeepStringify } from '../en';
import type { documents as enDocuments } from '../en/documents';

export const documents: DeepStringify<typeof enDocuments> = {
  scan: {
    title: 'Analyse des documents',
    uploading: 'Televersement securise de vos fichiers...',
    extracting: 'Lecture du permis, de la piece d identite et de l adresse...',
    finishing: 'Finalisation des details extraits...',
    temporaryUnavailable: 'L analyse des documents est temporairement surchargee. Veuillez reessayer dans quelques minutes.',
  },
} as const;
