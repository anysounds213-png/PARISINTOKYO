import { SectionData, SectionId } from './types';

export const SECTIONS: SectionData[] = [
  {
    id: SectionId.ARCHIVE,
    title: "THE ARCHIVE",
    subtitle: "",
    description: "",
    meta: {
      zone: "A-01",
      index: "ARCHIVAL",
      status: "SECURE"
    },
    colors: {
      primary: "#050505",
      accent: "#00F0FF", // Cyan
      text: "#A0A0A0"
    }
  },
  {
    id: SectionId.CALM,
    title: "CALM ROOM",
    subtitle: "SENSORY SANCTUARY",
    description: "A sanctuary for visual reset. High-frequency noise cancellation and monochrome texture mapping active.",
    meta: {
      zone: "B-00",
      index: "NEUTRAL",
      status: "QUIET"
    },
    colors: {
      primary: "#111111",
      accent: "#E0E0E0", // Pearl
      text: "#888888"
    }
  },
  {
    id: SectionId.PREMIER,
    title: "PREMIER",
    subtitle: "RUNWAY NIGHT",
    description: "Live feed from the underground fashion district. Experimental fabrics and refractive metamaterials.",
    meta: {
      zone: "C-99",
      index: "LIVE",
      status: "ACTIVE"
    },
    colors: {
      primary: "#080205",
      accent: "#FF0055", // Magenta
      text: "#FFADD6"
    }
  }
];