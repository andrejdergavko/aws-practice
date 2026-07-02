import Image from 'next/image';

export interface GalleryItem {
  key: string;
  url: string;
  lastModified?: string;
  size?: number;
}

interface GallerySectionProps {
  items: GalleryItem[];
  isLoading: boolean;
  error: string;
  onRefresh: () => void;
}

export function GallerySection({
  items,
  error,
  isLoading,
  onRefresh,
}: GallerySectionProps) {
  return (
    <section className="w-full max-w-5xl space-y-3 rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">Содержимое папки uploads</p>
          <h2 className="text-lg font-semibold text-white">Галерея</h2>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Обновляю…' : 'Обновить'}
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-400">Загружаю изображения…</p>
      ) : error ? (
        <p className="text-sm text-red-300">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-400">В папке пока нет изображений.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.key}
              className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 shadow-[0_0_0_1px_rgba(226,232,240,0.05)]"
            >
              <a href={item.url} target="_blank" rel="noreferrer">
                <div className="relative h-24 w-full">
                  <Image
                    src={item.url}
                    alt={item.key}
                    fill
                    sizes="(max-width: 768px) 75vw, (max-width: 1280px) 40vw, 24vw"
                    className="object-cover transition hover:scale-105"
                  />
                </div>
              </a>
              <div className="px-3 py-2 text-[11px] text-slate-300">
                <p className="truncate">{item.key.split('/').pop()}</p>
                {item.lastModified && (
                  <p className="text-xs text-slate-500">{item.lastModified}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
