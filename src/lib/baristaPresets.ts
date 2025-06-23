// Barista preset types and data for Pour Perfect
export type BaristaPhase =
  | 'Bloom'
  | 'First Pour'
  | 'First Rest'
  | 'Second Pour'
  | 'Second Rest'
  | 'Third Pour'
  | 'Drawdown'
  | 'Other';

export interface BaristaSignatureMove {
  phase: BaristaPhase | BaristaPhase[];
  text: string;
}

export interface BaristaPreset {
  name: string;
  credentials: string;
  dose: number;
  ratio: number;
  grind?: string;
  signature: BaristaSignatureMove[];
}

export const baristaPresets: BaristaPreset[] = [
  {
    name: 'Tetsu Kasuya (2016)',
    credentials: 'World Brewers Cup Champion',
    dose: 20,
    ratio: 15,
    grind: 'Medium-coarse',
    signature: [
      {
        phase: ['First Pour', 'Second Pour', 'Third Pour'],
        text: 'Split water 40% / 60% ("4:6" method). First 2 pours tune sweetness/acidity, last 3 control strength.'
      }
    ]
  },
  {
    name: 'James Hoffmann',
    credentials: 'World Barista Champ & educator',
    dose: 30,
    ratio: 16.7,
    grind: 'Medium',
    signature: [
      { phase: 'Bloom', text: '60g bloom, swirl' },
      { phase: 'First Pour', text: '240g pour' },
      { phase: 'Second Pour', text: '200g pour, target ~3:30, hot (≈100°C) water.' }
    ]
  },
  {
    name: 'Carlos Medina (2023)',
    credentials: 'World Brewers Cup Champion',
    dose: 15.5,
    ratio: 16,
    signature: [
      { phase: 'Other', text: 'Five equal 50g pulses every 30s in Origami dripper; 91°C water; 2min 40s target.' }
    ]
  },
  {
    name: 'Martin Wölfl (2024)',
    credentials: 'World Brewers Cup Champion',
    dose: 17,
    ratio: 15.9,
    signature: [
      { phase: 'Bloom', text: 'Orea V4 fast-flow. 60g bloom (30s)' },
      { phase: 'First Pour', text: '60g (0:40)' },
      { phase: 'Second Pour', text: '50g (1:20)' },
      { phase: 'Third Pour', text: '100g (2:00). 93°C; 630μm grind.' }
    ]
  },
  {
    name: 'Shih-Yuan Hsu (2022)',
    credentials: 'World Brewers Cup Champion',
    dose: 14,
    ratio: 14.3,
    signature: [
      { phase: 'First Pour', text: 'Four 50g pours; first at 70°C, rest at 95°C; Orea V3 + Kalita filter.' }
    ]
  }
]; 