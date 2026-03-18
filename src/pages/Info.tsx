import React, { useEffect, useRef } from 'react';
import { Info, ArrowLeft } from 'lucide-react';
import gsap from 'gsap';

interface InfoPageProps {
  onNavigate: () => void;
}

export default function InfoPage({ onNavigate }: InfoPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(containerRef.current, 
      { opacity: 0 }, 
      { opacity: 1, duration: 0.8, ease: "power2.out" }
    )
    .fromTo(titleRef.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
      "-=0.4"
    )
    .fromTo(contentRefs.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out" },
      "-=0.6"
    );
  }, []);

  const addToRefs = (el: HTMLDivElement | null) => {
    if (el && !contentRefs.current.includes(el)) {
      contentRefs.current.push(el);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen w-full bg-[#000000] text-[#f5f5f7] selection:bg-white/30 font-sans relative">
      <div className="atmosphere absolute inset-0 pointer-events-none z-0"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-24">
        <div onClick={onNavigate} className="inline-block mb-16 cursor-pointer">
          <button className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group">
            <div className="bg-white/5 group-hover:bg-white/10 rounded-full p-2 transition-colors">
              <ArrowLeft size={18} />
            </div>
            <span className="text-sm font-medium">Back to Archive</span>
          </button>
        </div>

        <h1 ref={titleRef} className="font-sans font-semibold text-5xl md:text-7xl tracking-tight mb-16 leading-tight">
          About <br className="hidden md:block" />
          <span className="text-white/40">BLACKPIGEONS</span>
        </h1>

        <div className="space-y-12 text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl">
          <div ref={addToRefs} className="space-y-6">
            <p>
              <strong className="text-white">BLACKPIGEONS</strong> exists because education shouldn’t be locked behind paywalls, overpriced textbooks, and corporations that treat knowledge like a luxury product. Somewhere along the way, learning turned into a business model. Access to information started depending less on curiosity and more on how much money someone could throw at a publisher.
            </p>
            <p>
              That idea never sat right with us.
            </p>
            <p>
              BLACKPIGEONS is a community-built index designed to make study materials easier to find. Across the internet there are countless useful academic resources—notes, textbooks, reference guides, solved papers, and preparation materials—but they are scattered everywhere. Finding them often means digging through forums, broken links, outdated drives, and ten different websites before landing on something useful.
            </p>
            <p>
              BLACKPIGEONS simply organizes those scattered resources into a structured, easy-to-navigate directory so students can spend less time hunting for material and more time actually studying.
            </p>
            <p className="text-white font-medium">
              No subscriptions. No corporate nonsense. Just a clean index.
            </p>
          </div>
          
          <div ref={addToRefs} className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 md:p-10 text-white/90 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20"></div>
            <div className="flex items-center gap-3 mb-6">
              <Info size={24} className="text-white/50" />
              <strong className="text-white text-xl font-medium tracking-tight">Disclaimer</strong>
            </div>
            <div className="space-y-6 text-white/70">
              <p>
                Before anything else, one thing must be extremely clear.
              </p>
              <p className="text-white font-medium">
                BLACKPIGEONS does not host, store, upload, or distribute any files.
              </p>
              <p>
                Not a single file lives on this project.
              </p>
              <p>
                BLACKPIGEONS acts only as an indexer. The platform collects and organizes links that already exist on the public internet and presents them in a structured way. All files referenced here are hosted on third-party servers, repositories, and file hosts that are completely independent of this project.
              </p>
              <div className="bg-black/30 rounded-2xl p-6 border border-white/5 space-y-4">
                <p className="text-white font-medium mb-2">To put it plainly:</p>
                <ul className="list-disc list-inside space-y-2 text-white/60">
                  <li>BLACKPIGEONS does not host any study materials</li>
                  <li>BLACKPIGEONS does not upload or distribute files</li>
                  <li>BLACKPIGEONS only indexes links that point to external sources</li>
                </ul>
              </div>
              <p>
                Every file you see linked here is hosted somewhere else on the internet. We just make them easier to locate.
              </p>
            </div>
          </div>
          
          <div ref={addToRefs} className="space-y-6">
            <p>
              The idea behind the project is simple: knowledge should not be treated like a luxury item. Education should not depend on whether someone can afford a stack of expensive textbooks or a subscription to yet another “premium learning platform.” Information grows when it is shared, and the internet was supposed to make knowledge more accessible—not more locked down.
            </p>
            <p className="text-white font-medium">
              BLACKPIGEONS stands for the belief that students deserve easier access to educational resources, regardless of their financial situation.
            </p>
          </div>

          <div ref={addToRefs} className="space-y-6">
            <p>
              Since the project only indexes links and does not host files, we naturally have no control over the content, availability, or legality of resources hosted by third-party sites.
            </p>
            <p>
              If you are a content owner and find something here that concerns you, you are welcome to reach out. We will review the listing and remove the index entry if it gets enough votes.
            </p>
            <p>
              We’re reasonable people.
            </p>
            <p className="italic text-white/50">
              Just know that removing one link from an index on the internet is a bit like removing a pigeon from a flock — it doesn’t stop the flock from existing. It just makes the sky slightly less crowded for about five seconds.
            </p>
          </div>

          <div ref={addToRefs} className="space-y-6 pt-8 border-t border-white/10">
            <p>
              BLACKPIGEONS is an open, evolving, community-driven project. If you believe in the idea behind it, consider starring the repository on GitHub. It helps the project reach more students and keeps the work going.
            </p>
            <p className="text-white font-mono text-sm md:text-base bg-white/5 p-4 rounded-xl inline-block">
              More stars → more visibility → more students finding what they need.
            </p>
            <p className="text-white font-medium">
              And honestly, that’s the whole mission.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
