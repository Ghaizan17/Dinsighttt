import { getPublicUrl } from '../../hooks/useStorage';
import { format } from 'date-fns';
import type { Blog } from '../../hooks/useBlogs';

interface BlogCardProps {
  blog: Blog;
}

const BlogCard = ({ blog }: BlogCardProps) => {
  const imageUrl = getPublicUrl(blog.thumbnail);
  const publishedDate = blog.published_at ? format(new Date(blog.published_at), 'd MMM yyyy') : '-';

  return (
    <article className="group overflow-hidden rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 shadow-xl transition duration-700 hover:-translate-y-4 hover:shadow-2xl">
      <div className="relative overflow-hidden aspect-[16/10] bg-slate-100 dark:bg-white/5">
        {imageUrl ? (
          <img src={imageUrl} alt={blog.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-4xl">
            <i className="fa-regular fa-image" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="p-6">
        <p className="text-xs text-slate-500 mb-2">
          <i className="fa-regular fa-calendar mr-1" /> {publishedDate}
        </p>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-cyan-500 transition">{blog.title}</h3>
        <p className="mt-3 text-sm text-slate-500 line-clamp-3">{blog.excerpt ?? `${(blog.content ?? '').slice(0, 150)}...`}</p>
      </div>
    </article>
  );
};

export default BlogCard;
