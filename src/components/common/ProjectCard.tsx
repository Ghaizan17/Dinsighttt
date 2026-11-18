import { ArrowUpRightFromSquare, Eye, Github } from 'lucide-react';
import { getPublicUrl } from '../../hooks/useStorage';
import type { Project } from '../../hooks/useProjects';

interface ProjectCardProps {
  project: Project;
  showActions?: boolean;
}

const ProjectCard = ({ project, showActions = false }: ProjectCardProps) => {
  const imageUrl = getPublicUrl(project.image);

  const category = (() => {
    const text = `${project.title} ${project.description}`.toLowerCase();
    if (text.includes('laravel')) return 'laravel';
    if (text.includes('ui') || text.includes('ux') || text.includes('design') || text.includes('figma')) return 'uiux';
    if (text.includes('mobile') || text.includes('android') || text.includes('flutter') || text.includes('ios')) return 'mobile';
    return 'web';
  })();

  return (
    <article className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 shadow-xl transition duration-700 group hover:-translate-y-4 hover:shadow-2xl">
      <div className="relative overflow-hidden h-64">
        {imageUrl ? (
          <img src={imageUrl} alt={project.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-white/5 text-slate-400 text-4xl">
            <Eye className="w-10 h-10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition" />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{project.title}</h3>
        <p className="mt-3 text-slate-500 dark:text-slate-400 leading-7 line-clamp-3">{project.description}</p>
        {project.tech_stack && (
          <p className="mt-3 text-xs text-cyan-500 font-semibold uppercase tracking-wider">{project.tech_stack}</p>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {project.demo_link && (
            <a
              href={project.demo_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-cyan-500 font-semibold hover:gap-3 transition"
            >
              Lihat Demo <ArrowUpRightFromSquare className="w-4 h-4" />
            </a>
          )}
          {project.repo_link && (
            <a
              href={project.repo_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold hover:text-cyan-500 transition"
            >
              <Github className="w-4 h-4" /> Repo
            </a>
          )}
          {!project.demo_link && !project.repo_link && (
            <span className="text-sm text-slate-400">—</span>
          )}
        </div>
      </div>
    </article>
  );
};

export default ProjectCard;
