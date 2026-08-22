export function Viewer3D({ sketchfabModelId }: { sketchfabModelId: string }) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded border border-black/10 bg-black/5">
      <iframe
        title="Modelo 3D"
        className="h-full w-full"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        src={`https://sketchfab.com/models/${sketchfabModelId}/embed?autostart=1`}
      />
    </div>
  );
}
