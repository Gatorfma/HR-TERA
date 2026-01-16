export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  thumbnail: string;
  category: string;
  author: {
    name: string;
    avatar: string;
    role: string;
    bio: string;
  };
  publishDate: string;
  readTime: string;
  tags: string[];
}

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "future-of-hr-technology-2025",
    title: "The Future of HR Technology in 2025",
    excerpt: "Discover the emerging trends shaping the HR tech landscape and how AI is revolutionizing talent management.",
    content: `The HR technology landscape is evolving at an unprecedented pace. As we look ahead to 2025, several key trends are emerging that will fundamentally reshape how organizations manage their workforce.

## AI-Powered Recruitment

Artificial intelligence is no longer a buzzword—it's becoming the backbone of modern recruitment. From resume screening to candidate matching, AI algorithms are helping HR teams identify the best talent faster than ever before. Companies implementing AI-driven recruitment tools are seeing up to 60% reduction in time-to-hire.

## Employee Experience Platforms

The focus has shifted from traditional HR management to holistic employee experience. Modern platforms now integrate everything from onboarding to learning and development, creating seamless journeys for employees throughout their tenure.

## Predictive Analytics

Data-driven decision making is becoming standard practice. Predictive analytics tools can now forecast turnover risk, identify high-potential employees, and optimize workforce planning with remarkable accuracy.

## The Rise of Skills-Based Hiring

Traditional credentials are giving way to skills-based assessments. Organizations are increasingly prioritizing what candidates can do over where they went to school, leading to more diverse and capable workforces.

## Conclusion

The future of HR technology is bright, with innovations that promise to make work more human, not less. Organizations that embrace these trends will be better positioned to attract, retain, and develop top talent in the years ahead.`,
    thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=500&fit=crop",
    category: "Trends",
    author: {
      name: "Sarah Mitchell",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      role: "HR Technology Analyst",
      bio: "Sarah is a leading voice in HR technology with over 10 years of experience helping organizations navigate digital transformation."
    },
    publishDate: "Dec 28, 2024",
    readTime: "5 min read",
    tags: ["AI", "HR Tech", "Future of Work", "Recruitment"]
  },
  {
    id: "2",
    slug: "employee-engagement-strategies",
    title: "10 Employee Engagement Strategies That Actually Work",
    excerpt: "Learn proven techniques to boost employee satisfaction and retention in your organization.",
    content: `Employee engagement isn't just a nice-to-have—it's a business imperative. Engaged employees are more productive, more innovative, and more likely to stay with your organization. Here are ten strategies that have proven effective across industries.

## 1. Regular One-on-One Meetings

Nothing replaces genuine human connection. Schedule regular check-ins between managers and team members to discuss goals, challenges, and career development.

## 2. Recognition Programs

Implement structured recognition programs that celebrate achievements both big and small. Public acknowledgment goes a long way in making employees feel valued.

## 3. Professional Development Opportunities

Invest in your employees' growth through training programs, mentorship, and educational stipends. Employees who see a future with your company are more likely to stay engaged.

## 4. Flexible Work Arrangements

Trust your employees with flexibility. Whether it's remote work options or flexible hours, autonomy breeds engagement.

## 5. Clear Communication of Company Vision

Employees want to understand how their work contributes to larger goals. Regularly communicate company strategy and how individual roles fit into the bigger picture.

## 6. Wellness Programs

Physical and mental health directly impact engagement. Offer comprehensive wellness programs that address the whole person.

## 7. Collaborative Work Environment

Foster collaboration through team projects, cross-functional initiatives, and social events that build relationships.

## 8. Competitive Compensation

Fair pay is foundational. Regularly benchmark salaries and ensure your compensation packages are competitive.

## 9. Career Path Transparency

Show employees clear paths for advancement. When people can see their future at your company, they invest more in the present.

## 10. Feedback Culture

Create channels for employees to share ideas and concerns. Act on feedback to show you're listening.

## Conclusion

Engagement isn't built overnight, but consistent application of these strategies will create a workplace where employees thrive.`,
    thumbnail: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=500&fit=crop",
    category: "Engagement",
    author: {
      name: "Michael Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      role: "People Operations Director",
      bio: "Michael specializes in building high-performance cultures and has led people operations at multiple Fortune 500 companies."
    },
    publishDate: "Dec 25, 2024",
    readTime: "7 min read",
    tags: ["Engagement", "Retention", "Culture", "Management"]
  },
  {
    id: "3",
    slug: "streamlining-recruitment-process",
    title: "How to Streamline Your Recruitment Process",
    excerpt: "A comprehensive guide to optimizing your hiring workflow and reducing time-to-hire.",
    content: `In today's competitive talent market, a slow recruitment process can cost you the best candidates. Here's how to optimize your hiring workflow without sacrificing quality.

## Audit Your Current Process

Before making changes, understand where bottlenecks exist. Track time spent at each stage and identify where candidates drop off.

## Leverage Technology

Modern applicant tracking systems can automate routine tasks like scheduling interviews and sending follow-up emails. This frees your team to focus on high-value activities.

## Standardize Interview Processes

Create structured interview guides with consistent questions. This not only speeds up preparation but also ensures fair evaluation of all candidates.

## Reduce Interview Rounds

Each additional interview round adds days to your process. Consolidate interviews where possible by having candidates meet multiple team members in a single session.

## Empower Hiring Managers

Give hiring managers the tools and authority to move quickly. Delayed decisions often stem from approval bottlenecks.

## Communicate Proactively

Keep candidates informed throughout the process. Clear timeline expectations reduce anxiety and show respect for their time.

## Build a Talent Pipeline

Don't wait for openings to start recruiting. Maintain relationships with promising candidates so you can move quickly when positions open.

## Conclusion

A streamlined recruitment process benefits everyone—candidates have a better experience, hiring managers fill roles faster, and your organization gains a competitive edge in the talent market.`,
    thumbnail: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=500&fit=crop",
    category: "Recruitment",
    author: {
      name: "Emily Rodriguez",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      role: "Talent Acquisition Lead",
      bio: "Emily has recruited for startups and enterprises alike, building teams that drive business success."
    },
    publishDate: "Dec 20, 2024",
    readTime: "6 min read",
    tags: ["Recruitment", "Hiring", "Process Optimization", "ATS"]
  },
  {
    id: "4",
    slug: "remote-work-best-practices",
    title: "Remote Work Best Practices for HR Teams",
    excerpt: "Essential tips for managing distributed teams and maintaining company culture remotely.",
    content: `Remote work is here to stay. For HR teams, this means adapting policies, practices, and tools to support distributed workforces effectively.

## Establish Clear Communication Norms

Define expectations around response times, meeting schedules, and communication channels. Clarity prevents frustration and ensures alignment.

## Invest in the Right Tools

Equip your team with collaboration platforms, video conferencing tools, and project management software that enable seamless remote work.

## Maintain Regular Check-ins

Schedule consistent team meetings and one-on-ones. Regular touchpoints help remote workers feel connected and supported.

## Create Virtual Social Opportunities

Remote work can be isolating. Organize virtual coffee chats, team games, and social events to maintain team cohesion.

## Focus on Outcomes, Not Hours

Shift from monitoring time to measuring results. Trust employees to manage their schedules while holding them accountable for deliverables.

## Support Home Office Setup

Provide stipends or equipment for ergonomic home offices. Comfortable workspaces improve productivity and wellbeing.

## Address Mental Health

Remote work blurs boundaries between work and personal life. Offer mental health resources and encourage time off.

## Document Everything

With fewer hallway conversations, documentation becomes critical. Create comprehensive guides, FAQs, and knowledge bases.

## Conclusion

Successful remote work requires intentionality. By implementing these best practices, HR teams can create thriving distributed workforces that outperform traditional offices.`,
    thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop",
    category: "Remote Work",
    author: {
      name: "David Park",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      role: "Remote Work Consultant",
      bio: "David helps organizations transition to remote-first cultures, having led distributed teams across three continents."
    },
    publishDate: "Dec 15, 2024",
    readTime: "6 min read",
    tags: ["Remote Work", "Distributed Teams", "Culture", "Communication"]
  }
];

export const getRecentBlogPosts = (limit: number = 2): BlogPost[] => {
  return [...blogPosts]
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    .slice(0, limit);
};

export const getBlogPostBySlug = (slug: string): BlogPost | undefined => {
  return blogPosts.find(post => post.slug === slug);
};

export const getRelatedPosts = (currentSlug: string, limit: number = 3): BlogPost[] => {
  const currentPost = getBlogPostBySlug(currentSlug);
  if (!currentPost) return blogPosts.slice(0, limit);
  
  // Prioritize same category, then other posts
  const sameCategory = blogPosts.filter(
    post => post.slug !== currentSlug && post.category === currentPost.category
  );
  const otherPosts = blogPosts.filter(
    post => post.slug !== currentSlug && post.category !== currentPost.category
  );
  
  return [...sameCategory, ...otherPosts].slice(0, limit);
};
