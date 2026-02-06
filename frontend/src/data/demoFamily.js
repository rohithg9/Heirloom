// Demo Family Data - The Sharma-Williams Family
// A multigenerational family with rich stories across cultures

export const SAGE_COMPANION = {
  name: "Sage",
  title: "Your Family Memory Guide",
  avatar: "/sage-avatar.png",
  greeting: "Hello! I'm Sage, your guide to preserving precious family memories.",
  personality: "Warm, wise, and genuinely curious about every family's unique story"
};

export const DEMO_FAMILY = {
  name: "Sharma-Williams",
  tagline: "Three generations of love, laughter, and legacy",
  established: "1952",
  location: "From Delhi to Denver",
  coverImage: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200",
};

export const DEMO_MEMBERS = [
  // Grandparents Generation
  {
    id: "member-1",
    name: "Kamala Devi Sharma",
    nickname: "Nani",
    role: "Matriarch",
    birth_year: 1942,
    birth_place: "Jaipur, India",
    photo_url: "https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?w=400",
    bio: "A retired school teacher who believes every child has a story worth telling. She's the keeper of family recipes and the warmest hugs.",
    life_stages: ["childhood", "youth", "adulthood", "later_life"],
    generation: 1,
    relationship: "grandmother"
  },
  {
    id: "member-2",
    name: "Rajan Sharma",
    nickname: "Nana",
    role: "Patriarch",
    birth_year: 1938,
    birth_place: "Delhi, India",
    photo_url: "https://images.unsplash.com/photo-1559963629-38ed0fbd4c86?w=400",
    bio: "A civil engineer who helped build bridges across India. Now he builds bridges between generations with his stories of old Delhi.",
    life_stages: ["childhood", "youth", "adulthood", "later_life"],
    generation: 1,
    relationship: "grandfather"
  },
  // Parents Generation
  {
    id: "member-3",
    name: "Priya Sharma-Williams",
    nickname: "Mom",
    role: "Daughter & Mother",
    birth_year: 1968,
    birth_place: "Delhi, India",
    photo_url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400",
    bio: "Born in Delhi, fell in love with an American in London. A cardiologist who says the heart knows no borders.",
    life_stages: ["childhood", "youth", "adulthood"],
    generation: 2,
    relationship: "mother"
  },
  {
    id: "member-4",
    name: "James Williams",
    nickname: "Dad",
    role: "Father",
    birth_year: 1965,
    birth_place: "Denver, Colorado",
    photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    bio: "A jazz musician turned music teacher. He says music is how he speaks when words aren't enough.",
    life_stages: ["childhood", "youth", "adulthood"],
    generation: 2,
    relationship: "father"
  },
  // Children Generation
  {
    id: "member-5",
    name: "Maya Williams",
    nickname: "Maya",
    role: "Granddaughter",
    birth_year: 1998,
    birth_place: "San Francisco, CA",
    photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    bio: "A filmmaker documenting immigrant stories. She started Heirloom to preserve her own family's memories after almost losing Nana's stories to time.",
    life_stages: ["childhood", "youth"],
    generation: 3,
    relationship: "granddaughter"
  },
  {
    id: "member-6",
    name: "Arjun Williams",
    nickname: "Arjun",
    role: "Grandson",
    birth_year: 2002,
    birth_place: "San Francisco, CA",
    photo_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
    bio: "A college student studying computer science. He's the one who convinced Nana to use voice recording instead of typing.",
    life_stages: ["childhood", "youth"],
    generation: 3,
    relationship: "grandson"
  }
];

export const DEMO_MEMORIES = [
  // Nani's Stories
  {
    id: "memory-1",
    author_id: "member-1",
    author_name: "Kamala Devi Sharma",
    title: "The Day I Became a Teacher",
    narrative: "I was twenty-two when I walked into my first classroom in Jaipur. Thirty-five pairs of eyes looking at me, expecting wisdom. I was terrified! My hands were shaking as I wrote my name on the blackboard. Then a little girl in the front row smiled at me—her two front teeth were missing. That smile gave me courage. I taught for forty years after that day, and I never forgot that little girl's gift.",
    time_period: "1964",
    life_stage: "youth",
    approximate_age: 22,
    people_involved: ["Students", "Little girl with missing teeth"],
    place: "Government School, Jaipur",
    emotional_tone: "pride",
    sensory_cues: {
      sight: "Dusty blackboard, wooden desks arranged in rows",
      sound: "Children's whispers, chalk on board",
      smell: "Old books and monsoon air"
    },
    occasion: "First day of teaching",
    highlights: ["That smile gave me courage", "Thirty-five pairs of eyes looking at me"],
    cover_image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
    privacy_level: "family"
  },
  {
    id: "memory-2",
    author_id: "member-1",
    author_name: "Kamala Devi Sharma",
    title: "My Mother's Kitchen Magic",
    narrative: "Every Sunday morning, my mother would wake up before sunrise to make fresh jalebis. The smell of saffron and sugar syrup would fill our small house in Jaipur. She never measured anything—just knew by feeling. 'The oil must sing to you,' she'd say. I watched her hands dance over the kadhai for years before she let me try. The first time I made them alone, after she passed, I cried into the batter. But they tasted just like hers.",
    time_period: "1950s",
    life_stage: "childhood",
    approximate_age: 10,
    people_involved: ["Mother", "Family"],
    place: "Family home, Jaipur",
    emotional_tone: "nostalgia",
    sensory_cues: {
      taste: "Sweet saffron jalebis, crispy outside, soft inside",
      smell: "Saffron, ghee, sugar syrup bubbling",
      sight: "Mother's hands dancing over the kadhai",
      sound: "Oil singing, sizzling"
    },
    occasion: "Sunday morning ritual",
    highlights: ["The oil must sing to you", "I cried into the batter but they tasted just like hers"],
    cover_image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=800",
    privacy_level: "family"
  },
  // Nana's Stories
  {
    id: "memory-3",
    author_id: "member-2",
    author_name: "Rajan Sharma",
    title: "Building the Bridge at Haridwar",
    narrative: "In 1975, I was assigned to build a bridge over the Ganges at Haridwar. Engineers said the current was too strong, the river too sacred to tame. But I spent weeks watching the water, learning its moods. One morning, an old priest told me, 'Don't fight the river, son. Dance with it.' That bridge still stands today. I take my grandchildren there and tell them: respect what you cannot control, and you'll find a way.",
    time_period: "1975",
    life_stage: "adulthood",
    approximate_age: 37,
    people_involved: ["Engineering team", "Old priest", "River workers"],
    place: "Haridwar, Ganges River",
    emotional_tone: "pride",
    sensory_cues: {
      sight: "Muddy river rushing, sacred bells on the shore",
      sound: "River roaring, temple bells, workers shouting",
      smell: "River water, incense from nearby temples"
    },
    occasion: "Professional achievement",
    highlights: ["Don't fight the river, son. Dance with it.", "That bridge still stands today"],
    cover_image: "https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?w=800",
    privacy_level: "family"
  },
  {
    id: "memory-4",
    author_id: "member-2",
    author_name: "Rajan Sharma",
    title: "The Night I Met Kamala",
    narrative: "It was at a wedding in Delhi, 1960. I was supposed to be watching the ceremony, but I kept looking at this young woman across the room. She caught me staring and didn't look away. My friend nudged me: 'That's the schoolteacher everyone's talking about. Very educated. Too smart for you!' I walked up to her anyway. The first thing she said was, 'You're blocking my view of the bride.' I said, 'Then I'll be your view instead.' She laughed, and I was lost forever.",
    time_period: "1960",
    life_stage: "youth",
    approximate_age: 22,
    people_involved: ["Kamala", "Wedding guests", "Friend"],
    place: "Delhi wedding hall",
    emotional_tone: "love",
    sensory_cues: {
      sight: "Colorful sarees, flower garlands, oil lamps",
      sound: "Wedding shehnai playing, laughter, bangles clinking",
      smell: "Jasmine garlands, rich food aromas"
    },
    occasion: "First meeting with wife",
    highlights: ["She laughed, and I was lost forever", "Then I'll be your view instead"],
    cover_image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800",
    privacy_level: "family"
  },
  // Priya's Stories
  {
    id: "memory-5",
    author_id: "member-3",
    author_name: "Priya Sharma-Williams",
    title: "When London Rain Brought Me Love",
    narrative: "I was doing my medical residency in London, 1992. It was pouring rain, and I'd forgotten my umbrella—again. I ducked into a jazz club to escape the downpour. A man was playing saxophone on stage, eyes closed, lost in the music. When he opened his eyes, he looked right at me standing there, dripping wet, and smiled without missing a note. After the show, he came over and said, 'You look like you need some sunshine.' I said, 'You sound like sunshine.' James still plays that song he was playing when we met. He calls it 'Rain in Delhi.'",
    time_period: "1992",
    life_stage: "youth",
    approximate_age: 24,
    people_involved: ["James Williams"],
    place: "Jazz club, London",
    emotional_tone: "love",
    sensory_cues: {
      sight: "Dim jazz club lights, rain on windows, saxophone gleaming",
      sound: "Jazz music, rain pattering, applause",
      smell: "Rain, coffee, cigarette smoke"
    },
    occasion: "Meeting future husband",
    highlights: ["You look like you need some sunshine", "He calls it 'Rain in Delhi'"],
    cover_image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
    privacy_level: "family"
  },
  {
    id: "memory-6",
    author_id: "member-3",
    author_name: "Priya Sharma-Williams",
    title: "Bringing Two Worlds Together",
    narrative: "Our wedding was chaos—beautiful chaos. We had both Hindu and Christian ceremonies, in Delhi and Denver. My mother spent weeks teaching James's mother how to drape a saree. His father learned to say 'Namaste' with perfect pronunciation. When the pandit and the pastor both blessed us, standing side by side, I knew our children would be lucky. They'd have twice the love, twice the traditions, twice the stories to tell.",
    time_period: "1995",
    life_stage: "youth",
    approximate_age: 27,
    people_involved: ["James Williams", "Both families", "Pandit", "Pastor"],
    place: "Delhi and Denver",
    emotional_tone: "joy",
    sensory_cues: {
      sight: "Red and white wedding dress, marigold garlands, church steeple",
      sound: "Mantras and hymns mixed together",
      smell: "Incense and roses"
    },
    occasion: "Wedding",
    highlights: ["They'd have twice the love, twice the traditions", "Beautiful chaos"],
    cover_image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
    privacy_level: "family"
  },
  // James's Stories
  {
    id: "memory-7",
    author_id: "member-4",
    author_name: "James Williams",
    title: "My Father's Last Song",
    narrative: "Dad taught me saxophone when I was eight. He was a session musician—never famous, but he played with legends. The night before he passed, he couldn't speak anymore, but he held my hand and hummed the melody of 'My Favorite Things.' I sat with him until morning, humming along. Now I play it at the end of every concert. No one knows why. It's just for him and me.",
    time_period: "2010",
    life_stage: "adulthood",
    approximate_age: 45,
    people_involved: ["Father"],
    place: "Hospital room, Denver",
    emotional_tone: "sadness",
    sensory_cues: {
      sight: "Moonlight through hospital blinds, father's peaceful face",
      sound: "Heart monitor beeping, hummed melody",
      smell: "Hospital antiseptic"
    },
    occasion: "Father's passing",
    highlights: ["He held my hand and hummed", "It's just for him and me"],
    cover_image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
    privacy_level: "family"
  },
  // Maya's Stories
  {
    id: "memory-8",
    author_id: "member-5",
    author_name: "Maya Williams",
    title: "The Summer I Found My Story",
    narrative: "When I was fifteen, I spent a summer in Jaipur with Nani. One afternoon, she pulled out a tin box full of old photographs I'd never seen. There was Nana as a young man, standing proudly by a bridge. Mom as a little girl, eating ice cream with sticky hands. And a black and white photo of people I didn't recognize. 'Who are they, Nani?' She went quiet. 'People we lost during Partition. This is why we tell stories, beta. So they are never truly gone.' That summer, I decided to become a filmmaker. To make sure no story is ever lost.",
    time_period: "2013",
    life_stage: "youth",
    approximate_age: 15,
    people_involved: ["Nani (Kamala)", "Ancestors"],
    place: "Nani's house, Jaipur",
    emotional_tone: "nostalgia",
    sensory_cues: {
      sight: "Faded photographs, tin box, afternoon light",
      sound: "Ceiling fan creaking, street vendors calling",
      smell: "Old photographs, chai brewing"
    },
    occasion: "Discovery of family history",
    highlights: ["This is why we tell stories, beta. So they are never truly gone.", "I decided to become a filmmaker"],
    cover_image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800",
    privacy_level: "family"
  },
  {
    id: "memory-9",
    author_id: "member-5",
    author_name: "Maya Williams",
    title: "Why I Created Heirloom",
    narrative: "Last year, Nana had a stroke. For three days, he couldn't speak. I sat by his bed, terrified that all his stories—the bridges, old Delhi, how he met Nani—would disappear with him. When he recovered, the first thing he said was, 'Did I ever tell you about the river at Haridwar?' I started recording that same day. Every story, every voice, every detail. That's when I knew I had to build something for all families, not just ours. So that no one has to fear losing the voices they love.",
    time_period: "2024",
    life_stage: "youth",
    approximate_age: 26,
    people_involved: ["Nana (Rajan)", "Family"],
    place: "Hospital, San Francisco",
    emotional_tone: "love",
    sensory_cues: {
      sight: "Nana's eyes opening, hospital room",
      sound: "Heart monitor, his weak voice asking about Haridwar",
      smell: "Hospital, hand sanitizer"
    },
    occasion: "Inspiration for Heirloom",
    highlights: ["So that no one has to fear losing the voices they love", "Did I ever tell you about the river at Haridwar?"],
    cover_image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800",
    privacy_level: "family"
  },
  // Arjun's Stories
  {
    id: "memory-10",
    author_id: "member-6",
    author_name: "Arjun Williams",
    title: "Learning Hindi from Nani's Stories",
    narrative: "I never took Hindi classes growing up. But somehow I understand it, because of Nani. Every video call, she mixes Hindi and English, and I just... know. She'd tell me stories and I'd ask, 'Nani, what does that word mean?' She'd explain, then test me the next week. Now when I visit India, people are surprised—'Your Hindi is so good!' I tell them, 'I learned it from love stories and cooking instructions.'",
    time_period: "2020",
    life_stage: "youth",
    approximate_age: 18,
    people_involved: ["Nani (Kamala)"],
    place: "Video call from college",
    emotional_tone: "joy",
    sensory_cues: {
      sight: "Nani's face on laptop screen, her kitchen behind her",
      sound: "Her voice mixing Hindi and English",
      smell: "Coffee in my dorm room"
    },
    occasion: "Language learning",
    highlights: ["I learned it from love stories and cooking instructions", "She'd test me the next week"],
    cover_image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",
    privacy_level: "family"
  }
];

// Sage's guided tour narrations
export const SAGE_NARRATIONS = {
  welcome: "Welcome to the Sharma-Williams family vault! I'm Sage, and I'll be your guide through three generations of memories. This family spans continents—from Jaipur to Denver—and their stories show how love transcends borders.",
  
  familyTree: "Here's the family tree. Notice how it grows organically, like a real tree. Each person is connected by the relationships that define them—parent to child, husband to wife. Click on anyone to see their stories.",
  
  memoryView: "Each memory is like a precious photograph, but richer. You can see when it happened, the emotions behind it, even the sensory details—the smells, sounds, and sights that made the moment real.",
  
  storyTelling: "This is where the magic happens. Family members simply talk, and I listen. I ask gentle questions about the time, the place, the people. Then I help turn those conversations into beautifully preserved memories.",
  
  export: "And here's something special—you can turn all these memories into a beautiful Life Book. A printed treasure that future generations can hold in their hands. Try downloading the Sharma-Williams family book!",
  
  cta: "Imagine having this for YOUR family. Your grandparents' voices, your parents' stories, your own memories—all preserved forever. Ready to start your family's journey?"
};

// Demo statistics
export const DEMO_STATS = {
  members_count: 6,
  memories_count: 10,
  relationships_count: 8,
  generations: 3,
  countries: 2,
  languages: ["English", "Hindi"],
  years_of_memories: "1950s - Present"
};

export default {
  SAGE_COMPANION,
  DEMO_FAMILY,
  DEMO_MEMBERS,
  DEMO_MEMORIES,
  SAGE_NARRATIONS,
  DEMO_STATS
};
