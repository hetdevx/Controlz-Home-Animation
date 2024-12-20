"use client";

import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";

const Home = () => {
  const canvasRef = useRef(null);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const images = useRef([]);
  const frameCount = 810; // Total number of images
  const imageSeq = useRef({ frame: 0 }); // To keep track of the current frame
  const loadedImages = useRef(new Set()); // Track which images are loaded

  // Function to load an image
  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  };

  // Load images sequentially without triggering re-renders
  const loadImages = async () => {
    const promises = [];
    for (let i = 1; i <= frameCount; i++) {
      const imageUrl = `https://controlz-public-images.s3.ap-south-1.amazonaws.com/home/3D-images/${String(
        i
      ).padStart(4, "0")}.png`;
      promises.push(
        loadImage(imageUrl).then((img) => {
          images.current.push(img);
          loadedImages.current.add(i); // Track this image as loaded
          if (images.current.length === frameCount) {
            setLoadingComplete(true); // Set loading complete when all images are loaded
          }
        })
      );
    }
    await Promise.all(promises);
  };

  // Function to render the current frame on canvas
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas || !images.current[imageSeq.current.frame]) return;
    const context = canvas.getContext("2d");
    const img = images.current[imageSeq.current.frame];

    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    const ratio = Math.min(hRatio, vRatio);
    const centerShiftX = (canvas.width - img.width * ratio) / 2;
    const centerShiftY = (canvas.height - img.height * ratio) / 2;

    context.clearRect(0, 0, canvas.width, canvas.height); // Clear previous frame
    context.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      centerShiftX,
      centerShiftY,
      img.width * ratio,
      img.height * ratio
    );
  };

  useEffect(() => {
    loadImages(); // Start loading images when the component mounts
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // ScrollTrigger animation to control the image animation
    gsap.to(imageSeq.current, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        trigger: "#home", // Trigger animation based on the scroll position within #home
        start: "top top", // When the top of the section hits the top of the viewport
        end: "bottom top", // When the bottom of the section hits the top of the viewport
        scrub: 1.8, // Smooth scroll scrub for better sync
        pin: true, // Pin the section during the scroll
        markers: false, // You can enable markers for debugging scroll trigger
        onUpdate: () => render(), // Call render to update the frame during the scroll
      },
    });

    // Cleanup scroll trigger on component unmount
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <>
      <section
        id="hero"
        className="flex items-center justify-center h-screen bg-indigo-500"
      >
        <h1 className="text-5xl font-bold text-white">Apple Vision Pro</h1>
      </section>

      <section
        id="home"
        className="relative flex items-center justify-center h-screen bg-gray-100 overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          width={window.innerWidth}
          height={window.innerHeight}
        ></canvas>
      </section>

      <section
        id="footer"
        className="flex items-center justify-center h-screen bg-indigo-700"
      >
        <h1 className="text-5xl font-bold text-white">Explore New World</h1>
      </section>
    </>
  );
};

export default Home;
