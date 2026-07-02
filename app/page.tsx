'use client';

import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { GallerySection, GalleryItem } from './components/GallerySection';

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [statusMessage, setStatusMessage] = useState(
    'Выберите изображение и нажмите «Upload».',
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [galleryError, setGalleryError] = useState('');
  const [galleryLoading, setGalleryLoading] = useState(true);

  const triggerFileDialog = () => {
    fileInputRef.current?.click();
  };

  const refreshGallery = useCallback(async () => {
    setGalleryError('');
    setGalleryLoading(true);

    try {
      const response = await fetch('/api/uploads');
      if (!response.ok) {
        throw new Error('Не удалось получить список изображений.');
      }

      const payload = await response.json();
      setGalleryItems(payload.items ?? []);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Неизвестная ошибка при загрузке галереи.';
      setGalleryError(message);
    } finally {
      setGalleryLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshGallery();
    }, 0);

    return () => clearTimeout(timer);
  }, [refreshGallery]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setErrorMessage('');
    setUploadedUrl('');
    setStatusMessage('Генерируем безопасную ссылку для загрузки...');
    setIsLoading(true);

    try {
      const response = await fetch('/api/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      });

      const signedPayload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          signedPayload?.error ?? 'Не удалось получить ссылку для загрузки.',
        );
      }

      const { url, publicUrl } = signedPayload;
      if (!url) {
        throw new Error('Сервер не вернул ссылку для загрузки.');
      }

      setStatusMessage('Загружаем изображение напрямую в Amazon S3...');

      const uploadResponse = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Не удалось загрузить файл на S3.');
      }

      setUploadedUrl(publicUrl ?? '');
      setStatusMessage('Изображение загружено!');
      refreshGallery();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Произошла неизвестная ошибка при загрузке.';
      setErrorMessage(errorMessage);
      setStatusMessage('');
    } finally {
      setIsLoading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-950 p-6 text-white">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={triggerFileDialog}
        disabled={isLoading}
        className="rounded-md bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-800"
      >
        {isLoading ? 'Секундочку…' : 'Upload image'}
      </button>
      <div
        className="flex flex-col items-center gap-2 text-center text-sm"
        aria-live="polite"
      >
        {statusMessage && <p className="text-slate-200">{statusMessage}</p>}
        {errorMessage && <p className="text-red-300">{errorMessage}</p>}
        {uploadedUrl && (
          <a
            className="text-blue-300 underline"
            href={uploadedUrl}
            target="_blank"
            rel="noreferrer"
          >
            Посмотреть загруженное изображение
          </a>
        )}
      </div>

      <GallerySection
        items={galleryItems}
        isLoading={galleryLoading}
        error={galleryError}
        onRefresh={refreshGallery}
      />
    </div>
  );
}
