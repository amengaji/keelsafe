// mobile/src/constants/permitData.ts

export type WorkTypeDefinition = {
    id: string;
    label: string;
    icon: string;
    isCritical: boolean;
    description: string;
};
  
export const WORK_TYPES: WorkTypeDefinition[] = [
    { 
        id: 'hot_work', 
        label: 'Hot Work', 
        icon: 'fire', 
        isCritical: true,
        description: 'Welding, cutting, grinding, or use of open flames.'
    },
    { 
        id: 'enclosed_space', 
        label: 'Enclosed Space', 
        icon: 'door-closed-lock', 
        isCritical: true,
        description: 'Entry into tanks, voids, or non-ventilated spaces.'
    },
    { 
        id: 'working_aloft', 
        label: 'Working Aloft', 
        icon: 'ladder', 
        isCritical: true,
        description: 'Work at height (>2m) or over the side.'
    },
    { 
        id: 'electrical', 
        label: 'High Voltage', 
        icon: 'flash', 
        isCritical: true,
        description: 'Work on equipment >1000V or main switchboard.'
    },
    { 
        id: 'underwater', 
        label: 'Underwater Ops', 
        icon: 'diving-scuba', 
        isCritical: true,
        description: 'Diving operations or hull cleaning.'
    },
    { 
        id: 'cold_work', 
        label: 'Cold Work', 
        icon: 'wrench', 
        isCritical: false,
        description: 'General maintenance, painting, or deck work.'
    },
    { 
        id: 'isolation', 
        label: 'Isolation (LOTO)', 
        icon: 'lock-outline', 
        isCritical: false,
        description: 'Lock Out / Tag Out of machinery.'
    },
    { 
        id: 'chemicals', 
        label: 'Hazardous Chems', 
        icon: 'flask', 
        isCritical: false,
        description: 'Handling dangerous goods or cleaning chemicals.'
    },
];