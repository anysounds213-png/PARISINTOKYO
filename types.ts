export interface SectionData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  meta: {
    zone: string;
    index: string;
    status: string;
  };
  colors: {
    primary: string;
    accent: string;
    text: string;
  };
}

export enum SectionId {
  ARCHIVE = 'ARCHIVE',
  CALM = 'CALM',
  PREMIER = 'PREMIER'
}