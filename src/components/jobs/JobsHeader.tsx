import { useWishlist } from "@/hooks/use-wishlist";
import { useNavigate } from "react-router-dom";

export const JobsHeader = () => {
  const { wishlistJobs } = useWishlist();
  const navigate = useNavigate();

  return (
    <section className="max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
      <div className="space-y-4">
        <h1 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tighter text-on-surface">
          Find Your Dream Job
        </h1>
        <p className="text-on-surface-variant text-lg max-w-xl">
          Discover high-end career opportunities curated specifically for your skill set and professional vision.
        </p>
      </div>
      <button
        type="button"
        onClick={() => navigate("/jobseeker/saved-jobs")}
        className="flex items-center gap-2 px-8 py-4 bg-surface-container-lowest text-on-surface font-semibold rounded-full shadow-sm hover:scale-[1.02] transition-transform active:scale-95"
      >
        <span className={`material-symbols-outlined ${wishlistJobs.length > 0 ? 'text-primary' : ''}`} style={{ fontVariationSettings: wishlistJobs.length > 0 ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
        My Wishlist
        {wishlistJobs.length > 0 && (
          <span className="ml-2 bg-primary text-on-primary rounded-full px-2 py-0.5 text-xs font-bold">
            {wishlistJobs.length}
          </span>
        )}
      </button>
    </section>
  );
};
