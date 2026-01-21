import { products, Product } from "./products";
import { Tier } from "@/lib/types";
export type { Tier };

export interface VendorTestimonial {
  id: string;
  clientName: string;
  role: string;
  company: string;
  text: string;
  avatar?: string;
}

export interface VendorCaseStudy {
  id: string;
  clientName: string;
  challenge: string;
  solution: string;
  results: string;
  metrics?: { label: string; value: string }[];
  thumbnail?: string;
}

export interface VendorPackage {
  name: string;
  description: string;
  features: string[];
  startingPrice?: string;
}

export interface VendorTeamMember {
  name: string;
  role: string;
  photo: string;
}

export interface VendorFeaturedContent {
  title: string;
  description: string;
  url: string;
  type: "blog" | "guide" | "webinar" | "pdf" | "case-study";
}

export interface Vendor {
  id: string;
  slug: string;
  name: string;
  image: string;
  logo: string;
  category: string;
  categories?: string[];
  vendorType: string;
  addedDate: string;
  isPro: boolean;
  vendorTier: Tier;
  rating: number;
  status: "Top Rated" | "New" | "Verified" | "Featured";
  tagline?: string;
  description: string;
  fullDescription: string;
  extendedAbout?: string;
  website: string;
  email: string;
  phone: string;
  location: string;
  founded: string;
  employees: string;
  startingPrice: string;
  responseTime: string;
  specialties: string[];
  services: string[];
  serviceDescriptions?: { name: string; description: string }[];
  portfolioImages: string[];
  portfolioItems?: { name: string; description: string; thumbnail: string }[];
  productSlugs: string[];
  // Silver+ fields
  industries?: string[];
  regions?: string[];
  clientLogos?: string[];
  testimonials?: VendorTestimonial[];
  // Gold+ fields
  heroStats?: { label: string; value: string }[];
  caseStudies?: VendorCaseStudy[];
  packages?: VendorPackage[];
  processSteps?: { title: string; description: string }[];
  team?: VendorTeamMember[];
  featuredContent?: VendorFeaturedContent[];
  campaigns?: { title: string; description: string; validUntil?: string }[];
}

export const vendors: Vendor[] = [
  {
    id: "1",
    slug: "hiregenius",
    name: "HireGenius",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop",
    logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop",
    category: "Recruitment",
    categories: ["Recruitment", "AI Solutions", "HR Tech"],
    vendorType: "Design Agencies",
    addedDate: "Oct 24, 2024",
    isPro: true,
    vendorTier: "gold",
    rating: 4.9,
    status: "Top Rated",
    tagline: "AI-powered recruitment for the modern enterprise",
    description: "Leading AI-powered recruitment solutions provider",
    fullDescription: "HireGenius is a pioneering HR technology company specializing in AI-powered recruitment solutions. Founded by industry veterans, we're on a mission to transform how companies find and hire top talent. Our cutting-edge technology combines machine learning with human insights to deliver unparalleled recruitment outcomes.",
    extendedAbout: "With over a decade of combined experience in HR technology, our team has built solutions used by Fortune 500 companies worldwide. We understand that hiring is not just about filling positions—it's about finding the right cultural fit, the right skills, and the right potential.\n\nOur AI-driven approach reduces bias, speeds up the hiring process, and ensures you never miss a qualified candidate. Whether you're scaling a startup or managing enterprise-level recruitment, HireGenius adapts to your needs.",
    website: "https://hiregenius.com",
    email: "contact@hiregenius.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    founded: "2019",
    employees: "50-100",
    startingPrice: "$2,500",
    responseTime: "< 24 hours",
    specialties: ["AI Recruitment", "Talent Acquisition", "ATS Solutions", "Candidate Matching"],
    services: ["Web Design", "UX/UI Design", "Branding", "SaaS Development"],
    serviceDescriptions: [
      { name: "AI Recruitment Platform", description: "End-to-end recruitment solution powered by machine learning" },
      { name: "ATS Integration", description: "Seamless integration with your existing applicant tracking system" },
      { name: "Candidate Matching", description: "Smart algorithms that match candidates to your requirements" },
      { name: "Custom Implementation", description: "Tailored solutions for enterprise requirements" }
    ],
    portfolioImages: [
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=300&fit=crop"
    ],
    portfolioItems: [
      { name: "TechCorp Recruitment Overhaul", description: "Reduced time-to-hire by 60% for a Fortune 500 tech company", thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop" },
      { name: "StartupXYZ Scaling", description: "Helped a growing startup hire 50 engineers in 3 months", thumbnail: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=300&fit=crop" },
      { name: "Global Expansion Project", description: "Multi-region recruitment for international expansion", thumbnail: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=300&fit=crop" }
    ],
    productSlugs: ["talentai", "reviewhub"],
    industries: ["Technology", "Finance", "Healthcare", "Retail", "Manufacturing"],
    regions: ["North America", "Europe", "Asia Pacific", "Latin America"],
    clientLogos: [
      "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1549924231-f129b911e442?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1572021335469-31706a17ber?w=80&h=80&fit=crop"
    ],
    testimonials: [
      { id: "t1", clientName: "Sarah Johnson", role: "VP of HR", company: "TechCorp", text: "HireGenius transformed our hiring process. We reduced time-to-hire by 60% and improved candidate quality significantly.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
      { id: "t2", clientName: "Michael Chen", role: "Talent Director", company: "InnovateCo", text: "The AI matching is incredibly accurate. We're finding candidates we would have missed otherwise.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" }
    ],
    heroStats: [
      { label: "Years Experience", value: "10+" },
      { label: "Clients Served", value: "200+" },
      { label: "Candidates Placed", value: "50K+" }
    ],
    caseStudies: [
      { id: "cs1", clientName: "TechCorp Inc.", challenge: "Struggling with high-volume recruitment and long hiring cycles", solution: "Implemented AI-powered screening and automated interview scheduling", results: "Reduced time-to-hire by 60%, improved candidate quality scores by 45%", metrics: [{ label: "Time-to-hire reduction", value: "60%" }, { label: "Quality improvement", value: "45%" }], thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop" },
      { id: "cs2", clientName: "Global Finance Ltd.", challenge: "Needed to scale engineering team across multiple regions", solution: "Multi-region talent sourcing with unified candidate pipeline", results: "Hired 100+ engineers in 6 months across 5 countries", metrics: [{ label: "Engineers hired", value: "100+" }, { label: "Regions covered", value: "5" }], thumbnail: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=300&fit=crop" }
    ],
    packages: [
      { name: "Starter", description: "For growing teams just getting started", features: ["Up to 10 job postings", "Basic AI matching", "Email support"], startingPrice: "$2,500/mo" },
      { name: "Growth", description: "For scaling organizations", features: ["Unlimited job postings", "Advanced AI matching", "Priority support", "Custom integrations"], startingPrice: "$5,000/mo" },
      { name: "Enterprise", description: "For large organizations with complex needs", features: ["Everything in Growth", "Dedicated success manager", "Custom SLAs", "On-premise option"], startingPrice: "Custom" }
    ],
    processSteps: [
      { title: "Discovery", description: "We learn about your hiring challenges and goals" },
      { title: "Proposal", description: "Custom solution design tailored to your needs" },
      { title: "Implementation", description: "Seamless setup with your existing systems" },
      { title: "Optimization", description: "Continuous improvement based on results" }
    ],
    team: [
      { name: "Alex Rivera", role: "CEO & Co-Founder", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop" },
      { name: "Emily Zhang", role: "CTO", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop" },
      { name: "Marcus Johnson", role: "Head of Customer Success", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" }
    ],
    featuredContent: [
      { title: "The Future of AI in Recruitment", description: "Our comprehensive guide to AI-powered hiring", url: "#", type: "guide" },
      { title: "2024 Hiring Trends Report", description: "Key insights from 500+ HR leaders", url: "#", type: "pdf" },
      { title: "Building Diverse Teams with AI", description: "How AI reduces bias in hiring", url: "#", type: "webinar" }
    ],
    campaigns: [
      { title: "HRTera Exclusive: 20% Off First Quarter", description: "Special discount for HRTera members on any package", validUntil: "March 31, 2025" }
    ]
  },
  {
    id: "2",
    slug: "teamsync",
    name: "TeamSync",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop",
    logo: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=100&h=100&fit=crop",
    category: "Team",
    categories: ["Onboarding", "Team Building", "Training"],
    vendorType: "Development Studios",
    addedDate: "Oct 24, 2024",
    isPro: true,
    vendorTier: "gold",
    rating: 4.8,
    status: "Featured",
    tagline: "Building better teams through smart onboarding",
    description: "Building better teams through smart onboarding",
    fullDescription: "TeamSync revolutionizes the way organizations onboard and integrate new team members. Our comprehensive platform ensures every new hire feels welcomed, informed, and ready to contribute from day one. With automated workflows and personalized experiences, we help HR teams create lasting first impressions.",
    extendedAbout: "We believe that the first 90 days define an employee's entire tenure. That's why we've built a platform that goes beyond paperwork to create meaningful connections and accelerate productivity.\n\nOur approach combines behavioral science with technology to create onboarding experiences that stick. From pre-boarding engagement to ongoing check-ins, TeamSync keeps new hires on track.",
    website: "https://teamsync.io",
    email: "hello@teamsync.io",
    phone: "+1 (555) 234-5678",
    location: "New York, NY",
    founded: "2020",
    employees: "25-50",
    startingPrice: "$1,500",
    responseTime: "< 12 hours",
    specialties: ["Employee Onboarding", "Team Integration", "Training Management", "Culture Building"],
    services: ["React Development", "Node.js", "API Integration", "Cloud Solutions"],
    serviceDescriptions: [
      { name: "Onboarding Automation", description: "Streamlined workflows for seamless new hire experiences" },
      { name: "Training Management", description: "Track and deliver training content effectively" },
      { name: "Team Integration", description: "Foster connections between new and existing team members" }
    ],
    portfolioImages: [
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=300&fit=crop"
    ],
    portfolioItems: [
      { name: "Remote Onboarding Excellence", description: "Transformed remote onboarding for a 1000+ employee company", thumbnail: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=300&fit=crop" },
      { name: "Culture Integration Program", description: "Built a culture-first onboarding program", thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop" }
    ],
    productSlugs: ["onboardpro", "learnpath"],
    industries: ["Technology", "Professional Services", "Healthcare"],
    regions: ["North America", "Europe"],
    clientLogos: [
      "https://images.unsplash.com/photo-1549924231-f129b911e442?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=80&h=80&fit=crop"
    ],
    testimonials: [
      { id: "t1", clientName: "Jennifer Adams", role: "HR Director", company: "ScaleUp Inc.", text: "Our new hire retention improved by 40% after implementing TeamSync. The difference is remarkable.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" }
    ],
    heroStats: [
      { label: "Companies Onboarded", value: "500+" },
      { label: "Employees Onboarded", value: "25K+" }
    ],
    caseStudies: [
      { id: "cs1", clientName: "ScaleUp Inc.", challenge: "High turnover in first 90 days", solution: "Comprehensive onboarding with milestone tracking", results: "40% improvement in new hire retention", metrics: [{ label: "Retention improvement", value: "40%" }], thumbnail: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=300&fit=crop" }
    ],
    packages: [
      { name: "Team", description: "For small teams", features: ["Up to 50 employees", "Core onboarding features", "Email support"], startingPrice: "$1,500/mo" },
      { name: "Business", description: "For growing companies", features: ["Up to 500 employees", "Advanced workflows", "Priority support"], startingPrice: "$3,500/mo" }
    ],
    processSteps: [
      { title: "Audit", description: "Review your current onboarding process" },
      { title: "Design", description: "Create a customized onboarding journey" },
      { title: "Launch", description: "Deploy and train your team" },
      { title: "Iterate", description: "Continuous improvement based on feedback" }
    ],
    team: [
      { name: "Lisa Park", role: "Founder & CEO", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop" },
      { name: "David Kim", role: "Head of Product", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop" }
    ],
    featuredContent: [
      { title: "The Ultimate Onboarding Checklist", description: "Everything you need for successful onboarding", url: "#", type: "guide" }
    ]
  },
  {
    id: "3",
    slug: "payrollplus",
    name: "PayrollPlus",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=600&fit=crop",
    logo: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=100&h=100&fit=crop",
    category: "Payroll",
    categories: ["Payroll", "Benefits", "Compliance"],
    vendorType: "Freelancers",
    addedDate: "Oct 24, 2024",
    isPro: true,
    vendorTier: "gold",
    rating: 4.7,
    status: "Verified",
    tagline: "Payroll made simple, compliance made certain",
    description: "Simplifying payroll and benefits administration",
    fullDescription: "PayrollPlus is your trusted partner for all things payroll and benefits. We believe managing employee compensation shouldn't be complicated. Our platform automates complex calculations, ensures tax compliance, and gives employees self-service access to their financial information. Join thousands of companies who trust PayrollPlus.",
    extendedAbout: "Founded by payroll professionals frustrated with clunky legacy systems, PayrollPlus was built from the ground up to be intuitive, accurate, and reliable. We handle the complexity so you can focus on your people.\n\nWith multi-country support and automatic tax updates, we keep you compliant no matter where your team is located.",
    website: "https://payrollplus.com",
    email: "support@payrollplus.com",
    phone: "+1 (555) 345-6789",
    location: "Austin, TX",
    founded: "2018",
    employees: "100-250",
    startingPrice: "$500",
    responseTime: "< 6 hours",
    specialties: ["Payroll Processing", "Benefits Administration", "Tax Compliance", "Financial Reporting"],
    services: ["Payroll Setup", "Compliance Consulting", "Benefits Design", "Tax Filing"],
    serviceDescriptions: [
      { name: "Payroll Processing", description: "Accurate, on-time payroll every pay period" },
      { name: "Tax Compliance", description: "Automatic tax calculations and filings" },
      { name: "Benefits Administration", description: "Streamlined benefits enrollment and management" }
    ],
    portfolioImages: [
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop"
    ],
    portfolioItems: [
      { name: "Multi-State Payroll Migration", description: "Migrated 5000+ employees across 12 states", thumbnail: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=300&fit=crop" }
    ],
    productSlugs: ["payflow", "benefithub"],
    industries: ["All Industries"],
    regions: ["United States", "Canada"],
    clientLogos: [
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=80&h=80&fit=crop"
    ],
    testimonials: [
      { id: "t1", clientName: "Robert Martinez", role: "CFO", company: "GrowthCo", text: "Switching to PayrollPlus saved us 20 hours per month and eliminated payroll errors.", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" }
    ],
    heroStats: [
      { label: "Payrolls Processed", value: "1M+" },
      { label: "Accuracy Rate", value: "99.9%" }
    ],
    packages: [
      { name: "Essential", description: "Core payroll features", features: ["Payroll processing", "Direct deposit", "Basic reporting"], startingPrice: "$500/mo" },
      { name: "Complete", description: "Full HR & payroll suite", features: ["Everything in Essential", "Benefits admin", "Time tracking", "Dedicated support"], startingPrice: "$1,200/mo" }
    ],
    processSteps: [
      { title: "Setup", description: "Quick onboarding and data migration" },
      { title: "Configure", description: "Customize pay schedules and deductions" },
      { title: "Run", description: "Process payroll with confidence" },
      { title: "Support", description: "Ongoing expert assistance" }
    ],
    team: [
      { name: "Maria Gonzalez", role: "CEO", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop" }
    ]
  },
  {
    id: "4",
    slug: "compliancefirst",
    name: "ComplianceFirst",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
    logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop",
    category: "Legal",
    categories: ["Compliance", "Analytics", "Policy Management"],
    vendorType: "Marketing Partners",
    addedDate: "Oct 24, 2024",
    isPro: true,
    vendorTier: "silver",
    rating: 4.6,
    status: "Top Rated",
    tagline: "Stay compliant, stay confident",
    description: "Your compliance and HR analytics partner",
    fullDescription: "ComplianceFirst helps organizations stay ahead of ever-changing HR regulations while gaining deep insights into their workforce. Our dual focus on compliance and analytics means you can protect your organization while making data-driven decisions. From policy management to predictive analytics, we've got you covered.",
    extendedAbout: "Navigating HR compliance is complex and ever-changing. ComplianceFirst was built by compliance experts and data scientists to give you peace of mind. Our platform monitors regulatory changes, automates policy updates, and provides actionable analytics.\n\nWe serve organizations of all sizes, from startups to Fortune 500 companies, helping them reduce risk and make smarter workforce decisions.",
    website: "https://compliancefirst.io",
    email: "info@compliancefirst.io",
    phone: "+1 (555) 456-7890",
    location: "Chicago, IL",
    founded: "2017",
    employees: "50-100",
    startingPrice: "$3,000",
    responseTime: "< 48 hours",
    specialties: ["HR Compliance", "Workforce Analytics", "Policy Management", "Risk Mitigation"],
    services: ["Content Marketing", "SEO", "Social Media", "Brand Strategy"],
    serviceDescriptions: [
      { name: "Compliance Monitoring", description: "Stay updated on regulatory changes automatically" },
      { name: "Policy Management", description: "Create, distribute, and track policy acknowledgments" },
      { name: "Workforce Analytics", description: "Data-driven insights for better decisions" }
    ],
    portfolioImages: [
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=300&fit=crop"
    ],
    portfolioItems: [
      { name: "Healthcare Compliance Overhaul", description: "Brought a 500-bed hospital into full HIPAA compliance", thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop" },
      { name: "Multi-State Compliance Program", description: "Unified compliance across 30 states", thumbnail: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop" }
    ],
    productSlugs: ["complynow", "hrinsights"],
    industries: ["Healthcare", "Finance", "Manufacturing", "Retail"],
    regions: ["United States", "Canada", "UK"],
    clientLogos: [
      "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1549924231-f129b911e442?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=80&h=80&fit=crop"
    ],
    testimonials: [
      { id: "t1", clientName: "James Wilson", role: "General Counsel", company: "HealthCare Inc.", text: "ComplianceFirst keeps us ahead of regulatory changes. We haven't had a compliance issue since implementing their platform.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
      { id: "t2", clientName: "Patricia Brown", role: "HR Director", company: "FinanceGroup", text: "The analytics capabilities give us insights we never had before. Game-changing for workforce planning.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" }
    ]
  },
  {
    id: "5",
    slug: "integratehq",
    name: "IntegrateHQ",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop",
    logo: "https://images.unsplash.com/photo-1572021335469-31706a17ber?w=100&h=100&fit=crop",
    category: "Integration",
    vendorType: "Integration Partners",
    addedDate: "Nov 15, 2024",
    isPro: false,
    vendorTier: "freemium",
    rating: 4.5,
    status: "New",
    tagline: "Connect your HR tech stack",
    description: "Seamless integrations for your HR tech stack",
    fullDescription: "IntegrateHQ specializes in connecting your HR tools and systems into a unified ecosystem. We help organizations eliminate data silos, automate workflows, and create seamless experiences for HR teams and employees alike. With expertise in 50+ HR platforms, we're your go-to integration partner.",
    website: "https://integratehq.com",
    email: "connect@integratehq.com",
    phone: "+1 (555) 567-8901",
    location: "Seattle, WA",
    founded: "2021",
    employees: "10-25",
    startingPrice: "$1,000",
    responseTime: "< 24 hours",
    specialties: ["API Integration", "Data Migration", "Workflow Automation", "Custom Connectors"],
    services: ["API Development", "Data Sync", "Custom Integrations", "Middleware Solutions"],
    portfolioImages: [
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop"
    ],
    productSlugs: []
  },
  {
    id: "6",
    slug: "supportpro",
    name: "SupportPro",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop",
    logo: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=100&h=100&fit=crop",
    category: "Support",
    categories: ["Support", "Maintenance", "Consulting"],
    vendorType: "Support & Maintenance",
    addedDate: "Dec 1, 2024",
    isPro: true,
    vendorTier: "gold",
    rating: 4.8,
    status: "Verified",
    tagline: "24/7 support for your HR technology",
    description: "24/7 support and maintenance for your HR systems",
    fullDescription: "SupportPro provides round-the-clock support and maintenance for HR technology systems. Our dedicated team ensures your critical HR infrastructure runs smoothly, with proactive monitoring, rapid issue resolution, and regular updates. We keep your HR tech healthy so you can focus on your people.",
    extendedAbout: "Downtime in HR systems isn't just an inconvenience—it affects payroll, benefits, and employee satisfaction. SupportPro was founded to give organizations peace of mind with truly responsive, expert support.\n\nOur team includes certified experts in all major HR platforms. We don't just fix problems; we prevent them through proactive monitoring and optimization.",
    website: "https://supportpro.io",
    email: "help@supportpro.io",
    phone: "+1 (555) 678-9012",
    location: "Denver, CO",
    founded: "2016",
    employees: "75-150",
    startingPrice: "$800/mo",
    responseTime: "< 2 hours",
    specialties: ["24/7 Support", "System Maintenance", "Updates & Patches", "Performance Optimization"],
    services: ["Technical Support", "System Monitoring", "Security Updates", "Performance Tuning"],
    serviceDescriptions: [
      { name: "24/7 Technical Support", description: "Round-the-clock expert assistance" },
      { name: "Proactive Monitoring", description: "We catch issues before they become problems" },
      { name: "Security Updates", description: "Keep your systems secure and compliant" }
    ],
    portfolioImages: [
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop"
    ],
    portfolioItems: [
      { name: "Enterprise System Migration", description: "Zero-downtime migration for 10,000+ employee company", thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop" }
    ],
    productSlugs: [],
    industries: ["All Industries"],
    regions: ["Global"],
    clientLogos: [
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=80&h=80&fit=crop"
    ],
    testimonials: [
      { id: "t1", clientName: "Thomas Lee", role: "IT Director", company: "MegaCorp", text: "SupportPro's response time is incredible. They've saved us from several potential disasters.", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" }
    ],
    heroStats: [
      { label: "Uptime Guaranteed", value: "99.9%" },
      { label: "Avg Response Time", value: "< 15min" }
    ],
    packages: [
      { name: "Essential", description: "Basic support coverage", features: ["Email support", "Business hours", "Monthly reports"], startingPrice: "$800/mo" },
      { name: "Professional", description: "Extended coverage", features: ["24/7 support", "Phone & chat", "Weekly reports", "Priority queue"], startingPrice: "$2,000/mo" },
      { name: "Enterprise", description: "Full-service support", features: ["Dedicated team", "Custom SLAs", "On-site support", "Proactive optimization"], startingPrice: "$5,000/mo" }
    ],
    processSteps: [
      { title: "Onboard", description: "Quick setup and system assessment" },
      { title: "Monitor", description: "24/7 proactive monitoring begins" },
      { title: "Support", description: "Rapid response to any issues" },
      { title: "Optimize", description: "Regular reviews and improvements" }
    ],
    team: [
      { name: "Chris Taylor", role: "Founder & CEO", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" },
      { name: "Amanda Foster", role: "Head of Support", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop" }
    ],
    featuredContent: [
      { title: "HR System Maintenance Best Practices", description: "Keep your systems running smoothly", url: "#", type: "guide" }
    ]
  }
];

export const getVendorBySlug = (slug: string): Vendor | undefined => {
  return vendors.find(v => v.slug === slug);
};

export const getVendorProducts = (vendorSlug: string): Product[] => {
  const vendor = getVendorBySlug(vendorSlug);
  if (!vendor) return [];
  return products.filter(p => vendor.productSlugs.includes(p.slug));
};

export const getOtherVendors = (currentSlug: string, limit: number = 4): Vendor[] => {
  return vendors.filter(v => v.slug !== currentSlug).slice(0, limit);
};
