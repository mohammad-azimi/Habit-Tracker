const habitTemplates = [
  {
    id: "morning-reset",
    title: "Morning Reset",
    description: "A simple routine for a clean and focused morning.",
    habits: [
      {
        name: "Wake Up Early",
        icon: "🌅",
        targetType: "daily",
        targetValue: 1,
      },
      { name: "Drink Water", icon: "💧", targetType: "daily", targetValue: 1 },
      {
        name: "Morning Stretch",
        icon: "🧘",
        targetType: "daily",
        targetValue: 1,
      },
      {
        name: "No Phone First 30 Min",
        icon: "📵",
        targetType: "daily",
        targetValue: 1,
      },
    ],
  },
  {
    id: "fitness-focus",
    title: "Fitness Focus",
    description: "A balanced set for training, recovery, and consistency.",
    habits: [
      { name: "Workout", icon: "🏋️", targetType: "weekly", targetValue: 4 },
      { name: "Protein Goal", icon: "🍗", targetType: "daily", targetValue: 1 },
      {
        name: "Walk 8k Steps",
        icon: "🚶",
        targetType: "daily",
        targetValue: 1,
      },
      {
        name: "Sleep 8 Hours",
        icon: "😴",
        targetType: "daily",
        targetValue: 1,
      },
    ],
  },
  {
    id: "study-sprint",
    title: "Study Sprint",
    description: "A compact study system for focus and output.",
    habits: [
      {
        name: "Deep Study Session",
        icon: "📚",
        targetType: "daily",
        targetValue: 1,
      },
      { name: "Review Notes", icon: "📝", targetType: "daily", targetValue: 1 },
      {
        name: "Practice Problems",
        icon: "✍️",
        targetType: "weekly",
        targetValue: 5,
      },
      {
        name: "No Social Media While Studying",
        icon: "🔕",
        targetType: "daily",
        targetValue: 1,
      },
    ],
  },
];

export default habitTemplates;
