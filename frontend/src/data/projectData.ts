import { FloorPlan, ProjectAmenity, AdvisorInfo } from '../types';

export const PROJECT_DETAILS = {
  name: 'Northstar One',
  developer: 'Northstar Homes',
  location: 'Sector 79, Gurugram, Haryana',
  tagline: 'Refined Luxury Facing the Aravalli Foothills',
  reraNumber: 'RC/REP/HARERA/GGM/2024/88',
  landParcel: '12.5 Acres (80% Lush Green Open Spaces)',
  towers: '4 Signature High-Rise Towers (G+36 Floors)',
  possessionDate: 'December 2026',
  pricingStart: '₹1.35 Cr*',
  connectivity: [
    'Direct access to Southern Peripheral Road (SPR) & NH-48',
    '15 mins from Golf Course Extension Road',
    '20 mins to Cyber City & DLF Phase 1-5',
    '30 mins to IGI International Airport Terminal 3',
    'Proximity to top international schools (The Shri Ram School, Pathways) and hospitals (Artemis, Medanta)'
  ],
  luxurySpecs: [
    'VRV/VRF Centralized Air Conditioning',
    'Imported Italian Marble Flooring in Living & Dining',
    'Floor-to-ceiling Acoustic Double-Glazed Glass Windows',
    'Modular Kitchen with European Fitted Appliances & Quartz Countertops',
    'Smart Home Automation with Biometric Access & Voice Control',
    '3.3-meter High Ceilings & Expansive Deck Balconies'
  ]
};

export const FLOOR_PLANS: FloorPlan[] = [
  {
    id: '2bhk-luxury',
    type: '2 BHK Luxury',
    superArea: '1,450 sq.ft',
    carpetArea: '1,020 sq.ft',
    priceStarting: '₹1.35 Cr',
    description: 'Thoughtfully designed 2-bedroom residence featuring an open layout, expansive balcony facing landscaped central greens, and a modern chef-style kitchen.',
    features: ['2 Master Suites with attached baths', 'Panoramic Deck Balcony (8 ft wide)', 'Foyer Entry with powder room', 'Dedicated Utility & Drying area'],
    imagePlaceholderAlt: '2 BHK Architectural Layout Plan showing 2 Bedrooms, Living Room, Dining, Kitchen, 2 Balconies'
  },
  {
    id: '3bhk-premier',
    type: '3 BHK Premier',
    superArea: '2,150 sq.ft',
    carpetArea: '1,580 sq.ft',
    priceStarting: '₹1.75 Cr',
    description: 'Our most popular residence, offering uninterrupted Aravalli ridge views, 3 ensuite bedrooms, a servant room, and expansive dual-aspect living-dining space.',
    features: ['3 Ensuite Bedrooms with walk-in wardrobes', 'Wrap-around Corner Balcony', 'Separate Staff / Servant Quarter with bath', 'Family Lounge + Formal Living'],
    imagePlaceholderAlt: '3 BHK Architectural Layout Plan showing 3 Bedrooms, Expansive Living, Dining, Staff Room, Wrap-around Balcony'
  },
  {
    id: '4bhk-sky-suite',
    type: '4 BHK Sky Suite & Penthouse',
    superArea: '3,400 sq.ft',
    carpetArea: '2,620 sq.ft',
    priceStarting: '₹2.95 Cr',
    description: 'Exclusive top-floor Sky Suites with private elevator vestibule, double-height living room, plunge pool terrace, and panoramic 270-degree horizon views.',
    features: ['Private Elevator Lobby', 'Double-height Living Ceiling (20 ft)', 'Private Terrace with Plunge Pool', 'Dedicated Butler Pantry & 2 Staff Rooms'],
    imagePlaceholderAlt: '4 BHK Penthouse Architectural Layout Plan showing 4 Bedrooms, Double Height Living, Private Terrace with Plunge Pool'
  }
];

export const AMENITIES: ProjectAmenity[] = [
  {
    id: 'clubhouse',
    name: 'Club Lumina (50,000 sq.ft)',
    category: 'Leisure',
    description: 'Grand triple-height clubhouse with fine dining restaurant, private cigar lounge, and temperature-controlled infinity pool.',
    iconName: 'Building2'
  },
  {
    id: 'wellness-spa',
    name: 'Aravalli Wellness & Spa',
    category: 'Wellness',
    description: 'Holistic wellness center featuring hydrotherapy pools, sauna, steam rooms, and dedicated yoga & meditation pavilions.',
    iconName: 'Sparkles'
  },
  {
    id: 'sports-arena',
    name: 'Championship Sports Arena',
    category: 'Sports',
    description: 'Floodlit tennis courts, indoor air-conditioned badminton courts, squash court, and Olympic-length lap pool.',
    iconName: 'Trophy'
  },
  {
    id: 'concierge',
    name: '24/7 White-Glove Concierge',
    category: 'Convenience',
    description: 'Personalized lifestyle management, valet parking, electric vehicle fast-charging stations, and multi-tier biometric security.',
    iconName: 'ShieldCheck'
  },
  {
    id: 'sky-observatory',
    name: 'Sky Lounge & Stargazing Deck',
    category: 'Leisure',
    description: 'Rooftop observatory on the 36th floor with high-powered astronomical telescopes and cocktail lounge overlooking Gurugram skyline.',
    iconName: 'Compass'
  }
];

export const DEFAULT_ADVISOR: AdvisorInfo = {
  name: 'Vikram Sethi',
  title: 'Senior Portfolio Manager',
  avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
  experience: '14+ Years in Luxury Real Estate',
  specialization: 'High-Net-Worth Residential & Aravalli Corridor Portfolios',
  phone: '+91 98110 94820'
};
