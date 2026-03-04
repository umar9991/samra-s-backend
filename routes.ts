import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "./shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Projects
  app.get(api.projects.list.path, async (req, res) => {
    const projects = await storage.getProjects();
    res.json(projects);
  });

  app.get(api.projects.get.path, async (req, res) => {
    const project = await storage.getProject(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  });

  // Articles
  app.get(api.articles.list.path, async (req, res) => {
    const articles = await storage.getArticles();
    res.json(articles);
  });

  // Contact
  app.post(api.contact.submit.path, async (req, res) => {
    try {
      const input = api.contact.submit.input.parse(req.body);
      const submission = await storage.submitContact(input);
      res.status(201).json(submission);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
    }
  });

  // Map project titles to logo paths (so existing DB projects get imageUrl too)
  const titleToImageUrl: Record<string, string> = {
    "Humanity Indeed": "/logos/humanity-indeed.png",
    "Women's Health Care Pakistan Forum": "/logos/womens-health-care.png",
    "Kids Nest Pakistan": "/logos/kids-nest.png",
    "Premier Professional Interior & Exterior Designers": "/logos/premier-professional.png",
    "Armario Design House": "/logos/armario-design.png",
    "VIGO Business Consulting Private Limited": "/logos/vigo-business-consulting.png",
    "VIGO Entrepreneurship Centre": "/logos/vigo-entrepreneurship.png",
    "Galería de Arte Fine Art Collector": "/logos/Galley-pakistan.png",
    "Galeria de Arte Fine Art Collector": "/logos/Galley-pakistan.png",
    "International Business Project - World Trade Zones": "/logos/international-business.png",
    "Centre of International Studies Alliance Pakistan": "/logos/center-islamic.png",
    "Women in HR Pakistan Forum": "/logos/hr-pakistan-forum.png",
  };

  const existingProjects = await storage.getProjects();
  for (const p of existingProjects) {
    const imageUrl = titleToImageUrl[p.title];
    // Also match by partial title (handles accent/encoding differences)
    const imageUrlFallback = !imageUrl
      ? Object.entries(titleToImageUrl).find(([k]) =>
        p.title.toLowerCase().includes("galeria") && k.toLowerCase().includes("galeria")
      )?.[1]
      : undefined;
    const resolvedUrl = imageUrl ?? imageUrlFallback;
    if (resolvedUrl && p.imageUrl !== resolvedUrl) {
      await storage.updateProjectImageUrl(p.id, resolvedUrl);
    }
  }

  if (existingProjects.length === 0) {
    const seedProjects = [
      {
        title: "Humanity Indeed",
        description: "CSR initiative started by Mrs. Samrah Azam. Focused on societal development.",
        facebookUrl: "https://www.facebook.com/share/1Bzk4Df4Mo/",
        category: "Non-Profit",
        isFeatured: true,
        imageUrl: "/logos/humanity-indeed.png"
      },
      {
        title: "Women's Health Care Pakistan Forum",
        description: "For betterment of Women and Children's health care.",
        facebookUrl: "https://www.facebook.com/share/1CFa2dqotk/",
        category: "Health",
        isFeatured: false,
        imageUrl: "/logos/womens-health-care.png"
      },
      {
        title: "Kids Nest Pakistan",
        description: "Online School and in-person Academy for ages 4-14.",
        facebookUrl: "https://www.facebook.com/share/17oXrzquuV/",
        category: "Education",
        isFeatured: false,
        imageUrl: "/logos/kids-nest.png"
      },
      {
        title: "Premier Professional Interior & Exterior Designers",
        description: "Quality, speed and affordability in design.",
        facebookUrl: "https://www.facebook.com/share/1D7mdMEQ1D/",
        category: "Design",
        isFeatured: false,
        imageUrl: "/logos/premier-professional.png"
      },
      {
        title: "Armario Design House",
        description: "Trendy, Modern and Stylish designer dresses & accessories.",
        facebookUrl: "https://www.facebook.com/share/1ACS3wBwk4/",
        category: "Fashion",
        isFeatured: false,
        imageUrl: "/logos/armario-design.png"
      },
      {
        title: "VIGO Business Consulting Private Limited",
        description: "For Impact global management training and development consulting.",
        facebookUrl: "https://www.facebook.com/share/1KPf57mVFk/",
        category: "Consulting",
        isFeatured: true,
        imageUrl: "/logos/vigo-business-consulting.png"
      },
      {
        title: "VIGO Entrepreneurship Centre",
        description: "Innovation Hub at Vigo Business Consulting.",
        facebookUrl: "https://www.facebook.com/share/164EMuUhq5/",
        category: "Business",
        isFeatured: false,
        imageUrl: "/logos/vigo-entrepreneurship.png"
      },
      {
        title: "Galería de Arte Fine Art Collector",
        description: "Fine Art collector Gallery.",
        facebookUrl: "https://www.facebook.com/share/17PiioSTjh/",
        category: "Art",
        isFeatured: false,
        imageUrl: "/logos/Galley-pakistan.png"
      },
      {
        title: "International Business Project - World Trade Zones",
        description: "Trade Beyond Borders Pakistan Explores International Trade Zones.",
        facebookUrl: "https://www.facebook.com/share/16pXx9qahW/",
        category: "Business",
        isFeatured: false,
        imageUrl: "/logos/international-business.png"
      },
      {
        title: "Centre of International Studies Alliance Pakistan",
        description: "Education and International Studies.",
        facebookUrl: "https://www.facebook.com/share/16efRFHBSh/",
        category: "Education",
        isFeatured: false,
        imageUrl: "/logos/center-islamic.png"
      },
      {
        title: "Women in HR Pakistan Forum",
        description: "Provides access to information about HR events in Islamabad.",
        facebookUrl: "https://www.facebook.com/share/16pPj7iRYJ/",
        category: "Professional",
        isFeatured: false,
        imageUrl: "/logos/hr-pakistan-forum.png"
      }
    ];

    for (const p of seedProjects) {
      await storage.createProject(p);
    }

    const seedArticles = [
      {
        title: "LinkedIn Articles by Samrah Azam",
        url: "https://www.linkedin.com/in/samrah-azam-chaudhri-3615284a?utm_source=share_via&utm_content=profile&utm_medium=member_android",
        platform: "LinkedIn"
      }
    ];

    for (const a of seedArticles) {
      await storage.createArticle(a);
    }
  }

  return httpServer;
}
