import { FaInstagram, FaTiktok } from "react-icons/fa";

export default function Newsletter() {
  return (
    <section
      id="newsletter"
      className="py-12 bg-gray-900 text-white text-center w-full"
    >
      <h3 className="text-2xl font-bold mb-4"></h3>
      <p className="mb-6 text-gray-300">
      </p>
      <div className="flex justify-center gap-12 text-red-600 text-5xl">
        <a
          href="https://www.instagram.com/black_boy_brandth/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="transition-transform duration-300 hover:scale-125 hover:text-red-400"
        >
          <FaInstagram />
        </a>
        <a
          href="https://www.tiktok.com/@blackboybrandth"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TikTok"
          className="transition-transform duration-300 hover:scale-125 hover:text-red-400"
        >
          <FaTiktok />
        </a>
      </div>
    </section>
  );
}
