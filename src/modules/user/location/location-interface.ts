export type Location = Record<string, Country>;

export interface Country {
  name: string;
  states: Record<string, State>;
}

export interface State {
  name: string;
  cities: Record<string, City>;
}

export interface City {
  name: string;
  coordinates: string;
  coordinates_accuracy_level: string;
}