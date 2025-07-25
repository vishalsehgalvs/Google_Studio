// Machinery data model
export type Machinery = {
  id: string;
  name: string;
  type: string;
  available: boolean;
  rentPrice: number;
  description?: string;
  imageUrl?: string; // URL or path to the uploaded image
};

export const machineryList: Machinery[] = [
  {
    id: '1',
    name: 'Tractor',
    type: 'Heavy',
    available: true,
    rentPrice: 5000,
    description: 'Powerful tractor for field work.',
    imageUrl: '/images/tractor.jpg'
  },
  {
    id: '2',
    name: 'Rotavator',
    type: 'Tillage',
    available: true,
    rentPrice: 1500,
    description: 'Rotavator for efficient soil preparation.',
    imageUrl: '/images/rotavator.jpg'
  },
  {
    id: '3',
    name: 'Cultivator',
    type: 'Tillage',
    available: true,
    rentPrice: 1200,
    description: 'Cultivator for loosening soil and removing weeds.',
    imageUrl: '/images/cultivator.jpg'
  },
  {
    id: '4',
    name: 'Seed Drill',
    type: 'Sowing',
    available: true,
    rentPrice: 2000,
    description: 'Seed drill for precise sowing of seeds.',
    imageUrl: '/images/seed-drill.jpg'
  },
  {
    id: '5',
    name: 'Harvester',
    type: 'Harvesting',
    available: false,
    rentPrice: 7000,
    description: 'Harvester for efficient crop harvesting.',
    imageUrl: '/images/harvester.jpg'
  },
  {
    id: '6',
    name: 'Sprayer',
    type: 'Protection',
    available: true,
    rentPrice: 900,
    description: 'Sprayer for pesticides and fertilizers.',
    imageUrl: '/images/sprayer.jpg'
  },
  {
    id: '7',
    name: 'Plough',
    type: 'Tillage',
    available: true,
    rentPrice: 800,
    description: 'Efficient plough for soil preparation.',
    imageUrl: '/images/plough.jpg'
  },
  {
    id: '8',
    name: 'Thresher',
    type: 'Harvesting',
    available: true,
    rentPrice: 2500,
    description: 'Thresher for separating grain from plants.',
    imageUrl: '/images/thresher.jpg'
  },
  {
    id: '9',
    name: 'Paddy Transplanter',
    type: 'Planting',
    available: true,
    rentPrice: 3000,
    description: 'Paddy transplanter for rice planting.',
    imageUrl: '/images/paddy-transplanter.jpg'
  },
  {
    id: '10',
    name: 'Baler',
    type: 'Harvesting',
    available: true,
    rentPrice: 3500,
    description: 'Baler for compressing crops into bales.',
    imageUrl: '/images/baler.jpg'
  }
];
