export interface Person {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  name: string;
  members: Person[];
}

export interface LuckyDrawConfig {
  allowRepeats: boolean;
}

export interface GroupConfig {
  groupSize: number;
}
