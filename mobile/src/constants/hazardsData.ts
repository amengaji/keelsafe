// mobile/src/constants/hazardsData.ts

export type HazardDef = {
    workTypeId: string;
    hazards: string[];
    ppe: string[];
    requirements: string[]; // The checklist items
};

export const HAZARD_DATABASE: HazardDef[] = [
    {
        workTypeId: 'hot_work',
        hazards: ['Fire / Explosion', 'Sparks / Molten Metal', 'Fumes / Gas'],
        ppe: ['Welding Visor', 'Leather Apron', 'Fire Retardant Overalls'],
        requirements: [
            'Fire extinguisher available nearby',
            'Fire watch posted (stay 30mins after)',
            'Area cleared of combustibles',
            'Gas test performed',
        ]
    },
    {
        workTypeId: 'enclosed_space',
        hazards: ['Oxygen Deficiency', 'Toxic Gas (H2S, CO)', 'Darkness', 'Entrapment'],
        ppe: ['Oxygen Analyzer', 'Emergency Escape Breathing Device (EEBD)'],
        requirements: [
            'Atmosphere tested (O2, LEL, H2S, CO)',
            'Ventilation arranged (Forced Draft)',
            'Communication link established',
            'Rescue team on standby',
            'Lighting adequate'
        ]
    },
    {
        workTypeId: 'working_aloft',
        hazards: ['Falling from height', 'Dropped Objects', 'Weather/Wind', 'Radio Radiation'],
        ppe: ['Safety Harness', 'Chin Strap Helmet'],
        requirements: [
            'Safety harness inspected & worn',
            'Lanyard secured to strong point',
            'Tools secured (lanyards)',
            'Area below cordoned off',
            'Radar/Whistle isolated (if on mast)'
        ]
    },
    {
        workTypeId: 'electrical',
        hazards: ['Electric Shock', 'Arc Flash', 'Power failure'],
        ppe: ['Insulated Gloves', 'Rubber Mat', 'Face Shield'],
        requirements: [
            'Circuit Breaker Locked Out (LOTO)',
            'Tags applied to isolation points',
            'Circuit tested "Dead"',
            'Insulated tools used'
        ]
    },
    // Default fallback for others
    {
        workTypeId: 'general',
        hazards: ['Slips/Trips', 'Manual Handling'],
        ppe: ['Helmet', 'Safety Shoes', 'Gloves'],
        requirements: [
            'Risk Assessment (RA) conducted',
            'Toolbox talk conducted',
            'Lighting adequate'
        ]
    }
];