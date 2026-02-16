// Category grouping utility
// Groups categories dynamically based on keyword matching
// This allows the database enum to be the source of truth while maintaining good UX

interface CategoryGroupRule {
  name: string;
  nameEn: string;
  keywords: string[];
  priority: number; // Higher priority = checked first
}

// Grouping rules - categories are matched by keywords in their names
// Order matters: first match wins, so more specific rules have higher priority
const GROUP_RULES: CategoryGroupRule[] = [
  {
    name: "İşe Alım",
    nameEn: "Hiring",
    keywords: [
      "ats",
      "hiring",
      "recruitment",
      "job board",
      "assessment",
      "psychometric",
      "background check",
      "screening",
      "employer brand",
      "talent acquisition",
    ],
    priority: 10,
  },
  {
    name: "İK Yönetimi",
    nameEn: "HR Management",
    keywords: [
      "core hr",
      "hris",
      "payroll",
      "workforce management",
      "time & attendance",
      "time and attendance",
      "leave management",
      "benefits",
      "perks",
      "fringe",
      "compensation",
      "job analysis",
    ],
    priority: 9,
  },
  {
    name: "Öğrenme & Gelişim",
    nameEn: "Learning & Development",
    keywords: [
      "lms",
      "l&d",
      "learning",
      "training",
      "coaching",
      "onboarding",
      "orientation",
      "career development",
      "succession",
      "skills",
    ],
    priority: 8,
  },
  {
    name: "Performans",
    nameEn: "Performance",
    keywords: [
      "performance",
      "okr",
      "talent management",
      "feedback",
      "continuous improvement",
      "lean management",
    ],
    priority: 7,
  },
  {
    name: "Çalışan Deneyimi",
    nameEn: "Employee Experience",
    keywords: [
      "engagement",
      "experience",
      "success",
      "wellbeing",
      "wellness",
      "recognition",
      "appreciation",
      "reward",
      "internal communication",
      "communication",
      "survey",
    ],
    priority: 6,
  },
  {
    name: "Yapay Zeka / AI",
    nameEn: "AI / Artificial Intelligence",
    keywords: [
      "ai",
      "artificial intelligence",
      "yapay zeka",
      "machine learning",
      "nlp",
      "chatbot",
      "generative",
      "copilot",
    ],
    priority: 11,
  },
  {
    name: "Teknoloji & Analitik",
    nameEn: "Technology & Analytics",
    keywords: [
      "analytics",
      "rpa",
      "automation",
      "productivity",
      "remote working",
      "monitoring",
      "app store",
      "google play",
      "application",
      "unified communications",
    ],
    priority: 5,
  },
  {
    name: "Danışmanlık",
    nameEn: "Consulting",
    keywords: [
      "consulting",
      "implementation",
      "oracle",
      "sap",
      "outsourcing",
    ],
    priority: 4,
  },
  {
    name: "Diğer",
    nameEn: "Other",
    keywords: [
      "ehs",
      "csr",
      "corporate social",
      "youth hr",
      "od",
      "freelance",
      "gig economy",
      "compliance",
    ],
    priority: 1,
  },
];

/**
 * Find which group a category belongs to based on keyword matching
 */
function findGroupForCategory(category: string): string {
  const categoryLower = category.toLowerCase();

  // Sort rules by priority (highest first)
  const sortedRules = [...GROUP_RULES].sort((a, b) => b.priority - a.priority);

  for (const rule of sortedRules) {
    for (const keyword of rule.keywords) {
      if (categoryLower.includes(keyword)) {
        return rule.name;
      }
    }
  }

  // Default to "Diger" if no match
  return "Diger";
}

/**
 * Group categories from the database into logical groups
 * @param categories - Array of category strings from the database
 * @returns Object with group names as keys and category arrays as values
 */
export function groupCategories(categories: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};

  // Initialize all group names to maintain consistent order
  for (const rule of GROUP_RULES) {
    groups[rule.name] = [];
  }

  // Assign each category to a group
  for (const category of categories) {
    const groupName = findGroupForCategory(category);
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(category);
  }

  // Remove empty groups and sort categories within each group
  const result: Record<string, string[]> = {};
  for (const [groupName, groupCategories] of Object.entries(groups)) {
    if (groupCategories.length > 0) {
      result[groupName] = groupCategories.sort((a, b) => a.localeCompare(b));
    }
  }

  return result;
}

/**
 * Get the group name for a specific category
 */
export function getCategoryGroup(category: string): string {
  return findGroupForCategory(category);
}

/**
 * Get all group names in display order
 */
export function getGroupNames(): string[] {
  return GROUP_RULES
    .sort((a, b) => b.priority - a.priority)
    .map((rule) => rule.name);
}

/**
 * Check if a category matches any group's keywords
 */
export function isCategoryGrouped(category: string): boolean {
  return findGroupForCategory(category) !== "Diger";
}

export default groupCategories;
