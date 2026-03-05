// 737 MAX 8 Per-Registration Data — sourced from B737MAX LTS Tool V1.xlsm (DOWDOI sheet)
// BEW = Basic Empty Weight (kg), bew_iu = Basic Empty Weight Index Unit

export const MAX_8_REGISTRATIONS = [
  { reg: '9M-MVA', bew: 44351, bew_iu: 41.67 },
  { reg: '9M-MVB', bew: 44386, bew_iu: 41.78 },
  { reg: '9M-MVC', bew: 44305, bew_iu: 41.57 },
  { reg: '9M-MVD', bew: 44335, bew_iu: 41.56 },
  { reg: '9M-MVE', bew: 44352, bew_iu: 41.67 },
  { reg: '9M-MVF', bew: 44318, bew_iu: 42.12 },
  { reg: '9M-MVG', bew: 44326, bew_iu: 41.45 },
  { reg: '9M-MVH', bew: 44342, bew_iu: 42.01 },
  { reg: '9M-MVI', bew: 44319, bew_iu: 42.12 },
  { reg: '9M-MVJ', bew: 44329, bew_iu: 41.90 },
  { reg: '9M-MVK', bew: 44369, bew_iu: 41.89 },
  { reg: '9M-MVL', bew: 44296, bew_iu: 42.01 },
  { reg: '9M-MVM', bew: 44326, bew_iu: 41.79 },
];

// Pantry options — sourced from B737MAX LTS Tool V1.xlsm (DOWDOI sheet, rows 12–20)
export const MAX_8_PANTRY_OPTIONS = [
  { id: 'A',        label: 'A',                   weight: 1296, index:  0.69  },
  { id: 'B',        label: 'B',                   weight: 1149, index:  0.16  },
  { id: 'C',        label: 'C',                   weight:  957, index: -0.71  },
  { id: 'D',        label: 'D',                   weight: 1096, index:  0.84  },
  { id: 'E',        label: 'E',                   weight:  799, index:  0.00  },
  { id: 'F',        label: 'F',                   weight:  635, index: -1.62  },
  { id: 'TFLT',     label: 'TFLT / Positioning',  weight:   10, index: -0.13  },
  { id: 'DELIVERY', label: 'Delivery',             weight:  100, index: -1.26  },
];

// Crew configurations — 85 kg per crew member (MAS standard)
// Tech crew arm = 64 in from datum → each tech = -1.26289 IU
// Cabin crew arm = TBD; currently 0 per cabin crew member until sourced from LTS CG Manual
const TECH_IU = -1.26289;  // per tech crew member (confirmed from 3/0 = -3.7886 IU)
const CABIN_IU = 0;        // per cabin crew member — TBD

export const MAX_8_CREW_CONFIGS = [
  { id: '2/0',     label: '2 Tech / 0 Cabin',          tech: 2, cabin: 0 },
  { id: '2/1',     label: '2 Tech / 1 Cabin',          tech: 2, cabin: 1 },
  { id: '2/2',     label: '2 Tech / 2 Cabin',          tech: 2, cabin: 2 },
  { id: '2/3',     label: '2 Tech / 3 Cabin',          tech: 2, cabin: 3 },
  { id: '2/4',     label: '2 Tech / 4 Cabin',          tech: 2, cabin: 4 },
  { id: '2/5',     label: '2 Tech / 5 Cabin',          tech: 2, cabin: 5 },
  { id: '2/6',     label: '2 Tech / 6 Cabin',          tech: 2, cabin: 6 },
  { id: '3/0',     label: '3 Tech / 0 Cabin',          tech: 3, cabin: 0 },
  { id: '3/1',     label: '3 Tech / 1 Cabin',          tech: 3, cabin: 1 },
  { id: '3/2',     label: '3 Tech / 2 Cabin',          tech: 3, cabin: 2 },
  { id: '3/3',     label: '3 Tech / 3 Cabin',          tech: 3, cabin: 3 },
  { id: '3/4',     label: '3 Tech / 4 Cabin',          tech: 3, cabin: 4 },
  { id: '3/5',     label: '3 Tech / 5 Cabin',          tech: 3, cabin: 5 },
  { id: '3/6',     label: '3 Tech / 6 Cabin',          tech: 3, cabin: 6 },
  { id: 'TFLT',    label: '(3/0) TFLT / POSN / Training', tech: 3, cabin: 0 },
  { id: 'SEA-KUL', label: '(3/0) SEA-KUL',             tech: 3, cabin: 0 },
].map(c => ({
  ...c,
  weight: (c.tech + c.cabin) * 85,
  index: parseFloat((c.tech * TECH_IU + c.cabin * CABIN_IU).toFixed(4)),
}));
