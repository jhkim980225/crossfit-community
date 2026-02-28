export interface PR {
  id: string;
  userId: string;
  movement: string;
  value: number;
  unit: string;
  memo: string | null;
  date: Date;
  createdAt: Date;
}

export interface PRWithHistory {
  movement: string;
  best: PR;
  history: PR[];
}
