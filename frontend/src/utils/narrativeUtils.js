// Narrative transformation utilities for Sage's storytelling

/**
 * Transform a first-person narrative into third-person narration
 * "I was twenty-two..." becomes "Kamala was twenty-two..."
 */
export const transformToThirdPerson = (narrative, authorName, gender = 'female') => {
  if (!narrative || !authorName) return narrative;
  
  const firstName = authorName.split(' ')[0];
  const pronoun = gender === 'male' ? 'he' : 'she';
  const possessive = gender === 'male' ? 'his' : 'her';
  const objective = gender === 'male' ? 'him' : 'her';
  const reflexive = gender === 'male' ? 'himself' : 'herself';
  
  let transformed = narrative;
  
  // Replace first-person pronouns with third-person
  // Handle sentence starts with capital I
  transformed = transformed.replace(/\bI was\b/g, `${firstName} was`);
  transformed = transformed.replace(/\bI am\b/g, `${firstName} is`);
  transformed = transformed.replace(/\bI had\b/g, `${firstName} had`);
  transformed = transformed.replace(/\bI have\b/g, `${firstName} has`);
  transformed = transformed.replace(/\bI could\b/g, `${firstName} could`);
  transformed = transformed.replace(/\bI would\b/g, `${firstName} would`);
  transformed = transformed.replace(/\bI did\b/g, `${firstName} did`);
  transformed = transformed.replace(/\bI felt\b/g, `${firstName} felt`);
  transformed = transformed.replace(/\bI knew\b/g, `${firstName} knew`);
  transformed = transformed.replace(/\bI saw\b/g, `${firstName} saw`);
  transformed = transformed.replace(/\bI heard\b/g, `${firstName} heard`);
  transformed = transformed.replace(/\bI thought\b/g, `${firstName} thought`);
  transformed = transformed.replace(/\bI said\b/g, `${firstName} said`);
  transformed = transformed.replace(/\bI told\b/g, `${firstName} told`);
  transformed = transformed.replace(/\bI walked\b/g, `${firstName} walked`);
  transformed = transformed.replace(/\bI started\b/g, `${firstName} started`);
  transformed = transformed.replace(/\bI decided\b/g, `${firstName} decided`);
  transformed = transformed.replace(/\bI remember\b/g, `${firstName} remembers`);
  transformed = transformed.replace(/\bI never\b/g, `${firstName} never`);
  transformed = transformed.replace(/\bI still\b/g, `${firstName} still`);
  transformed = transformed.replace(/\bI learned\b/g, `${firstName} learned`);
  transformed = transformed.replace(/\bI spent\b/g, `${firstName} spent`);
  transformed = transformed.replace(/\bI sat\b/g, `${firstName} sat`);
  transformed = transformed.replace(/\bI cried\b/g, `${firstName} cried`);
  transformed = transformed.replace(/\bI laughed\b/g, `${firstName} laughed`);
  transformed = transformed.replace(/\bI watched\b/g, `${firstName} watched`);
  transformed = transformed.replace(/\bI made\b/g, `${firstName} made`);
  transformed = transformed.replace(/\bI taught\b/g, `${firstName} taught`);
  
  // Generic "I" at start of other sentences
  transformed = transformed.replace(/\bI ([a-z])/g, `${firstName} $1`);
  
  // Handle "I'm" and "I'd" and "I'll" and "I've"
  transformed = transformed.replace(/\bI'm\b/g, `${firstName} is`);
  transformed = transformed.replace(/\bI'd\b/g, `${firstName} would`);
  transformed = transformed.replace(/\bI'll\b/g, `${firstName} will`);
  transformed = transformed.replace(/\bI've\b/g, `${firstName} has`);
  
  // Handle possessives: "my" -> "her/his"
  transformed = transformed.replace(/\bmy\b/gi, possessive);
  transformed = transformed.replace(/\bMy\b/g, possessive.charAt(0).toUpperCase() + possessive.slice(1));
  
  // Handle "me" -> "her/him"
  transformed = transformed.replace(/\bme\b/g, objective);
  
  // Handle "myself" -> "herself/himself"
  transformed = transformed.replace(/\bmyself\b/gi, reflexive);
  
  // Handle "mine" -> "hers/his"
  const possessivePronoun = gender === 'male' ? 'his' : 'hers';
  transformed = transformed.replace(/\bmine\b/gi, possessivePronoun);
  
  return transformed;
};

/**
 * Create an introduction for Sage to say before narrating a story
 */
export const createStoryIntro = (memory, author) => {
  const timeContext = memory.time_period ? `back in ${memory.time_period}` : 'some time ago';
  const placeContext = memory.place ? ` in ${memory.place}` : '';
  const emotionContext = memory.emotional_tone ? `, filled with ${memory.emotional_tone}` : '';
  
  const intros = [
    `Let me share ${author.name}'s story${emotionContext}. This happened ${timeContext}${placeContext}.`,
    `Here's a beautiful memory from ${author.name}, from ${timeContext}${placeContext}.`,
    `${author.name} shared this precious moment${emotionContext}, ${timeContext}${placeContext}.`,
    `Listen to what ${author.name} remembers about ${timeContext}${placeContext}.`,
  ];
  
  return intros[Math.floor(Math.random() * intros.length)];
};

/**
 * Create a closing reflection after the story
 */
export const createStoryClosing = (memory, author) => {
  const closings = {
    joy: `What a wonderful memory ${author.name.split(' ')[0]} has shared with us.`,
    love: `Such a beautiful expression of love from ${author.name.split(' ')[0]}'s heart.`,
    nostalgia: `These precious moments live on through ${author.name.split(' ')[0]}'s words.`,
    pride: `${author.name.split(' ')[0]}'s pride in this moment still shines through.`,
    sadness: `Even in sadness, ${author.name.split(' ')[0]} found meaning worth preserving.`,
    gratitude: `${author.name.split(' ')[0]}'s gratitude reminds us to cherish what matters.`,
  };
  
  return closings[memory.emotional_tone] || 
    `Thank you for sharing this moment, ${author.name.split(' ')[0]}.`;
};

/**
 * Get gender from member data
 */
export const getMemberGender = (member) => {
  if (!member) return 'female';
  
  const femaleIndicators = ['mother', 'grandmother', 'daughter', 'granddaughter', 'matriarch', 'wife', 'sister', 'aunt', 'nani', 'mom', 'mama'];
  const maleIndicators = ['father', 'grandfather', 'son', 'grandson', 'patriarch', 'husband', 'brother', 'uncle', 'nana', 'papa', 'dad'];
  
  const roleAndRelationship = `${member.role || ''} ${member.relationship || ''} ${member.nickname || ''}`.toLowerCase();
  
  // Special handling for Indian terms
  if (member.nickname === 'Nani') return 'female';
  if (member.nickname === 'Nana' && roleAndRelationship.includes('patriarch')) return 'male';
  
  if (maleIndicators.some(ind => roleAndRelationship.includes(ind))) return 'male';
  if (femaleIndicators.some(ind => roleAndRelationship.includes(ind))) return 'female';
  
  // Name-based heuristics
  const name = (member.name || '').toLowerCase();
  const maleNames = ['james', 'rajan', 'arjun', 'john', 'michael', 'david', 'robert', 'william'];
  const femaleNames = ['kamala', 'priya', 'maya', 'sarah', 'emily', 'jessica', 'mary', 'jennifer'];
  
  if (maleNames.some(n => name.includes(n))) return 'male';
  if (femaleNames.some(n => name.includes(n))) return 'female';
  
  return 'female'; // Default
};

export default {
  transformToThirdPerson,
  createStoryIntro,
  createStoryClosing,
  getMemberGender
};
