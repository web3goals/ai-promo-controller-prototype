import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="container flex flex-col items-center justify-center gap-6 pb-8 pt-6 lg:h-[calc(100vh-4rem)]">
      {/* Text with buttons */}
      <section className="flex flex-col items-center py-8">
        <h1 className="text-4xl font-extrabold tracking-tighter text-center max-w-[1080px] md:text-5xl">
          Gain control over promotion
        </h1>
        <h2 className="text-2xl font-normal tracking-tight text-center text-muted-foreground mt-4">
          A platform for finding and controlling influencers powered by smart
          contracts and AI
        </h2>
      </section>
      {/* Image */}
      <section className="flex flex-col items-center max-w-[420px]">
        <Image
          src="/images/networks.png"
          alt="Networks"
          priority={false}
          width="100"
          height="100"
          sizes="100vw"
          className="w-full"
        />
      </section>
    </div>
  );
}
