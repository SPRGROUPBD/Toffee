
export interface StreamConfig {
  url: string;
  cookie?: string;
  referer?: string;
  origin?: string;
  drmLicenseUrl?: string;
  userAgent?: string;
  drmScheme?: string;
  title?: string;
}

export interface PlaylistItem {
  id: string;
  name: string;
  url: string;
  userAgent: string;
  logo?: string;
  group?: string;
  cookie?: string;
  referer?: string;
}

export interface SampleCategory {
  title: string;
  items: SampleItem[];
}

export interface SampleItem {
  title: string;
  url: string;
  drmScheme?: string;
  drmLicenseUrl?: string;
}
