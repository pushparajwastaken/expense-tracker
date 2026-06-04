import { Container } from "@/components/container";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
export default function Home() {
  return (
    <div className="layout">
      <div className="layout-lines-container">
        <div className="left-line" />
        <div className="right-line" />
      </div>
      <Container>
        <Navbar />
        <Hero />
      </Container>
      <div className="hero-image-container">
        <div className="horizontal-line" />
        <img src="/hero-ui-v6.webp" alt="" className="hero-image" />
      </div>
    </div>
  );
}
