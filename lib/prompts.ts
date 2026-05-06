import type { Prompt } from "@/types/experiment";

export const PROMPTS: Record<"easy" | "medium" | "hard", Prompt[]> = {
  easy: [
    {
      id: "e1",
      prompt: "What is your favourite food?",
      promptZh: "你最喜歡的食物是什麼？",
      topic: "Favourite Food",
      topicZh: "最喜歡的食物",
      img: "🍕",
      feedback:
        "Great start! You shared what food you like and that is a wonderful first step. To make your answer even stronger, try adding ONE reason why you like it. For example, 'I like pizza because it is cheesy and warm.' Keep going!",
    },
    {
      id: "e2",
      prompt: "What do you like to eat for breakfast?",
      promptZh: "你早餐喜歡吃什麼？",
      topic: "Breakfast",
      topicZh: "早餐",
      img: "🥞",
      feedback:
        "Nice job talking about your breakfast! Next time, try to add a small detail like what time you eat or who you eat with. For example: 'I eat bread and eggs in the morning with my family.' Small details make your English sound more natural!",
    },
    {
      id: "e3",
      prompt: "Do you like fruits? Which ones?",
      promptZh: "你喜歡水果嗎？喜歡哪些？",
      topic: "Fruits",
      topicZh: "水果",
      img: "🍎",
      feedback:
        "Well done! You were able to name fruits you enjoy. That shows good vocabulary! A tip for next time: try using the word 'because' to explain your choice. For example: 'I like mangoes because they are sweet and juicy.'",
    },
    {
      id: "e4",
      prompt: "What do you drink every day?",
      promptZh: "你每天喝什麼？",
      topic: "Drinks",
      topicZh: "飲品",
      img: "🥤",
      feedback:
        "Good effort talking about your drinks! To improve, try describing HOW OFTEN you drink something. Time words like 'every day', 'sometimes', and 'usually' are very useful in English!",
    },
    {
      id: "e5",
      prompt: "Do you like cooking? Yes or no? Why?",
      promptZh: "你喜歡煮食嗎？為什麼？",
      topic: "Cooking",
      topicZh: "煮食",
      img: "🍳",
      feedback:
        "Nice answer about cooking! You gave a clear response and explained a little bit why. To make it even better, try adding what you like to cook or what someone in your family cooks. Keep practising!",
    },
  ],
  medium: [
    {
      id: "m1",
      prompt:
        "Describe your favourite food. What does it taste like? When do you eat it?",
      promptZh: "描述你最喜歡的食物。它吃起來怎樣？你什麼時候吃？",
      topic: "Favourite Food",
      topicZh: "最喜歡的食物",
      img: "🍕",
      feedback:
        "Good description of your favourite food! You used some nice words to describe the taste. To take it further, try engaging more senses. What does it look like? What does it smell like? Phrases like 'It smells amazing' or 'It looks golden and crispy' will make your description come alive!",
    },
    {
      id: "m2",
      prompt:
        "Talk about food in your culture. What is a common dish in your country?",
      promptZh: "談談你文化中的食物。你的國家有什麼常見菜式？",
      topic: "Cultural Food",
      topicZh: "文化食物",
      img: "🍜",
      feedback:
        "Excellent work talking about food in your culture! You identified a common dish and explained it well. To strengthen your answer, try comparing it with food from another culture: 'In my country we eat rice every day, but in Italy they eat more pasta.'",
    },
    {
      id: "m3",
      prompt:
        "Describe a meal you had recently. Who did you eat with? What did you have?",
      promptZh: "描述你最近吃過的一頓飯。你跟誰一起吃？吃了什麼？",
      topic: "Recent Meal",
      topicZh: "最近的一頓飯",
      img: "🍽",
      feedback:
        "Great job describing your recent meal! You included good details about what you ate. To improve further, try using past tense consistently: 'I ate', 'we had', 'it tasted'. Also, describing the atmosphere helps: 'We sat together and talked while eating.'",
    },
    {
      id: "m4",
      prompt:
        "What do you like to eat and why? Explain your food preferences.",
      promptZh: "你喜歡吃什麼？為什麼？請解釋你的食物偏好。",
      topic: "Food Preferences",
      topicZh: "食物偏好",
      img: "🥗",
      feedback:
        "Nice explanation of your food preferences! You gave clear reasons for your choices. To make it even stronger, try using linking words like 'however', 'also', and 'for example' to connect your ideas smoothly.",
    },
    {
      id: "m5",
      prompt:
        "Describe a traditional dish from your country. How is it made?",
      promptZh: "描述你國家的一道傳統菜。它是怎麼做的？",
      topic: "Traditional Dish",
      topicZh: "傳統菜式",
      img: "🫕",
      feedback:
        "Well done describing a traditional dish! You explained the ingredients and preparation clearly. To improve, try using sequence words: 'First, you prepare the vegetables. Then, you add the spices. After that, you cook it for 30 minutes.'",
    },
  ],
  hard: [
    {
      id: "h1",
      prompt:
        "Compare your favourite food with a food you dislike. Explain the differences in taste, texture, and when you would eat each one.",
      promptZh:
        "將你最喜歡的食物與你不喜歡的食物進行比較。解釋它們在味道、口感和食用時機上的區別。",
      topic: "Food Comparison",
      topicZh: "食物比較",
      img: "🍕",
      feedback:
        "Impressive comparison! You identified clear differences between the two foods. Your use of contrast words like 'but' and 'while' was good. To push further, try more sophisticated comparisons: 'whereas', 'on the other hand', 'in contrast to'.",
    },
    {
      id: "h2",
      prompt:
        "Describe how food culture has changed in your country over the last 20 years. Give examples and explain why.",
      promptZh:
        "描述過去20年你的國家的食物文化有什麼變化。舉例說明並解釋原因。",
      topic: "Food Culture Change",
      topicZh: "食物文化變化",
      img: "🌍",
      feedback:
        "Excellent analysis of food culture changes! You gave thoughtful examples. To refine your answer, try supporting your points with more specific evidence. Using phrases like 'This is largely due to...' or 'As a result of...' shows academic-level English skills!",
    },
    {
      id: "h3",
      prompt:
        "Imagine you are opening a restaurant. Describe the menu, the atmosphere, and explain why people would want to eat there.",
      promptZh:
        "想像你要開一家餐廳。描述菜單、氛圍，並解釋為什麼人們會想來這裡吃飯。",
      topic: "Dream Restaurant",
      topicZh: "夢想餐廳",
      img: "🏪",
      feedback:
        "Creative and detailed restaurant description! You painted a vivid picture. To elevate your answer, try using persuasive language: 'Our signature dish features...', 'Guests will experience...', 'What sets us apart is...' Very impressive work!",
    },
    {
      id: "h4",
      prompt:
        "Describe a special meal or food memory from your childhood. Explain why it is important to you.",
      promptZh: "描述你童年的一餐特別的飯或食物記憶。解釋為什麼它對你很重要。",
      topic: "Food Memory",
      topicZh: "食物記憶",
      img: "🎂",
      feedback:
        "Beautiful storytelling about your food memory! You connected personal experience with cultural significance. To improve, try varying your sentence length. Mix short, impactful sentences with longer descriptive ones. Emotional storytelling is a powerful skill!",
    },
    {
      id: "h5",
      prompt:
        "Some people say fast food is bad for society. Others say it is convenient and important. What do you think? Give reasons.",
      promptZh:
        "有人說快餐對社會有害，有人說它方便且重要。你怎麼看？請給出理由。",
      topic: "Food Debate",
      topicZh: "食物辯論",
      img: "🍔",
      feedback:
        "Strong argumentative response! You presented your opinion clearly with supporting reasons. To strengthen it further, try acknowledging the opposing view before stating yours: 'While some argue that fast food is convenient, I believe...' This balanced approach shows critical thinking!",
    },
  ],
};

export function shuffle<T>(arr: T[]): T[] {
  const b = [...arr];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}
