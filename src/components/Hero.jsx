// Hero.js
import React, { useState, useEffect } from "react";

export default function Hero() {
  const images = ["/HERO.png", "/HERO2.png", "/HERO3.png", "/HERO4.png"];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    const section = document.getElementById("productgrid");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    } else {
      console.warn("ไม่พบ section #productgrid");
    }
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % images.length);
  };

  const goToSlide = (index) => {
    setCurrent(index);
  };

  return (
    <section className="relative bg-black text-white overflow-hidden select-none pt-16">
      {/* pt-16 = 64px เผื่อ Navbar */}
      <div className="relative w-full aspect-[16/9] max-h-[90vh]">
        <div
          className="absolute inset-0 flex transition-transform duration-1000 ease-in-out"
          style={{
            width: `${images.length * 100}%`,
            transform: `translateX(-${current * (100 / images.length)}%)`,
          }}
        >
          {images.map((img, index) => (
            <div
              key={index}
              className="w-full h-full flex-shrink-0 flex items-center justify-center relative"
              style={{ width: `${100 / images.length}%` }}
            >
              <img
                src={img}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                draggable={false}
              />
            </div>
          ))}
        </div>

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6 bg-black/40 px-4">
          <h1 className="font-bold text-3xl sm:text-4xl md:text-6xl animate-fade-in leading-tight">
            BLACKBOYBRAND
          </h1>

          <button
            onClick={handleClick}
            className="px-4 py-2 sm:px-6 sm:py-3 text-lg font-semibold text-black bg-white rounded-full shadow-lg hover:scale-105 hover:bg-gray-200 transition-all duration-300 ease-in-out animate-fade-in"
          >
            SHOP NOW
          </button>
        </div>

        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 sm:p-3 z-20 transition"
        >
          &#10094;
        </button>
        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 sm:p-3 z-20 transition"
        >
          &#10095;
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`w-3 h-3 rounded-full transition-colors ${
                idx === current ? "bg-white" : "bg-white/50 hover:bg-white"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease forwards;
        }
      `}</style>
    </section>
  );
}
