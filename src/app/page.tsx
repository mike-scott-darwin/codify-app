import { Nav } from "../components/nav";
import { Hero } from "../components/hero";
import { Demo } from "../components/demo";
import { Compatibility } from "../components/compatibility";
import { Problem } from "../components/problem";
import { Thesis } from "../components/thesis";
import { Mechanism } from "../components/mechanism";
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
      <Demo />
      <Compatibility />
      <Problem />
      <Thesis />
      <Mechanism />
      <Proof />
      <Testimonials />
      <Product />
      <Objections />
      <CTA />
      <Footer />
    </main>
  );
}
