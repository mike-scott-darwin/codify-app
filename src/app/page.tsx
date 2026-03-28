import { Nav } from "../components/nav";
import { Hero } from "../components/hero";
import { Problem } from "../components/problem";
import { Mechanism } from "../components/mechanism";
import { InlineCTA } from "../components/inline-cta";
import { Proof } from "../components/proof";
import { Testimonials } from "../components/testimonials";
import { Product } from "../components/product";
import { Objections } from "../components/objections";
import { CTA } from "../components/cta";
import { Footer } from "../components/footer";

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <Problem />
      <Mechanism />
      <InlineCTA />
      <Proof />
      <Testimonials />
      <Product />
      <Objections />
      <CTA />
      <Footer />
    </main>
  );
}
