import { useState } from 'react';
import { ArrowUpRightFromSquare, ArrowRight } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useSkills } from '../hooks/useSkills';
import { useExperiences } from '../hooks/useExperiences';
import { useCertificates } from '../hooks/useCertificates';
import { useBlogs } from '../hooks/useBlogs';
import { useGuestbooks } from '../hooks/useGuestbooks';
import ProjectCard from '../components/common/ProjectCard';
import SkillCard from '../components/common/SkillCard';
import ExperienceCard from '../components/common/ExperienceCard';
import CertificateCard from '../components/common/CertificateCard';
import BlogCard from '../components/common/BlogCard';
import GuestbookItem from '../components/common/GuestbookItem';
import Button from '../components/ui/Button';
import { getPublicUrl } from '../hooks/useStorage';

const Home = () => {
  const { projects: allProjects, loading: projectsLoading } = useProjects();
  const { skills, loading: skillsLoading } = useSkills();
  const { experiences, loading: experiencesLoading } = useExperiences();
  const { certificates, loading: certificatesLoading } = useCertificates();
  const { blogs, loading: blogsLoading } = useBlogs();
  const {
    guestbooks,
    loading: guestbooksLoading,
    createGuestbook,
  } = useGuestbooks();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [activeTab, setActiveTab] = useState<'projects' | 'skills'>('projects');
  const [modalProjectId, setModalProjectId] = useState<string | null>(null);
  const [gbName, setGbName] = useState('');
  const [gbEmail, setGbEmail] = useState('');
  const [gbMessage, setGbMessage] = useState('');
  const [gbSubmitting, setGbSubmitting] = useState(false);
  const [gbAlert, setGbAlert] = useState({ message: '', type: 'success' | 'error' | null } as { message: string; type: 'success' | 'error' | null });

  const filteredProjects = allProjects.filter((p) => {
    const text = `${p.title} ${p.description}`.toLowerCase();
    const matchSearch = !search || text.includes(search.toLowerCase());
    if (category === 'all') return matchSearch;
    const cat = (() => {
      const t = `${p.title} ${p.description}`.toLowerCase();
      if (t.includes('laravel')) return 'laravel';
      if (t.includes('ui') || t.includes('ux') || t.includes('design') || t.includes('figma')) return 'uiux';
      if (t.includes('mobile') || t.includes('android') || t.includes('flutter') || t.includes('ios')) return 'mobile';
      return 'web';
    })();
    return matchSearch && cat === category;
  });

  const visibleProjects = projectsLoading ? [] : filteredProjects;

  const handleGuestbookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGbSubmitting(true);
    const { error } = await createGuestbook({
      name: gbName,
      email: gbEmail || null,
      message: gbMessage,
    });
    if (error) {
      setGbAlert({ message: 'Terjadi kesalahan sistem.', type: 'error' });
    } else {
      setGbAlert({ message: 'Pesan berhasil dikirim! Pesan akan ditampilkan setelah disetujui admin.',
  type: 'success', });
      setGbName('');
      setGbEmail('');
      setGbMessage('');
      setTimeout(() => setGbAlert({ message: '', type: null }), 3000);
    }
    setGbSubmitting(false);
  };

  const isActive = darkMode => darkMode;

  return (
    <section className="min-h-screen bg-slate-100 dark:bg-[#070B14] text-slate-900 dark:text-white transition-colors duration-500 overflow-x-hidden">
      {/* HERO */}
      <section id="home" className="relative min-h-screen flex items-center pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-slate-50 dark:bg-[#070B14] transition-colors duration-500" />
          <div className="absolute -top-40 -left-40 w-[450px] h-[450px] bg-cyan-400/10 dark:bg-cyan-500/10 rounded-full blur-[120px]" />
          <div className="absolute -bottom-40 -right-40 w-[450px] h-[450px] bg-purple-400/10 dark:bg-purple-500/10 rounded-full blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]" style={{
            backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '70px 70px',
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-sm font-semibold">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Siswa XII PPLG A
              </div>
              <p className="mt-7 text-slate-500 dark:text-slate-400 text-lg">Halo, saya</p>
              <h1 className="mt-2 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white">
                Dini<span className="text-cyan-500">.</span>
              </h1>
              <h2 className="mt-5 text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500">
                Web Developer & UI/UX Designer
              </h2>
              <p className="mt-7 max-w-2xl text-slate-600 dark:text-slate-300 text-lg leading-8">
                Siswa kelas XII PPLG A dari
                <br />
                <strong className="text-slate-900 dark:text-white">SMK Negeri 2 Banjarmasin</strong>
                yang memiliki minat dalam pengembangan website, desain UI/UX, dan teknologi digital.
              </p>
              <p className="mt-4 max-w-2xl text-slate-500 dark:text-slate-400 leading-7">
                Saya senang mengubah ide menjadi website dan aplikasi yang interaktif, fungsional, dan mudah digunakan.
              </p>
              <div className="flex flex-wrap gap-4 mt-9">
                <a href="#projects" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold hover:-translate-y-1 hover:shadow-xl transition duration-300">
                  <i className="fa-solid fa-folder-open" /> Lihat Portofolio
                </a>
                <a href="#cv" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 dark:border-white/20 bg-white/70 dark:bg-white/5 text-slate-800 dark:text-white font-semibold hover:border-cyan-500 hover:text-cyan-500 hover:-translate-y-1 transition duration-300">
                  <i className="fa-regular fa-file-lines" /> Lihat CV
                </a>
                <a href="#contact" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold hover:bg-cyan-500 hover:text-white hover:-translate-y-1 transition duration-300">
                  <i className="fa-regular fa-paper-plane" /> Hubungi Saya
                </a>
              </div>
              <div className="flex flex-wrap gap-3 mt-10">
                {['HTML', 'CSS', 'JavaScript', 'PHP', 'Laravel', 'MySQL', 'Tailwind CSS', 'Figma'].map((skill, i) => (
                  <span key={i} className="skill-badge">{skill}</span>
                ))}
              </div>
            </div>

            <div className="relative flex justify-center">
              <div className="absolute w-[360px] h-[360px] sm:w-[440px] sm:h-[440px] rounded-full border border-cyan-500/20 dark:border-cyan-400/20" />
              <div className="absolute w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] rounded-full border border-purple-500/20 dark:border-purple-400/20 translate-x-5 translate-y-5" />
              <div className="absolute w-[300px] h-[300px] bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-[100px]" />
              <div className="relative w-[300px] h-[390px] sm:w-[350px] sm:h-[450px] rounded-[32px] overflow-hidden border border-white/60 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-2xl">
                <img src="/dini.png" alt="Foto Profil Dini" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                  <p className="text-white/70 text-sm">XII PPLG A</p>
                  <h3 className="text-white text-2xl font-bold mt-1">SMK Negeri 2 Banjarmasin</h3>
                </div>
              </div>
              <div className="absolute -left-2 sm:-left-10 top-16 px-4 py-3 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 shadow-xl animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500"><i className="fa-solid fa-code" /></div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Focus</p>
                    <p className="font-bold text-slate-900 dark:text-white">Web Development</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-2 sm:-right-10 bottom-20 px-4 py-3 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 shadow-xl animate-float-delay">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500"><i className="fa-solid fa-pen-ruler" /></div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Interest</p>
                    <p className="font-bold text-slate-900 dark:text-white">UI / UX Design</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-20">
            {[
              { icon: 'fa-solid fa-user-graduate', label: 'Status', value: 'Peserta Didik' },
              { icon: 'fa-solid fa-school', label: 'Sekolah', value: 'SMK Negeri 2 Banjarmasin' },
              { icon: 'fa-solid fa-laptop-code', label: 'Kompetensi', value: 'PPLG' },
              { icon: 'fa-solid fa-location-dot', label: 'Location', value: 'Banjarmasin' },
            ].map((item, i) => (
              <div key={i} className="info-card">
                <div className="info-icon"><i className={item.icon} /></div>
                <div>
                  <p className="info-label">{item.label}</p>
                  <p className="info-value">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="section-label">TENTANG SAYA</p>
              <h2 className="section-title">Mengenal Saya <span className="text-cyan-500">Lebih Dekat</span></h2>
              <p className="mt-6 text-slate-600 dark:text-slate-300 leading-8">
                Saya merupakan siswa XII PPLG A yang tertarik pada dunia teknologi, khususnya pengembangan website dan desain antarmuka.
              </p>
              <p className="mt-4 text-slate-500 dark:text-slate-400 leading-8">
                Melalui berbagai tugas, projek sekolah, kegiatan organisasi, dan pengalaman praktik, saya terus mengembangkan kemampuan teknis maupun kemampuan bekerja dalam tim.
              </p>
              <a href="#contact" className="inline-flex items-center gap-2 mt-7 text-cyan-500 font-semibold hover:gap-4 transition-all">
                Hubungi Saya <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'PPLG', label: 'Kompetensi Keahlian', color: 'text-cyan-500' },
                { value: 'Web', label: 'Bidang yang Diminati', color: 'text-purple-500' },
                { value: 'UI/UX', label: 'Fokus Desain', color: 'text-cyan-500' },
                { value: 'Team', label: 'Collaboration', color: 'text-purple-500' },
              ].map((item, i) => (
                <div key={i} className="stat-card">
                  <div className={`text-4xl font-black ${item.color}`}>{item.value}</div>
                  <p className="mt-2 text-slate-500 dark:text-slate-400">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROJECT & SKILLS */}
      <section id="projects" className="py-28 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <p className="section-label justify-center">PORTOFOLIO </p>
            <h2 className="section-title">Projek & Keahlian</h2>
            <p className="section-description">Beberapa hasil projek dan kemampuan yang saya kembangkan selama belajar di bidang PPLG.</p>
          </div>

          <div className="flex justify-center gap-3 mt-10 mb-12">
            <button
              onClick={() => { setActiveTab('projects'); setCategory('all'); setSearch(''); }}
              className={`tab-button ${activeTab === 'projects' ? 'active-tab' : ''}`}
            >
              <i className="fa-solid fa-folder-open" /> Projects
            </button>
            <button
              onClick={() => { setActiveTab('skills'); setCategory('all'); setSearch(''); }}
              className={`tab-button ${activeTab === 'skills' ? 'active-tab' : ''}`}
            >
              <i className="fa-solid fa-code" /> Skills
            </button>
          </div>

          {activeTab === 'projects' && (

          <div id="projectFilterBar" className="max-w-5xl mx-auto mt-8 mb-12">
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                id="projectSearch"
                placeholder="Cari project berdasarkan judul atau deskripsi..."
                className="w-full pl-12 pr-12 py-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  id="clearSearch"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition"
                  onClick={() => setSearch('')}
                >
                  <i className="fa-solid fa-xmark text-sm" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {['all', 'web', 'uiux', 'laravel', 'mobile'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); setSearch(''); }}
                  className={`filter-btn ${category === cat ? 'active-filter' : ''}`}
                >
                  <i className={cat === 'all' ? 'fa-solid fa-layer-group' : cat === 'web' ? 'fa-solid fa-globe' : cat === 'uiux' ? 'fa-solid fa-pen-ruler' : cat === 'laravel' ? 'fa-brands fa-laravel' : 'fa-solid fa-mobile-screen'} />
                  {cat === 'all' ? 'Semua' : cat === 'web' ? 'Web' : cat === 'uiux' ? 'UI/UX' : cat === 'laravel' ? 'Laravel' : 'Mobile'}
                </button>
              ))}
            </div>
            {search || category !== 'all' && (
              <p id="projectResultCount" className="text-center text-sm text-slate-500 mt-4">
                Menampilkan {visibleProjects.length} dari {allProjects.length} project
              </p>
            )}
            {visibleProjects.length === 0 && (search || category !== 'all') && (
              <div id="noProjectResult" className="hidden mt-8 text-center py-12 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10">
                <i className="fa-solid fa-magnifying-glass text-4xl text-slate-300 dark:text-slate-600" />
                <p className="mt-4 text-slate-500 dark:text-slate-400 font-semibold">Tidak ada project yang cocok</p>
                <p className="mt-1 text-sm text-slate-400">Coba kata kunci lain atau reset filter.</p>
                <button onClick={() => { setSearch(''); setCategory('all'); }} className="mt-5 px-5 py-2.5 rounded-xl bg-cyan-500 text-white font-bold hover:bg-cyan-600 transition">
                  Reset Filter
                </button>
              </div>
            )}
          </div>
          )}

          <div className="overflow-hidden">
            <div id="slider" className="flex transition-transform duration-700 ease-in-out" style={{ transform: activeTab === 'skills' ? 'translateX(-100%)' : 'translateX(0)' }}>
              <div className="min-w-full">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
                  {visibleProjects.length > 0 ? visibleProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  )) : (
                    <div className="empty-card">
                      <i className="fa-regular fa-folder-open text-4xl" />
                      <p className="mt-4">Belum ada project yang ditambahkan.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="min-w-full">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {skills.length > 0 ? skills.map((skill) => (
                    <SkillCard key={skill.id} skill={skill} />
                  )) : (
                    <div className="empty-card">
                      <i className="fa-solid fa-code text-4xl" />
                      <p className="mt-4">Belum ada skill yang ditambahkan.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section id="experiences" className="py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <p className="section-label justify-center">EXPERIENCE</p>
            <h2 className="section-title">Pengalaman & Kegiatan</h2>
            <p className="section-description">Dokumentasi pengalaman, kegiatan, dan projek yang pernah saya jalani.</p>
          </div>
          <div className="mt-14 space-y-6">
            {experiences.length > 0 ? experiences.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} />
            )) : (
              <div className="empty-card">Belum ada pengalaman yang ditambahkan.</div>
            )}
          </div>
        </div>
      </section>

      {/* CERTIFICATES */}
      <section id="certificates" className="py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <p className="section-label justify-center">CERTIFICATES</p>
            <h2 className="section-title">Sertifikat</h2>
            <p className="section-description">Kumpulan sertifikat pelatihan, kompetisi, dan pencapaian yang saya raih.</p>
          </div>
          {certificates.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
              {certificates.map((cert) => (
                <CertificateCard key={cert.id} certificate={cert} />
              ))}
            </div>
          ) : (
            <div className="empty-card mt-14">Belum ada sertifikat yang ditambahkan.</div>
          )}
        </div>
      </section>

      {/* BLOG */}
      <section id="blog" className="py-28 bg-slate-50 dark:bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <p className="section-label justify-center">BLOG</p>
            <h2 className="section-title">Artikel Terbaru</h2>
            <p className="section-description">Catatan, tutorial, dan pemikiran seputar web development.</p>
          </div>
          {blogs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7 mt-14">
              {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          ) : (
            <div className="empty-card mt-14">Belum ada artikel.</div>
          )}
        </div>
      </section>

      {/* CV */}
      <section id="cv" className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="rounded-[32px] bg-slate-900 dark:bg-white/5 border border-slate-800 dark:border-white/10 p-8 md:p-12 text-white shadow-2xl">
            <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center">
              <div>
                <p className="text-cyan-400 font-semibold">DIGITAL CV</p>
                <h2 className="mt-3 text-3xl md:text-4xl font-black">Curriculum Vitae</h2>
                <p className="mt-4 text-slate-300 leading-7 max-w-2xl">
                  Lihat informasi pendidikan, kemampuan, pengalaman, projek, dan aktivitas saya dalam CV digital.
                </p>
              </div>
              <a 
  href="/CV_Dini.pdf" 
  download="CV_Dini.pdf" 
  target="_blank" 
  rel="noopener noreferrer" 
  className="..."
>
  <i className="fa-solid fa-download" /> Download CV
</a>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT & GUESTBOOK */}
     <section id="contact" className="py-28 scroll-mt-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center">
            <p className="section-label justify-center">CONTACT</p>
            <h2 className="section-title">Hubungi Saya</h2>
            <p className="section-description">Punya pertanyaan, feedback, atau ingin mengetahui lebih lanjut tentang projek saya?</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mt-12">
            <div className="contact-card">
              <div className="contact-icon"><i className="fa-regular fa-envelope" /></div>
              <p className="contact-label">Email</p>
              <p className="contact-value">ddini6851@gmail.com</p>
              <button type="button" className="copy-button" onClick={() => navigator.clipboard.writeText('ddini6851@gmail.com')}>
                <i className="fa-regular fa-copy" /> Salin Email
              </button>
            </div>
            <a href="https://github.com/Dindut0908" target="_blank" rel="noopener noreferrer" className="contact-card group">
              <div className="contact-icon"><i className="fa-brands fa-github" /></div>
              <p className="contact-label">GitHub</p>
              <p className="contact-value">GitHub Profile</p>
              <span className="text-cyan-500 text-sm mt-3 inline-block">Buka profil <i className="fa-solid fa-arrow-up-right-from-square ml-1 text-xs" /></span>
            </a>
            <a href="https://instagram.com/din_webdeveloper" target="_blank" rel="noopener noreferrer" className="contact-card group">
              <div className="contact-icon"><i className="fa-brands fa-instagram" /></div>
              <p className="contact-label">Instagram</p>
              <p className="contact-value">Instagram Profile</p>
              <span className="text-cyan-500 text-sm mt-3 inline-block">Buka profil <i className="fa-solid fa-arrow-up-right-from-square ml-1 text-xs" /></span>
            </a>
          </div>

          <div className="mt-10 p-7 md:p-10 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Kesan & Pesan</h3>
            <p className="mt-2 text-slate-500 dark:text-slate-400">Berikan kesan, pesan, atau feedback untuk portofolio saya.</p>

            <form id="guestbookForm" className="mt-7 space-y-5" onSubmit={handleGuestbookSubmit}>
              <div className="grid md:grid-cols-2 gap-5">
                <input
                  type="text"
                  name="name"
                  placeholder="Nama"
                  required
                  className="form-input"
                  value={gbName}
                  onChange={(e) => setGbName(e.target.value)}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email (opsional)"
                  className="form-input"
                  value={gbEmail}
                  onChange={(e) => setGbEmail(e.target.value)}
                />
              </div>
              <textarea
                name="message"
                id="gb_message"
                rows="5"
                placeholder="Tulis kesan dan pesan..."
                required
                className="form-input"
                value={gbMessage}
                onChange={(e) => setGbMessage(e.target.value)}
              />
              <button
                type="submit"
                id="gb_submit"
                className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold hover:-translate-y-1 transition ${gbSubmitting ? 'opacity-70 cursor-not-allowed' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'}`}
                disabled={gbSubmitting}
              >
                {gbSubmitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" /> Mengirim...
                  </>
                ) : (
                  <>
                    <i className="fa-regular fa-paper-plane" /> <span>Kirim Pesan</span>
                  </>
                )}
              </button>
              {gbAlert.message && (
                <p id="gb_alert" className={`text-sm font-semibold mt-2 ${gbAlert.type === 'success' ? 'text-green-500' : 'text-red-500'} block`}>
                  {gbAlert.message}
                </p>
              )}
            </form>

            <div className="mt-10 pt-8 border-t border-slate-200 dark:border-white/10">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-5">Pesan Terbaru</h3>
              <div id="guestbookList" className="space-y-4">
                {guestbooks.length > 0 ? (
                  guestbooks.map((gb) => (
                    <GuestbookItem key={gb.id} item={gb} />
                  ))
                ) : (
                  <div className="p-10 text-center text-slate-400 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    Belum ada pesan dari pengunjung.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <button
        id="backToTop"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl hidden items-center justify-center hover:-translate-y-1 transition"
      >
        <i className="fa-solid fa-arrow-up" />
      </button>

      <div id="copyToast" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] hidden px-5 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl">
        Email berhasil disalin.
      </div>

      <style>{`
        .skill-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.55rem 0.9rem;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.25);
          background: rgba(255, 255, 255, 0.7);
          color: #475569;
          font-size: 0.8rem;
          font-weight: 700;
          transition: 0.3s ease;
        }
        .dark .skill-badge {
          background: rgba(255, 255, 255, 0.04);
          color: #cbd5e1;
          border-color: rgba(255, 255, 255, 0.1);
        }
        .skill-badge:hover {
          transform: translateY(-3px);
          border-color: #06b6d4;
          color: #06b6d4;
        }
        .info-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.2rem;
          border-radius: 1.25rem;
          background: rgba(255, 255, 255, 0.75);
          border: 1px solid #e2e8f0;
          transition: 0.3s ease;
        }
        .dark .info-card {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.08);
        }
        .info-icon {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          border-radius: 12px;
          background: rgba(6, 182, 212, 0.1);
          color: #06b6d4;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .info-label {
          font-size: 0.75rem;
          color: #94a3b8;
        }
        .info-value {
          margin-top: 0.2rem;
          font-size: 0.9rem;
          font-weight: 700;
          color: #0f172a;
        }
        .dark .info-value { color: white; }
        .stat-card {
          min-height: 150px;
          padding: 1.5rem;
          border-radius: 1.5rem;
          background: rgba(255, 255, 255, 0.75);
          border: 1px solid #e2e8f0;
          transition: 0.3s ease;
        }
        .dark .stat-card {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.08);
        }
        .empty-card {
          padding: 4rem 2rem;
          text-align: center;
          border-radius: 1.5rem;
          border: 1px dashed #cbd5e1;
          color: #94a3b8;
        }
        .dark .empty-card { border-color: rgba(255, 255, 255, 0.1); }
        .contact-card {
          display: block;
          padding: 1.5rem;
          border-radius: 1.5rem;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid #e2e8f0;
          transition: 0.3s ease;
        }
        .dark .contact-card {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.08);
        }
        .contact-icon {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          background: rgba(6, 182, 212, 0.1);
          color: #06b6d4;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }
        .contact-label {
          margin-top: 1rem;
          color: #94a3b8;
          font-size: 0.8rem;
          justify-content: center;
        }
        .contact-value {
          margin-top: 0.25rem;
          font-weight: 700;
          color: #0f172a;
        }
        .dark .contact-value { color: white; }
        .copy-button {
          margin-top: 1rem;
          color: #06b6d4;
          font-size: 0.85rem;
          font-weight: 700;
        }
        .form-input {
          width: 100%;
          padding: 0.9rem 1rem;
          border-radius: 0.9rem;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #0f172a;
          outline: none;
          transition: 0.3s ease;
        }
        .dark .form-input {
          border-color: rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          color: white;
        }
        .form-input:focus { border-color: #06b6d4; box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1); }
        .tab-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.8rem 1.2rem;
          border-radius: 0.9rem;
          border: 1px solid #e2e8f0;
          background: white;
          color: #64748b;
          font-weight: 700;
          transition: 0.3s ease;
          cursor: pointer;
        }
        .dark .tab-button {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.1);
          color: #94a3b8;
        }
        .active-tab {
          background: #0f172a !important;
          color: white !important;
          border-color: #0f172a !important;
        }
        .dark .active-tab {
          background: white !important;
          color: #0f172a !important;
          border-color: white !important;
        }
        .filter-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.1rem;
          border-radius: 999px;
          border: 1px solid #e2e8f0;
          background: white;
          color: #64748b;
          font-size: 0.85rem;
          font-weight: 700;
          transition: 0.3s ease;
          cursor: pointer;
        }
        .dark .filter-btn {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.1);
          color: #94a3b8;
        }
        .filter-btn:hover {
          color: #06b6d4;
          border-color: #06b6d4;
          transform: translateY(-2px);
        }
        .active-filter {
          background: linear-gradient(135deg, #06b6d4, #8b5cf6) !important;
          color: white !important;
          border-color: transparent !important;
          box-shadow: 0 8px 20px rgba(6, 182, 212, 0.25);
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-float-delay { animation: float 4s ease-in-out 1s infinite; }
      `}</style>

    </section>
  );
};

export default Home;
