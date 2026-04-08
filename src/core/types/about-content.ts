
export interface AboutContent {
  id: string;
  type: string;
  title: string;
  content: string;
  order: number;
  isActive: boolean;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface HeroContent {
  title: string;
  subtitle: string;
  badgeText: string;
}

export interface MissionContent {
  title: string;
  content: string;
  badgeText: string;
}

export interface StoryContent {
  title: string;
  content: string;
  badgeText: string;
}

export interface StatItem {
  number: string;
  label: string;
  icon: string;
}
