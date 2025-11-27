export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  icon: string | null; // você usará isso na UI depois
  defaultPrice?: number | null;
}

export const SERVICES_LIBRARY: ServiceItem[] = [
  // STREAMING
  { id: "netflix", name: "Netflix", category: "Streaming", icon: "netflix", defaultPrice: 39.9 },
  { id: "prime_video", name: "Amazon Prime Video", category: "Streaming", icon: "primevideo", defaultPrice: 14.9 },
  { id: "disney_plus", name: "Disney+", category: "Streaming", icon: "disney", defaultPrice: 37.9 },
  { id: "hbo_max", name: "HBO Max", category: "Streaming", icon: "hbomax", defaultPrice: 34.9 },
  { id: "paramount", name: "Paramount+", category: "Streaming", icon: "paramount", defaultPrice: 19.9 },
  { id: "star_plus", name: "Star+", category: "Streaming", icon: "starplus", defaultPrice: 32.9 },
  { id: "crunchyroll", name: "Crunchyroll", category: "Streaming", icon: "crunchyroll", defaultPrice: 24.9 },
  { id: "globoplay", name: "Globoplay", category: "Streaming", icon: "globoplay", defaultPrice: 24.9 },
  { id: "lionsgate", name: "Lionsgate+", category: "Streaming", icon: "lionsgate", defaultPrice: 14.9 },
  { id: "ngu", name: "NGU Club", category: "Streaming", icon: "ngu", defaultPrice: null },

  // MÚSICA
  { id: "spotify", name: "Spotify", category: "Música", icon: "spotify", defaultPrice: 21.9 },
  { id: "apple_music", name: "Apple Music", category: "Música", icon: "applemusic", defaultPrice: 21.9 },
  { id: "deezer", name: "Deezer", category: "Música", icon: "deezer", defaultPrice: 19.9 },
  { id: "youtube_premium", name: "YouTube Premium", category: "Música", icon: "youtube", defaultPrice: 24.9 },

  // CLOUD / ARMAZENAMENTO
  { id: "icloud", name: "iCloud", category: "Cloud", icon: "icloud", defaultPrice: 3.5 },
  { id: "google_one", name: "Google One", category: "Cloud", icon: "googleone", defaultPrice: 6.99 },
  { id: "onedrive", name: "OneDrive", category: "Cloud", icon: "onedrive", defaultPrice: 12.0 },
  { id: "dropbox", name: "Dropbox", category: "Cloud", icon: "dropbox", defaultPrice: 49.0 },
  { id: "mega", name: "MEGA", category: "Cloud", icon: "mega", defaultPrice: 29.0 },

  // JOGOS / GAMING
  { id: "ps_plus", name: "PlayStation Plus", category: "Jogos", icon: "psn", defaultPrice: 34.9 },
  { id: "xbox_game_pass", name: "Xbox Game Pass", category: "Jogos", icon: "gamepass", defaultPrice: 29.99 },
  { id: "nintendo_online", name: "Nintendo Online", category: "Jogos", icon: "nintendo", defaultPrice: 20.0 },
  { id: "ea_play", name: "EA Play", category: "Jogos", icon: "ea", defaultPrice: 19.9 },
  { id: "riot_pass", name: "Riot Pass", category: "Jogos", icon: "riot", defaultPrice: null },
  { id: "epic_pass", name: "Epic Membership", category: "Jogos", icon: "epic", defaultPrice: null },

  // SOFTWARE / PRODUTIVIDADE
  { id: "notion", name: "Notion", category: "Produtividade", icon: "notion", defaultPrice: 39.0 },
  { id: "todoist", name: "Todoist", category: "Produtividade", icon: "todoist", defaultPrice: 18.0 },
  { id: "evernote", name: "Evernote", category: "Produtividade", icon: "evernote", defaultPrice: 34.9 },
  { id: "microsoft_365", name: "Microsoft 365", category: "Produtividade", icon: "m365", defaultPrice: 36.0 },
  { id: "adobe_cc", name: "Adobe Creative Cloud", category: "Produtividade", icon: "adobecc", defaultPrice: 129.0 },
  { id: "canva", name: "Canva Pro", category: "Produtividade", icon: "canva", defaultPrice: 34.9 },

  // DESIGN / FERRAMENTAS
  { id: "figma", name: "Figma", category: "Design", icon: "figma", defaultPrice: 45.0 },
  { id: "sketch", name: "Sketch", category: "Design", icon: "sketch", defaultPrice: null },
  { id: "procreate", name: "Procreate+", category: "Design", icon: "procreate", defaultPrice: null },

  // IA / PLATAFORMAS TECH
  { id: "chatgpt_plus", name: "ChatGPT Plus", category: "IA", icon: "openai", defaultPrice: 20.0 },
  { id: "claude_pro", name: "Claude Pro", category: "IA", icon: "claude", defaultPrice: 20.0 },
  { id: "midjourney", name: "Midjourney", category: "IA", icon: "midjourney", defaultPrice: 30.0 },
  { id: "copilot", name: "Github Copilot", category: "IA", icon: "copilot", defaultPrice: 10.0 },
  { id: "runway", name: "Runway ML", category: "IA", icon: "runway", defaultPrice: null },
  { id: "perplexity", name: "Perplexity Pro", category: "IA", icon: "perplexity", defaultPrice: 20.0 },

  // FINTECH / FINANCEIRO
  { id: "nomad", name: "Nomad Pro", category: "Fintech", icon: "nomad", defaultPrice: 19.0 },
  { id: "wise", name: "Wise Account", category: "Fintech", icon: "wise", defaultPrice: null },
  { id: "revolut", name: "Revolut Premium", category: "Fintech", icon: "revolut", defaultPrice: 25.0 },
  { id: "inter", name: "Banco Inter Duo Gourmet", category: "Fintech", icon: "inter", defaultPrice: 29.9 },
  { id: "nubank_ultra", name: "Nubank Ultravioleta", category: "Fintech", icon: "nubank", defaultPrice: 49.0 },

  // EDUCAÇÃO
  { id: "duolingo", name: "Duolingo Super", category: "Educação", icon: "duolingo", defaultPrice: 34.9 },
  { id: "alura", name: "Alura", category: "Educação", icon: "alura", defaultPrice: 99.0 },
  { id: "udemy", name: "Udemy Business", category: "Educação", icon: "udemy", defaultPrice: null },
  { id: "coursera", name: "Coursera Plus", category: "Educação", icon: "coursera", defaultPrice: 49.0 },
  { id: "skillshare", name: "Skillshare", category: "Educação", icon: "skillshare", defaultPrice: 30.0 },

  // FITNESS / SAÚDE
  { id: "apple_fitness", name: "Apple Fitness+", category: "Fitness", icon: "applefitness", defaultPrice: 29.9 },
  { id: "strava", name: "Strava Premium", category: "Fitness", icon: "strava", defaultPrice: 13.9 },
  { id: "calm", name: "Calm", category: "Saúde", icon: "calm", defaultPrice: 24.9 },
  { id: "headspace", name: "Headspace", category: "Saúde", icon: "headspace", defaultPrice: 29.9 },

  // FERRAMENTAS / UTILITÁRIOS
  { id: "vpn_express", name: "ExpressVPN", category: "VPN", icon: "expressvpn", defaultPrice: 29.9 },
  { id: "vpn_nord", name: "NordVPN", category: "VPN", icon: "nordvpn", defaultPrice: 29.9 },
  { id: "1password", name: "1Password", category: "Segurança", icon: "1password", defaultPrice: 14.0 },
  { id: "bitwarden", name: "Bitwarden Premium", category: "Segurança", icon: "bitwarden", defaultPrice: 10.0 },

  // OUTROS
  { id: "aws", name: "AWS Developer", category: "Cloud", icon: "aws", defaultPrice: null },
  { id: "vercel", name: "Vercel Pro", category: "Tech", icon: "vercel", defaultPrice: null },
];
