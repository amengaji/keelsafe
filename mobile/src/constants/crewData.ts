// mobile/src/constants/crewData.ts

export type CrewMember = {
    id: string;
    name: string;
    rank: string;
};

// The Master can edit this list (or import from Excel in the future)
export const CREW_DATABASE: CrewMember[] = [
    { id: 'c1', name: 'Capt. James Hook', rank: 'Master' },
    { id: 'c2', name: 'William Smee', rank: 'Chief Officer' },
    { id: 'c3', name: 'John Silver', rank: 'Bosun' },
    { id: 'c4', name: 'Jack Sparrow', rank: 'AB' },
    { id: 'c5', name: 'Hector Barbossa', rank: 'Chief Engineer' },
    { id: 'c6', name: 'Joshamee Gibbs', rank: '2nd Engineer' },
    { id: 'c7', name: 'Edward Teach', rank: 'Fitter' },
    { id: 'c8', name: 'Davy Jones', rank: 'OS' },
];