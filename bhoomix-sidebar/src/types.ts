export type ThemeMode = 'dark' | 'light';

export type SidebarState = 'expanded' | 'collapsed';

export interface SubMenuItem {
  id: string;
  label: string;
  icon?: string;
  desc?: string;
  hasChevron?: boolean;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: string | number;
  badgeType?: 'default' | 'success' | 'warning' | 'accent';
  hasChevron?: boolean;
  hasSubmenu?: boolean;
  subItems?: SubMenuItem[];
  tagline?: string;
  stat?: string;
  category?: string;
  quickAction?: string;
}

export interface UserProfile {
  name: string;
  avatarUrl: string;
  role?: string;
  email?: string;
  farmName?: string;
  farmSize?: string;
  farmerId?: string;
}

