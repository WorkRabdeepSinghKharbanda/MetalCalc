// Reserved space for a future ad network (e.g. AdSense). Renders an empty,
// fixed-size placeholder so layout doesn't shift once a real ad is wired in.
// To activate: drop the network's script tag in index.html, then render its
// unit inside this component keyed by `slot`.
export default function AdSlot({ slot, height = 90 }) {
  return (
    <div className="ad-slot" style={{ minHeight: height }} data-ad-slot={slot}>
      <span className="muted">Ad space</span>
    </div>
  )
}
