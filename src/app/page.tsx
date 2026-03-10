import { Hero } from "../components/hero";
import { Problem } from "../components/problem";
import { Thesis } from "../components/thesis";
import { ProcessMap } from "../components/process-map";
import { Mechanism } from "../components/mechanism";
import { Proof } from "../components/proof";
import { Product } from "../components/product";
import { Urgency } from "../components/urgency";
import { Objections } from "../components/objections";
import { CTA } from "../components/cta";
import { Footer } from "../components/footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <Problem />
      <Thesis />
      <ProcessMap />
      <Mechanism />
      <Proof />
      <Product />
      <Urgency />
      <Objections />
      <CTA />
      <Footer />
    </main>
  );
}
