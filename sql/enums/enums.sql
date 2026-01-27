CREATE TYPE public.product_category AS ENUM (
  'ATS',
  'Smart Hiring Platforms',
  'Core HR (HRIS)',
  'Payroll',
  'Consulting & Implementation Services - Oracle HCM',
  'Consulting & Implementation Services - SAP HR',
  'LMS & L&D',
  'Employee Engagement & Success & Experience',
  'Wellbeing',
  'Performance Management & OKR',
  'Assessment & Psychometrics',
  'Workforce Management / Time & Attendance',
  'Benefits & Perks Platforms',
  'HR & People Analytics',
  'Talent Management',
  'Job Analysis & Compensation',
  'Freelance and Gig Economy Platforms',
  'EHS',
  'Remote Working Tools / Employee Monitoring',
  'Feedback',
  'Recognition & Appreciation & Reward',
  'Internal Communication',
  'Employer Branding',
  'Applications (App Store, Google Play etc.)',
  'Youth HR',
  'Unified Communications',
  'Employee Background Check & Screening Solutions',
  'Employee Productivity Tools',
  'HR with Automation + AI + RPA',
  'Fringe Benefits',
  'OD',
  'Continuous Improvement & Lean Management',
  'Corporate Social Responsibility - CSR',
  'Coaching',
  'Onboarding & Orientation'
);

CREATE TYPE public.tier AS ENUM (
  'freemium',
  'plus',
  'premium'
);

CREATE TYPE public.listing_status AS ENUM (
  'pending',
  'rejected',
  'approved'
);
