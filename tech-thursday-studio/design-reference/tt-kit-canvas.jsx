// tt-kit-canvas.jsx — Tech Thursday brand kit (Direction D · Desk Calendar)
// Organized for sign-off and handoff. Sections group related deliverables.

function App() {
  return (
    <DesignCanvas
      title="Tech Thursday · brand kit"
      subtitle="Direction D · Desk Calendar. Drag any artboard to reorder, click the expand icon to view full-screen. Animated assets loop every ~5s."
    >
      <DCSection id="logo" title="01 · Logo & wordmark"
        subtitle="The full lockup pairs the calendar page with a tight wordmark. Use the wordmark-only version for places where the calendar would feel too literal; use the mark-only for tiles and avatars.">
        <DCArtboard id="logo-primary" label="Primary lockup" width={960} height={480}>
          <LogoD />
        </DCArtboard>
        <DCArtboard id="logo-dark" label="On Dark Green" width={960} height={480}>
          <LogoDDark />
        </DCArtboard>
        <DCArtboard id="logo-wordmark" label="Wordmark only · light" width={600} height={400}>
          <WordmarkD />
        </DCArtboard>
        <DCArtboard id="logo-wordmark-dark" label="Wordmark only · dark" width={600} height={400}>
          <WordmarkD dark={true} />
        </DCArtboard>
        <DCArtboard id="mark-light" label="Mark only · light" width={400} height={400}>
          <MarkD />
        </DCArtboard>
        <DCArtboard id="mark-dark" label="Mark only · dark" width={400} height={400}>
          <MarkD dark={true} />
        </DCArtboard>
      </DCSection>

      <DCSection id="bumpers" title="02 · Animated bumpers"
        subtitle="The intro and outro that bookend each video. Screen-record these full-frame and trim, or composite them in Clipchamp. Both loop here for review.">
        <DCArtboard id="intro" label="Intro bumper · 16:9" width={1280} height={720}>
          <IntroBumperD />
        </DCArtboard>
        <DCArtboard id="outro" label="Outro · next-up · 16:9" width={1280} height={720}>
          <OutroD />
        </DCArtboard>
      </DCSection>

      <DCSection id="titles" title="03 · Episode title cards"
        subtitle="The card that overlays the start of each video for ~2s — week number, category, topic. One per stream shown.">
        <DCArtboard id="title-ms" label="Microsoft tip · ep 01" width={960} height={540}>
          <TitleCardD ep={TT_EP_FULL[0]} />
        </DCArtboard>
        <DCArtboard id="title-ai" label="AI tip · ep 02" width={960} height={540}>
          <TitleCardD ep={TT_EP_FULL[1]} />
        </DCArtboard>
        <DCArtboard id="title-gen" label="General tip · ep 03" width={960} height={540}>
          <TitleCardD ep={TT_EP_FULL[2]} />
        </DCArtboard>
      </DCSection>

      <DCSection id="tiles" title="04 · Thumbnails & poster"
        subtitle="The poster doubles as the SharePoint header and a 'binge the back catalogue' graphic. Per-episode thumbnails are the tile on Viva Engage.">
        <DCArtboard id="poster" label="Season poster · all 12" width={1600} height={900}>
          <PosterD />
        </DCArtboard>
        <DCArtboard id="thumb-ms" label="Thumbnail · ep 01" width={480} height={270}>
          <ThumbD ep={TT_EP_FULL[0]} />
        </DCArtboard>
        <DCArtboard id="thumb-ai" label="Thumbnail · ep 02" width={480} height={270}>
          <ThumbD ep={TT_EP_FULL[1]} />
        </DCArtboard>
        <DCArtboard id="thumb-gen" label="Thumbnail · ep 03" width={480} height={270}>
          <ThumbD ep={TT_EP_FULL[2]} />
        </DCArtboard>
      </DCSection>

      <DCSection id="banner" title="05 · Teams channel banner"
        subtitle="A wide masthead for the Tech Thursday channel header in Teams. The mini calendar grid telegraphs the whole season at a glance.">
        <DCArtboard id="banner-teams" label="Teams banner · 1600×320" width={1600} height={320}>
          <BannerD />
        </DCArtboard>
      </DCSection>

      <DCSection id="spec" title="06 · Spec"
        subtitle="The colour, type, and voice notes a designer or video editor needs to keep things on-brand.">
        <DCArtboard id="spec-card" label="Reference card" width={1200} height={680}>
          <SpecD />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
