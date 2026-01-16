CREATE TYPE public.product_category AS ENUM ( 
  'Applicant Tracking System (ATS)',
  'Smart Hiring Platforms',
  'Human Resources Information System (HRIS)',
  'Payroll',
  'Consulting & Implementation Services',
  'Learning Management Systems',
  'Employee Engagement',
  'Wellbeing',
  'Performance Management & OKR',
  'Assessment & Psychometrics',
  'Workforce Management',
  'Time & Attendance',
  'Benefits & Perks Platforms',
  'People Analytics',
  'Talent Management',
  'Job Analysis & Compensation',
  'Freelance & Gig Economy Platforms',
  'Environment, Health & Safety (EHS)',
  'Remote Working & Employee Monitoring Tools',
  'Feedback',
  'Recognition & Appreciation & Reward',
  'Internal Communication',
  'Employer Branding',
  'Mobile Application',
  'Youth HR',
  'Unified Communications',
  'Employee Background Check & Screening Solutions',
  'Employee Productivity Tools',
  'AI Automation',
  'Fringe Benefits',
  'Organizational Development (OD)',
  'Continuous Improvement & Lean Management',
  'Corporate Social Responsibility (CSR)',
  'Coaching',
  'Onboarding & Orientation'
);

CREATE TYPE public.tier AS ENUM (
  'freemium',
  'silver',
  'gold'
);

CREATE TYPE public.listing_status AS ENUM (
  'pending',
  'rejected',
  'approved'
);
