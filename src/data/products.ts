import { Tier } from "@/lib/types";
export type { Tier };

export interface ProductReview {
  id: string;
  reviewerName: string;
  role: string;
  company: string;
  rating: number;
  comment: string;
  date: string;
}

export interface FeaturedContent {
  title: string;
  description: string;
  url: string;
  type: 'blog' | 'whitepaper' | 'case-study' | 'webinar' | 'report';
}

export interface UseCase {
  title: string;
  description: string;
  icon: string;
}

export interface Product {
  id: string;
  slug: string;
  image: string;
  category: string;
  categories?: string[]; // For plus/premium: up to 3 categories
  name: string;
  price: string;
  description: string;
  fullDescription: string;
  detailedOverview?: {
    whoIsItFor: string;
    whatDoesItSolve: string;
    additionalInfo?: string;
  };
  features: string[];
  screenshots: string[];
  videoUrl?: string;
  vendor?: {
    name: string;
    slug: string;
    logo: string;
    description: string;
    website?: string;
    location?: string;
  } | null;
  isVendorClaimed?: boolean; // If false or vendor is null, product is unclaimed
  vendorTier: Tier;
  releaseDate: string;
  lastUpdated: string;
  modules: string[];
  // Plus+ fields
  integrations?: string[];
  availableCountries?: string[];
  languages?: string[];
  compliance?: string[];
  reviews?: ProductReview[];
  // Premium+ fields
  useCases?: UseCase[];
  implementationSteps?: string[];
  impactMetrics?: { label: string; value: string }[];
  featuredContent?: FeaturedContent[];
  campaigns?: { title: string; description: string; validUntil?: string }[];
  externalWebsite?: string;
}

export const products: Product[] = [
  {
    id: "1",
    slug: "talentai",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop",
    category: "Recruitment",
    categories: ["Recruitment", "Analytics", "Onboarding"],
    name: "TalentAI",
    price: "$59",
    description: "AI-powered recruitment platform for modern hiring teams.",
    fullDescription: "TalentAI is a cutting-edge recruitment platform designed to transform your hiring process. Leveraging advanced AI algorithms, it helps HR teams identify, attract, and hire top talent faster than ever before.",
    detailedOverview: {
      whoIsItFor: "TalentAI is built for HR professionals, talent acquisition teams, and hiring managers at companies of all sizes who want to streamline their recruitment process and find the best candidates faster.",
      whatDoesItSolve: "It eliminates manual resume screening, reduces time-to-hire by up to 60%, and ensures you never miss a qualified candidate through intelligent matching algorithms.",
      additionalInfo: "Whether you're a startup scaling your team or an enterprise handling thousands of applications, TalentAI provides a streamlined, modern solution for building responsive and efficient recruitment workflows."
    },
    features: [
      "AI-Powered Candidate Matching",
      "Automated Resume Screening",
      "Interview Scheduling",
      "Analytics Dashboard",
      "ATS Integration"
    ],
    screenshots: [
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop"
    ],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    vendor: {
      name: "TalentWorks Inc.",
      slug: "talentworks",
      logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop",
      description: "Leading provider of AI-driven HR solutions",
      website: "https://talentworks.example.com",
      location: "San Francisco, USA"
    },
    vendorTier: "premium",
    releaseDate: "Sep 25, 2024",
    lastUpdated: "Dec 15, 2024",
    modules: [
      "Candidate Dashboard",
      "Job Posting Manager",
      "Interview Scheduler",
      "Analytics & Reports",
      "Team Collaboration",
      "Email Templates",
      "Candidate Pipeline",
      "Integration Hub"
    ],
    integrations: ["Slack", "Workday", "LinkedIn", "Indeed", "Google Calendar", "Microsoft Teams"],
    availableCountries: ["USA", "UK", "Germany", "France", "Canada", "Australia"],
    languages: ["English", "German", "French", "Spanish"],
    compliance: ["GDPR", "SOC2", "ISO27001"],
    reviews: [
      {
        id: "r1",
        reviewerName: "Sarah Johnson",
        role: "HR Director",
        company: "TechCorp Inc.",
        rating: 5,
        comment: "TalentAI has completely transformed our hiring process. We've reduced time-to-hire by 45%!",
        date: "Dec 10, 2024"
      },
      {
        id: "r2",
        reviewerName: "Michael Chen",
        role: "Talent Acquisition Lead",
        company: "InnovateCo",
        rating: 4,
        comment: "Great AI matching capabilities. The integration with our existing ATS was seamless.",
        date: "Nov 28, 2024"
      },
      {
        id: "r3",
        reviewerName: "Emily Rodriguez",
        role: "People Operations",
        company: "StartupXYZ",
        rating: 5,
        comment: "Best recruitment tool we've used. The candidate experience is excellent.",
        date: "Nov 15, 2024"
      }
    ],
    useCases: [
      {
        title: "For HR Managers",
        description: "Streamline candidate screening and reduce manual review time by leveraging AI-powered matching.",
        icon: "Users"
      },
      {
        title: "For Talent Acquisition",
        description: "Build talent pipelines and engage passive candidates with automated outreach campaigns.",
        icon: "Target"
      },
      {
        title: "For Hiring Teams",
        description: "Collaborate seamlessly with structured feedback and centralized candidate profiles.",
        icon: "MessageSquare"
      }
    ],
    implementationSteps: [
      "Initial setup and integration (1-2 days)",
      "Data migration from existing ATS (2-3 days)",
      "Team training and onboarding (1 day)",
      "Go-live with full support (Day 5)"
    ],
    impactMetrics: [
      { label: "Faster hiring", value: "60%" },
      { label: "Better candidate quality", value: "45%" },
      { label: "Time saved weekly", value: "15hrs" }
    ],
    featuredContent: [
      {
        title: "How AI is Transforming Recruitment in 2024",
        description: "A deep dive into the latest AI trends in talent acquisition.",
        url: "https://blog.example.com/ai-recruitment",
        type: "blog"
      },
      {
        title: "TalentAI Case Study: TechCorp Success",
        description: "Learn how TechCorp reduced their time-to-hire by 60%.",
        url: "https://case.example.com/techcorp",
        type: "case-study"
      },
      {
        title: "The Future of HR Tech Webinar",
        description: "Join our experts for a live discussion on HR technology trends.",
        url: "https://webinar.example.com/future-hr",
        type: "webinar"
      }
    ],
    campaigns: [
      {
        title: "New Year Special",
        description: "Get 30% off annual plans when you sign up before January 31st.",
        validUntil: "Jan 31, 2025"
      }
    ],
    externalWebsite: "https://talentai.example.com"
  },
  {
    id: "2",
    slug: "onboardpro",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop",
    category: "Onboarding",
    categories: ["Onboarding", "Training"],
    name: "OnboardPro",
    price: "$49",
    description: "Streamlined employee onboarding solution.",
    fullDescription: "OnboardPro simplifies the employee onboarding experience from day one. Create personalized onboarding journeys, automate paperwork, and ensure new hires feel welcomed and productive from their first day.",
    detailedOverview: {
      whoIsItFor: "HR teams, people operations, and managers at growing companies who want to create memorable first impressions and reduce new hire ramp-up time.",
      whatDoesItSolve: "Eliminates manual onboarding tasks, ensures compliance with documentation requirements, and creates consistent experiences for all new employees."
    },
    features: [
      "Personalized Onboarding Flows",
      "Document Management",
      "Task Automation",
      "Progress Tracking",
      "Team Integration"
    ],
    screenshots: [
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop"
    ],
    vendor: {
      name: "WorkflowHQ",
      slug: "workflowhq",
      logo: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=100&h=100&fit=crop",
      description: "Experts in workplace automation",
      website: "https://workflowhq.example.com",
      location: "Austin, USA"
    },
    vendorTier: "plus",
    releaseDate: "Aug 10, 2024",
    lastUpdated: "Dec 20, 2024",
    modules: [
      "Welcome Portal",
      "Document Center",
      "Task Manager",
      "Team Directory",
      "Training Hub",
      "Feedback System"
    ],
    integrations: ["Slack", "Microsoft Teams", "Google Workspace", "BambooHR"],
    availableCountries: ["USA", "UK", "Canada"],
    languages: ["English", "Spanish"],
    compliance: ["GDPR", "SOC2"],
    reviews: [
      {
        id: "r1",
        reviewerName: "David Park",
        role: "HR Manager",
        company: "GrowthCo",
        rating: 5,
        comment: "OnboardPro made our onboarding process so much smoother. New hires love it!",
        date: "Dec 5, 2024"
      },
      {
        id: "r2",
        reviewerName: "Lisa Thompson",
        role: "People Ops",
        company: "ScaleUp Inc.",
        rating: 4,
        comment: "Great automation features. Saved us hours every week.",
        date: "Nov 20, 2024"
      }
    ]
  },
  {
    id: "3",
    slug: "reviewhub",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=600&fit=crop",
    category: "Performance",
    name: "ReviewHub",
    price: "Free",
    description: "360-degree performance review management.",
    fullDescription: "ReviewHub revolutionizes performance management with comprehensive 360-degree reviews. Gather feedback from peers, managers, and direct reports to create a complete picture of employee performance.",
    features: [
      "360-Degree Feedback",
      "Custom Review Templates",
      "Goal Tracking",
      "Performance Analytics",
      "Continuous Feedback"
    ],
    screenshots: [
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop"
    ],
    vendor: {
      name: "PerformanceFirst",
      slug: "performancefirst",
      logo: "https://images.unsplash.com/photo-1572021335469-31706a17ber?w=100&h=100&fit=crop",
      description: "Building better workplaces through feedback"
    },
    vendorTier: "freemium",
    releaseDate: "Jul 15, 2024",
    lastUpdated: "Dec 10, 2024",
    modules: [
      "Review Dashboard",
      "Feedback Collection",
      "Goal Setting",
      "Reports & Analytics",
      "Team Insights"
    ]
  },
  {
    id: "4",
    slug: "payflow",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
    category: "Payroll",
    name: "PayFlow",
    price: "Free",
    description: "Automated payroll processing for businesses.",
    fullDescription: "PayFlow automates your entire payroll process, from calculations to disbursements. Handle complex tax requirements, multiple pay schedules, and diverse employee types with ease.",
    features: [
      "Automated Calculations",
      "Tax Compliance",
      "Direct Deposit",
      "Multi-Currency Support",
      "Expense Integration"
    ],
    screenshots: [
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
    ],
    vendor: {
      name: "FinanceHub",
      slug: "financehub",
      logo: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=100&h=100&fit=crop",
      description: "Simplifying financial operations"
    },
    vendorTier: "freemium",
    releaseDate: "Jun 20, 2024",
    lastUpdated: "Dec 18, 2024",
    modules: [
      "Payroll Dashboard",
      "Employee Portal",
      "Tax Center",
      "Reports",
      "Compliance Hub"
    ]
  },
  {
    id: "5",
    slug: "learnpath",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop",
    category: "Training",
    categories: ["Training", "Performance", "Onboarding"],
    name: "LearnPath",
    price: "Free",
    description: "Employee training and development platform.",
    fullDescription: "LearnPath empowers organizations to build skilled, engaged teams through personalized learning experiences. Create custom training paths, track progress, and measure the impact of your learning initiatives.",
    detailedOverview: {
      whoIsItFor: "L&D professionals, HR teams, and managers who want to upskill their workforce and create a culture of continuous learning.",
      whatDoesItSolve: "Centralizes all training content, automates skill gap analysis, and provides actionable insights on learning progress and ROI.",
      additionalInfo: "With interactive content and gamification features, employees stay motivated and continuously develop their skills."
    },
    features: [
      "Custom Learning Paths",
      "Progress Tracking",
      "Certification Management",
      "Interactive Content",
      "Gamification"
    ],
    screenshots: [
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=600&fit=crop"
    ],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    vendor: {
      name: "EduTech Solutions",
      slug: "edutech",
      logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop",
      description: "Transforming workplace learning",
      website: "https://edutech.example.com",
      location: "London, UK"
    },
    vendorTier: "premium",
    releaseDate: "May 5, 2024",
    lastUpdated: "Dec 12, 2024",
    modules: [
      "Course Builder",
      "Learning Dashboard",
      "Certification Center",
      "Progress Reports",
      "Team Analytics"
    ],
    integrations: ["Slack", "Microsoft Teams", "Zoom", "Google Meet"],
    availableCountries: ["USA", "UK", "Germany", "France", "Netherlands", "Australia", "Singapore"],
    languages: ["English", "German", "French", "Dutch", "Spanish", "Portuguese"],
    compliance: ["GDPR", "ISO27001", "SCORM"],
    reviews: [
      {
        id: "r1",
        reviewerName: "Amanda Wilson",
        role: "L&D Manager",
        company: "Global Corp",
        rating: 5,
        comment: "LearnPath has transformed how we approach employee development. Highly recommend!",
        date: "Dec 8, 2024"
      },
      {
        id: "r2",
        reviewerName: "James Liu",
        role: "Training Director",
        company: "TechStart",
        rating: 5,
        comment: "The gamification features keep our team engaged. Great ROI on training investments.",
        date: "Nov 30, 2024"
      }
    ],
    useCases: [
      {
        title: "For L&D Teams",
        description: "Create and manage comprehensive learning programs with ease and track ROI.",
        icon: "GraduationCap"
      },
      {
        title: "For Managers",
        description: "Assign training paths and monitor team progress in real-time.",
        icon: "Users"
      },
      {
        title: "For Employees",
        description: "Access personalized learning content and earn certifications to advance careers.",
        icon: "Award"
      }
    ],
    implementationSteps: [
      "Discovery and needs assessment (1 week)",
      "Platform configuration and branding (3-5 days)",
      "Content migration and course setup (1-2 weeks)",
      "Pilot launch with select teams (1 week)",
      "Full rollout with ongoing support"
    ],
    impactMetrics: [
      { label: "Course completion rate", value: "89%" },
      { label: "Employee satisfaction", value: "4.8/5" },
      { label: "Skill improvement", value: "67%" }
    ],
    featuredContent: [
      {
        title: "The Ultimate Guide to Corporate Learning",
        description: "Everything you need to know about building effective training programs.",
        url: "https://guide.example.com/corporate-learning",
        type: "whitepaper"
      },
      {
        title: "LearnPath ROI Calculator",
        description: "Calculate your potential return on investment with LearnPath.",
        url: "https://roi.example.com/learnpath",
        type: "report"
      }
    ],
    campaigns: [
      {
        title: "Enterprise Launch Special",
        description: "Free implementation support for enterprise customers signing up in Q1.",
        validUntil: "Mar 31, 2025"
      }
    ],
    externalWebsite: "https://learnpath.example.com"
  },
  {
    id: "6",
    slug: "hrinsights",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop",
    category: "Analytics",
    categories: ["Analytics", "Performance"],
    name: "HRInsights",
    price: "$97",
    description: "Advanced HR analytics and reporting dashboard.",
    fullDescription: "HRInsights transforms your HR data into actionable intelligence. With powerful analytics, customizable dashboards, and predictive insights, make data-driven decisions that impact your organization's success.",
    detailedOverview: {
      whoIsItFor: "HR leaders, people analytics teams, and executives who need data-driven insights to make strategic workforce decisions.",
      whatDoesItSolve: "Consolidates data from multiple HR systems, provides predictive analytics for retention and performance, and enables evidence-based decision making."
    },
    features: [
      "Custom Dashboards",
      "Predictive Analytics",
      "Workforce Planning",
      "Retention Analysis",
      "Real-time Reporting"
    ],
    screenshots: [
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop"
    ],
    vendor: {
      name: "DataDriven HR",
      slug: "datadrivenhr",
      logo: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=100&h=100&fit=crop",
      description: "Analytics for the modern HR team",
      website: "https://datadrivenhr.example.com",
      location: "New York, USA"
    },
    vendorTier: "plus",
    releaseDate: "Apr 18, 2024",
    lastUpdated: "Dec 22, 2024",
    modules: [
      "Analytics Dashboard",
      "Custom Reports",
      "Data Explorer",
      "Trend Analysis",
      "Export Center",
      "API Access"
    ],
    integrations: ["Workday", "SAP SuccessFactors", "ADP", "BambooHR", "Tableau"],
    availableCountries: ["USA", "UK", "Canada", "Germany", "Australia"],
    languages: ["English", "German"],
    compliance: ["GDPR", "SOC2", "HIPAA"],
    reviews: [
      {
        id: "r1",
        reviewerName: "Rachel Green",
        role: "VP of People",
        company: "Enterprise Inc.",
        rating: 5,
        comment: "HRInsights gives us the visibility we need to make strategic decisions. Game changer!",
        date: "Dec 12, 2024"
      }
    ]
  },
  {
    id: "7",
    slug: "benefithub",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop",
    category: "Benefits",
    name: "BenefitHub",
    price: "$48",
    description: "Comprehensive benefits administration tool.",
    fullDescription: "BenefitHub simplifies benefits administration for HR teams and employees alike. Manage health insurance, retirement plans, and perks in one centralized platform.",
    features: [
      "Benefits Enrollment",
      "Eligibility Tracking",
      "Compliance Reporting",
      "Self-Service Portal",
      "Vendor Integration"
    ],
    screenshots: [
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop"
    ],
    vendor: {
      name: "BenefitsPlus",
      slug: "benefitsplus",
      logo: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=100&h=100&fit=crop",
      description: "Making benefits work for everyone"
    },
    vendorTier: "freemium",
    releaseDate: "Mar 22, 2024",
    lastUpdated: "Dec 8, 2024",
    modules: [
      "Enrollment Center",
      "Benefits Catalog",
      "Employee Portal",
      "Compliance Center",
      "Vendor Management"
    ]
  },
  {
    id: "8",
    slug: "complynow",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop",
    category: "Compliance",
    name: "ComplyNow",
    price: "Free",
    description: "HR compliance and legal documentation.",
    fullDescription: "ComplyNow keeps your organization compliant with ever-changing HR regulations. From employment law updates to policy management, stay ahead of compliance requirements.",
    features: [
      "Compliance Monitoring",
      "Policy Management",
      "Document Tracking",
      "Regulatory Alerts",
      "Audit Reports"
    ],
    screenshots: [
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=600&fit=crop"
    ],
    vendor: {
      name: "LegalHR",
      slug: "legalhr",
      logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop",
      description: "Your compliance partner"
    },
    vendorTier: "freemium",
    releaseDate: "Feb 14, 2024",
    lastUpdated: "Dec 5, 2024",
    modules: [
      "Compliance Dashboard",
      "Policy Library",
      "Document Center",
      "Audit Trail",
      "Alert Center"
    ]
  },
  {
    id: "9",
    slug: "hranalytics-pro",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    category: "Analytics",
    name: "HR Analytics Pro",
    price: "Free",
    description: "Advanced workforce analytics and insights platform.",
    fullDescription: "HR Analytics Pro provides deep insights into your workforce data. Track key metrics, identify trends, and make data-driven decisions to optimize your human resources strategy.",
    features: [
      "Workforce Analytics",
      "Predictive Insights",
      "Custom Dashboards",
      "Trend Analysis",
      "Export Reports"
    ],
    screenshots: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=600&fit=crop"
    ],
    vendor: null,
    isVendorClaimed: false,
    vendorTier: "freemium",
    releaseDate: "Nov 20, 2024",
    lastUpdated: "Dec 28, 2024",
    modules: [
      "Analytics Dashboard",
      "Data Connectors",
      "Report Builder",
      "Insights Engine"
    ]
  }
];

export const getProductBySlug = (slug: string): Product | undefined => {
  return products.find(p => p.slug === slug);
};

export const getRelatedProducts = (currentSlug: string, limit: number = 4): Product[] => {
  return products.filter(p => p.slug !== currentSlug).slice(0, limit);
};

export const getSimilarProducts = (currentProduct: Product, limit: number = 4): Product[] => {
  // Get all categories for the current product
  const currentCategories = currentProduct.categories || [currentProduct.category];
  
  // Find products that share at least one category
  const similarProducts = products
    .filter(p => {
      // Exclude the current product
      if (p.slug === currentProduct.slug) return false;
      
      // Get categories for this product
      const productCategories = p.categories || [p.category];
      
      // Check if any category matches
      return productCategories.some(cat => 
        currentCategories.includes(cat)
      );
    })
    // Sort by number of matching categories (more matches = more similar)
    .sort((a, b) => {
      const aCategories = a.categories || [a.category];
      const bCategories = b.categories || [b.category];
      
      const aMatches = aCategories.filter(cat => currentCategories.includes(cat)).length;
      const bMatches = bCategories.filter(cat => currentCategories.includes(cat)).length;
      
      return bMatches - aMatches;
    });
  
  return similarProducts.slice(0, limit);
};