// Client testimonials — one shared set used across the home page and every
// skills page. Deliberately not page-specific: one about the Claude SEO skills
// overall, one about SEO Audit + Client Reporting, one about connecting data.

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  stars: number;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "The Claude SEO skills are better than half the paid tools I've used. I ask for rankings, an audit or keyword ideas and get clean, ready-to-use answers in one chat.",
    name: "Daniel T.",
    role: "SEO Agency Founder",
    stars: 5,
  },
  {
    quote:
      "The SEO Audit and Client Report skills are perfect together. I audit a site, turn the findings into a white-label report, and send it the same afternoon.",
    name: "Elena V.",
    role: "Freelance SEO Consultant",
    stars: 5,
  },
  {
    quote:
      "Connecting GA4 and Search Console took me under two minutes. Now Claude answers every question with our real traffic and keyword data — no more tab-hopping.",
    name: "Rohit S.",
    role: "Head of Growth",
    stars: 5,
  },
];
