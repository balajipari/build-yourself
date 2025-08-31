interface Project {
  id: string;
  name: string;
  description: string;
  image: string;
  lastUpdated: string;
  status: string;
  category?: string;
}

export const generateProjectSchema = (project: Project) => {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": project.name,
    "description": project.description,
    "image": project.image,
    "dateModified": project.lastUpdated,
    "category": project.category || "Motorcycle Design",
    "offers": {
      "@type": "Offer",
      "availability": project.status === "completed" ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      "price": "0",
      "priceCurrency": "USD"
    }
  };
};

export const generateProjectListSchema = (projects: Project[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": projects.map((project, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": project.name,
        "description": project.description,
        "image": project.image,
        "dateModified": project.lastUpdated
      }
    }))
  };
};

export const generateBreadcrumbSchema = (items: { name: string; url: string }[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};
