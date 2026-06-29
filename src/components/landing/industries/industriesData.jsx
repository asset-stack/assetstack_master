import { Building2, Heart, Train, Zap, Building, GraduationCap } from 'lucide-react';

/**
 * Single source of truth for the Industries page.
 * - `slug` is used for anchor links (#councils) and scroll-spy.
 * - `stats` are honest, capability-based numbers (asset types, modules used)
 *   — never fabricated outcome metrics.
 * - `capabilityImages` map a use case to a small inset image revealed on hover.
 */
export const INDUSTRIES = [
  {
    slug: 'government',
    eyebrow: 'Government & Local Councils',
    title: 'Government & Local Councils',
    shortLabel: 'Government',
    icon: Building2,
    image: 'https://media.base44.com/images/public/6a0a6a5d4d043b0e41a16d90/266a1b2ec_empty-gymnasium-with-courts-2026-03-18-05-24-20-utc.jpg',
    description:
      'Local governments manage extensive portfolios of public infrastructure including buildings, parks, roads and community facilities. AssetStack provides a centralised platform to monitor asset condition, plan maintenance and improve long-term infrastructure management.',
    useCases: [
      { label: 'Public facility asset tracking', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=70' },
      { label: 'Infrastructure condition monitoring', img: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=600&auto=format&fit=crop&q=70' },
      { label: 'Maintenance planning and prioritisation', img: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&auto=format&fit=crop&q=70' },
      { label: 'Long-term asset lifecycle management', img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=70' },
    ],
    outcomes: [
      'Improved infrastructure visibility',
      'More efficient maintenance planning',
      'Better allocation of public resources',
    ],
    stats: [
      { value: '6+', label: 'Asset categories' },
      { value: 'Multi-site', label: 'Coverage' },
      { value: 'Live', label: 'With LGA Council' },
    ],
  },
  {
    slug: 'healthcare',
    eyebrow: 'Healthcare & Aged Care',
    title: 'Healthcare & Aged Care',
    shortLabel: 'Healthcare',
    icon: Heart,
    image: 'https://media.base44.com/images/public/6a0a6a5d4d043b0e41a16d90/98eb78b31_Hospital.jpg',
    description:
      'Healthcare and aged care providers operate multiple facilities with complex infrastructure requirements. AssetStack enables organisations to monitor building systems, maintain compliance and optimise maintenance across facility networks.',
    useCases: [
      { label: 'Multi-site facility management', img: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&auto=format&fit=crop&q=70' },
      { label: 'Building systems monitoring', img: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=600&auto=format&fit=crop&q=70' },
      { label: 'Compliance-driven maintenance', img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=70' },
      { label: 'Asset lifecycle tracking', img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=70' },
    ],
    outcomes: [
      'Improved facility reliability',
      'Reduced maintenance risk',
      'Enhanced operational efficiency',
    ],
    stats: [
      { value: 'Audit-ready', label: 'Trail per asset' },
      { value: 'Multi-site', label: 'Facility networks' },
      { value: '24/7', label: 'Sensor monitoring' },
    ],
  },
  {
    slug: 'transport',
    eyebrow: 'Transport & Infrastructure',
    title: 'Transport & Infrastructure',
    shortLabel: 'Transport',
    icon: Train,
    image: 'https://media.base44.com/images/public/6a0a6a5d4d043b0e41a16d90/d2262589e_Trasnsport.jpg',
    description:
      'Transport operators manage critical infrastructure such as rail networks, road systems and intersections where failure can have significant operational impact. AssetStack provides real-time monitoring and predictive maintenance across transport infrastructure.',
    useCases: [
      { label: 'Rail infrastructure monitoring', img: 'https://images.unsplash.com/photo-1527684651001-731c474bbb5a?w=600&auto=format&fit=crop&q=70' },
      { label: 'Intersection and network asset tracking', img: 'https://images.unsplash.com/photo-1502920514313-52581002a659?w=600&auto=format&fit=crop&q=70' },
      { label: 'Predictive maintenance for transport systems', img: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&auto=format&fit=crop&q=70' },
      { label: 'Operational performance analytics', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=70' },
    ],
    outcomes: [
      'Reduced downtime across networks',
      'Improved infrastructure reliability',
      'Better maintenance coordination',
    ],
    stats: [
      { value: '100+', label: 'Rail assets digitised' },
      { value: 'Live', label: 'With Lycopodium' },
      { value: 'Network globe', label: 'View built in' },
    ],
  },
  {
    slug: 'utilities',
    eyebrow: 'Utilities, Energy & Resources',
    title: 'Utilities, Energy & Resources',
    shortLabel: 'Utilities',
    icon: Zap,
    image: 'https://media.base44.com/images/public/6a0a6a5d4d043b0e41a16d90/54c8e8f7c_Utilities.jpg',
    description:
      'Utilities, energy providers and resource operators manage distributed infrastructure across large geographic areas. AssetStack provides real-time monitoring and predictive insights across critical infrastructure systems.',
    useCases: [
      { label: 'Pipeline and pump station monitoring', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&auto=format&fit=crop&q=70' },
      { label: 'Substation and grid infrastructure tracking', img: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&auto=format&fit=crop&q=70' },
      { label: 'Mining equipment and processing facility monitoring', img: 'https://images.unsplash.com/photo-1515630278258-407f66498911?w=600&auto=format&fit=crop&q=70' },
      { label: 'Remote asset performance analytics', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=70' },
    ],
    outcomes: [
      'Improved infrastructure reliability',
      'Reduced unplanned failures',
      'Greater operational visibility across distributed assets',
    ],
    stats: [
      { value: 'IoT-ready', label: 'Sensor integration' },
      { value: 'Predictive', label: 'Failure analytics' },
      { value: 'Geo-distributed', label: 'Asset networks' },
    ],
  },
  {
    slug: 'property',
    eyebrow: 'Property',
    title: 'Property',
    shortLabel: 'Property',
    icon: Building,
    image: 'https://media.base44.com/images/public/6a0a6a5d4d043b0e41a16d90/f021b36db_Property.jpg',
    description:
      'Property groups and asset managers oversee large portfolios of buildings and infrastructure assets. AssetStack provides visibility across entire portfolios, enabling proactive maintenance and long-term asset planning.',
    useCases: [
      { label: 'Portfolio-wide asset monitoring', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=70' },
      { label: 'Building systems management', img: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&auto=format&fit=crop&q=70' },
      { label: 'Maintenance scheduling across multiple sites', img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=70' },
      { label: 'Asset lifecycle and depreciation tracking', img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=70' },
    ],
    outcomes: [
      'Improved portfolio visibility',
      'Reduced maintenance costs',
      'Optimised capital planning',
    ],
    stats: [
      { value: 'Built-in', label: 'Depreciation tracking' },
      { value: 'Portfolio', label: 'Multi-site dashboards' },
      { value: 'Lifecycle', label: 'Asset planning' },
    ],
  },
  {
    slug: 'education',
    eyebrow: 'Education & Campus Infrastructure',
    title: 'Education & Campus Infrastructure',
    shortLabel: 'Education',
    icon: GraduationCap,
    image: 'https://media.base44.com/images/public/6a0a6a5d4d043b0e41a16d90/5b6dc5294_Education.jpg',
    description:
      'Educational institutions manage extensive campus environments with diverse infrastructure assets. AssetStack enables institutions to monitor facilities, maintain infrastructure and optimise maintenance operations across campuses.',
    useCases: [
      { label: 'Campus facility monitoring', img: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=70' },
      { label: 'Infrastructure asset tracking', img: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=70' },
      { label: 'Maintenance planning across buildings', img: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=600&auto=format&fit=crop&q=70' },
      { label: 'Operational analytics for campus systems', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=70' },
    ],
    outcomes: [
      'Improved campus infrastructure management',
      'More efficient maintenance operations',
      'Better long-term asset planning',
    ],
    stats: [
      { value: 'Campus-wide', label: 'Visibility' },
      { value: 'Multi-building', label: 'Coverage' },
      { value: 'Lifecycle', label: 'Planning' },
    ],
  },
];

export const STORAGE_KEY = 'assetstack:industry-preference';