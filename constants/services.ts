// app/constants/services.ts
import type { SubscriptionIconKey } from "./subscriptionIcons";

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  icon?: SubscriptionIconKey;
  defaultPrice?: number;
}

export const SERVICES_LIBRARY: ServiceItem[] = [
  // STREAMING
  { id: "netflix", name: "Netflix", category: "Streaming", icon: "netflix", defaultPrice: 39.9 },
  { id: "prime-video", name: "Amazon Prime Video", category: "Streaming", icon: "prime-video", defaultPrice: 14.9 },
  { id: "disney-plus", name: "Disney+", category: "Streaming", icon: "disney-plus", defaultPrice: 37.9 },
  { id: "hbo-max", name: "HBO Max", category: "Streaming", icon: "hbo-max", defaultPrice: 34.9 },
  { id: "paramount", name: "Paramount+", category: "Streaming", icon: "paramount", defaultPrice: 19.9 },
  { id: "star-plus", name: "Star+", category: "Streaming", icon: "star-plus", defaultPrice: 32.9 },
  { id: "crunchyroll", name: "Crunchyroll", category: "Streaming", icon: "crunchyroll", defaultPrice: 24.9 },
  { id: "globoplay", name: "Globoplay", category: "Streaming", icon: "globoplay", defaultPrice: 24.9 },
  { id: "lionsgate", name: "Lionsgate+", category: "Streaming", icon: "lionsgate", defaultPrice: 14.9 },
  { id: "twitch", name: "Twitch", category: "Streaming / Jogos", icon: "twitch", defaultPrice: 14.9 },
  { id: "vimeo", name: "Vimeo", category: "Streaming / Vídeo", icon: "vimeo", defaultPrice: 19.9 },

  // MÚSICA
  { id: "spotify", name: "Spotify", category: "Música", icon: "spotify", defaultPrice: 21.9 },
  { id: "apple-music", name: "Apple Music", category: "Música", icon: "apple-music", defaultPrice: 21.9 },
  { id: "deezer", name: "Deezer", category: "Música", icon: "deezer-2023", defaultPrice: 19.9 },
  { id: "youtube-premium", name: "YouTube Premium", category: "Música", icon: "youtube-premium", defaultPrice: 24.9 },
  { id: "youtube-music", name: "YouTube Music", category: "Música", icon: "youtube-music", defaultPrice: 24.9 },
  { id: "tidal", name: "Tidal", category: "Música", icon: "tidal", defaultPrice: 21.9 },
  { id: "soundcloud", name: "SoundCloud", category: "Música", icon: "soundcloud", defaultPrice: 15.9 },

  // CLOUD
  { id: "icloud", name: "iCloud", category: "Cloud", icon: "apple-one", defaultPrice: 3.5 },
  { id: "google-one", name: "Google One", category: "Cloud", icon: "google-one", defaultPrice: 6.99 },
  { id: "onedrive", name: "OneDrive", category: "Cloud", icon: "onedrive", defaultPrice: 12.0 },
  { id: "dropbox", name: "Dropbox", category: "Cloud", icon: "dropbox", defaultPrice: 49.0 },
  { id: "mega", name: "MEGA", category: "Cloud", icon: "mega", defaultPrice: 29.0 },

  // JOGOS
  { id: "ps-plus", name: "PlayStation Plus", category: "Jogos", icon: "ps-plus", defaultPrice: 34.9 },
  { id: "xbox-game-pass", name: "Xbox Game Pass", category: "Jogos", icon: "xbox-game-pass", defaultPrice: 29.99 },
  { id: "nintendo-switch", name: "Nintendo Switch Online", category: "Jogos", icon: "nintendo-switch", defaultPrice: 20.0 },
  { id: "ea-play", name: "EA Play", category: "Jogos", icon: "ea-play", defaultPrice: 19.9 },

  // PRODUTIVIDADE
  { id: "notion", name: "Notion", category: "Produtividade", icon: "notion", defaultPrice: 39.0 },
  { id: "todoist", name: "Todoist", category: "Produtividade", icon: "todoist", defaultPrice: 18.0 },
  { id: "evernote", name: "Evernote", category: "Produtividade", icon: "evernote", defaultPrice: 34.9 },
  { id: "microsoft-365", name: "Microsoft 365", category: "Produtividade", icon: "microsoft-365", defaultPrice: 36.0 },
  { id: "adobe-creative-cloud", name: "Adobe Creative Cloud", category: "Produtividade", icon: "adobe-creative-cloud", defaultPrice: 129.0 },
  { id: "canva", name: "Canva Pro", category: "Produtividade", icon: "canva", defaultPrice: 34.9 },
  { id: "asana", name: "Asana", category: "Produtividade", icon: "asana", defaultPrice: 14.9 },
  { id: "clickup", name: "ClickUp", category: "Produtividade", icon: "clickup", defaultPrice: 12.0 },
  { id: "monday", name: "Monday", category: "Produtividade", icon: "monday", defaultPrice: 15.0 },

  // DESIGN / IA / EDUCAÇÃO
  { id: "figma", name: "Figma", category: "Design", icon: "figma", defaultPrice: 12.0 },
  { id: "midjourney", name: "MidJourney", category: "Design / IA", icon: "midjourney", defaultPrice: 10.0 },
  { id: "coursera", name: "Coursera", category: "Educação", icon: "coursera", defaultPrice: 39.0 },
  { id: "udemy", name: "Udemy", category: "Educação", icon: "udemy", defaultPrice: 29.9 },
];
