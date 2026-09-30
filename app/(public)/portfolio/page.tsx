import React from "react";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/Card";
import { Code2, Briefcase, Mail, Globe, ExternalLink } from "lucide-react";

// For real use case, these would be fetched from a user profile table
const PROFILE = {
  name: "Freelancer Pro",
  role: "Full-stack Developer & UI/UX Designer",
  bio: "Membantu bisnis membangun produk digital berkualitas dengan teknologi modern. Berpengalaman lebih dari 5 tahun dalam pembuatan web app custom.",
  email: "hello@freelancer.com",
  github: "https://github.com",
};

export default async function PortfolioPage() {
  // Fetch only COMPLETED projects
  const projects = await prisma.project.findMany({
    where: { status: "COMPLETED" },
    include: { client: { select: { company: true } } },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Code2 className="w-10 h-10" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {PROFILE.name}
          </h1>
          <p className="text-xl text-indigo-600 dark:text-indigo-400 font-medium">
            {PROFILE.role}
          </p>
          <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            {PROFILE.bio}
          </p>
          
          <div className="flex items-center justify-center gap-4 pt-6">
            <a href={`mailto:${PROFILE.email}`} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-medium hover:opacity-90 transition-opacity">
              <Mail className="w-4 h-4" /> Hubungi Saya
            </a>
            <a href={PROFILE.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <Globe className="w-4 h-4" /> GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <Briefcase className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Proyek Terselesaikan</h2>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
              <p className="text-slate-500 dark:text-slate-400">Belum ada proyek yang diselesaikan untuk ditampilkan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="overflow-hidden group hover:shadow-md transition-all duration-300 border-slate-200 dark:border-slate-800">
                  <div className="h-48 bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-6 text-center border-b border-slate-100 dark:border-slate-800 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />
                    <h3 className="text-xl font-bold text-slate-400 dark:text-slate-600 z-10 group-hover:scale-105 transition-transform duration-300">
                      {project.name}
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-lg text-slate-900 dark:text-slate-100">{project.name}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          Untuk: {project.client.company || "Klien Private"}
                        </p>
                      </div>
                      <span className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="w-4 h-4" />
                      </span>
                    </div>
                    {project.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
      
      <footer className="py-8 text-center text-slate-500 dark:text-slate-500 text-sm border-t border-slate-200 dark:border-slate-800">
        <p>&copy; {new Date().getFullYear()} {PROFILE.name}. Hak Cipta Dilindungi.</p>
      </footer>
    </div>
  );
}
