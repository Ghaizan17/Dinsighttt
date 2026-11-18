import { useProjects } from '../hooks/useProjects';
import { useSkills } from '../hooks/useSkills';
import { useExperiences } from '../hooks/useExperiences';
import { useCertificates } from '../hooks/useCertificates';
import { useBlogs } from '../hooks/useBlogs';
import { useGuestbooks } from '../hooks/useGuestbooks';
import { Rocket, Lightbulb, Briefcase, Award, Newspaper, MessageCircle } from 'lucide-react';

type StatItem = {
  title: string;
  count: number;
  icon: React.ReactNode;
  color: string;
};

const AdminDashboard = () => {
  const { projects, loading: pLoading } = useProjects();
  const { skills, loading: sLoading } = useSkills();
  const { experiences, loading: eLoading } = useExperiences();
  const { certificates, loading: cLoading } = useCertificates();
  const { blogs, loading: bLoading } = useBlogs();
  const { guestbooks, loading: gLoading } = useGuestbooks();

  const loading = pLoading || sLoading || eLoading || cLoading || bLoading || gLoading;

  const stats: StatItem[] = [
    { title: 'Projects', count: projects.length, icon: <Rocket className="w-6 h-6" />, color: 'bg-cyan-500/10 text-cyan-500' },
    { title: 'Skills', count: skills.length, icon: <Lightbulb className="w-6 h-6" />, color: 'bg-purple-500/10 text-purple-500' },
    { title: 'Experiences', count: experiences.length, icon: <Briefcase className="w-6 h-6" />, color: 'bg-amber-500/10 text-amber-500' },
    { title: 'Certificates', count: certificates.length, icon: <Award className="w-6 h-6" />, color: 'bg-green-500/10 text-green-500' },
    { title: 'Blogs', count: blogs.length, icon: <Newspaper className="w-6 h-6" />, color: 'bg-pink-500/10 text-pink-500' },
    { title: 'Guestbook', count: guestbooks.length, icon: <MessageCircle className="w-6 h-6" />, color: 'bg-blue-500/10 text-blue-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((stat) => (
          <a key={stat.title} className="block p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-cyan-500 transition group">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl ${stat.color} flex items-center justify-center text-2xl group-hover:scale-110 transition`}>
                {stat.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{stat.title}</h3>
                <p className="text-sm text-slate-500">Total: {stat.count}</p>
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-8 p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center text-xl">
            <i className="fa-solid fa-file-pdf" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Curriculum Vitae (PDF)</h3>
            <p className="text-sm text-slate-500">Unduh file CV terbaru dalam format PDF.</p>
          </div>
        </div>
        <a href="/CV_Dini.pdf" target="_blank" rel="noopener noreferrer" download="CV_Dini.pdf" className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-semibold hover:bg-slate-300 dark:hover:bg-white/20 transition inline-block">
          Unduh CV
        </a>
      </div>

      {loading && <div className="text-center py-8 text-slate-500 dark:text-slate-400">Memuat data...</div>}
    </div>
  );
};

export default AdminDashboard;
