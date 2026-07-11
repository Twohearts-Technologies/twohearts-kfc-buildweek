import "../styles/theme.css";
import { useContent } from "../hooks/useContent";
import { Header } from "../components/kfc/Header";
import { Hero } from "../components/kfc/Hero";
import { DemoVideo } from "../components/kfc/DemoVideo";
import { ProblemSection } from "../components/kfc/ProblemSection";
import { Pipeline } from "../components/kfc/Pipeline";
import { MetricsWorkflow } from "../components/kfc/MetricsWorkflow";
import { Economics } from "../components/kfc/Economics";
import { WhyReal } from "../components/kfc/WhyReal";
import { FooterAsk } from "../components/kfc/FooterAsk";

export default function Home() {
  const content = useContent();
  const { kfcRed, showTexture } = content.theme;

  return (
    <div className="kfc-page">
      <Header content={content.header} kfcRed={kfcRed} />
      <Hero content={content.hero} kfcRed={kfcRed} />
      <DemoVideo content={content.demo} kfcRed={kfcRed} showTexture={showTexture} />
      <ProblemSection content={content.problem} showTexture={showTexture} />
      <Pipeline content={content.pipeline} kfcRed={kfcRed} />
      <MetricsWorkflow content={content.metrics} kfcRed={kfcRed} />
      <Economics content={content.economics} kfcRed={kfcRed} />
      <WhyReal content={content.whyReal} />
      <FooterAsk content={content.footer} showTexture={showTexture} />
    </div>
  );
}
