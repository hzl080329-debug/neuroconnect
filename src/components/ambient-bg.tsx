export function AmbientBg() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-[0.03]"
        style={{ background: 'radial-gradient(circle, #5B9CF5, transparent 70%)' }} />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.02]"
        style={{ background: 'radial-gradient(circle, #3D7AD6, transparent 70%)' }} />
    </div>
  );
}
