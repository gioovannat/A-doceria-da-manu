import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import heroCakeImg from '../../assets/images/hero_manu_cake_1790115919579.jpg';
import vintageHeartCakeImg from '../../assets/images/heart_cake_scorpio_1790121371507.jpg';
import bentoCakeImg from '../../assets/images/bento_cake_clamshell_1790115999871.jpg';
import kitFestaImg from '../../assets/images/kit_festa_gourmet_1790116010849.jpg';
import planilhaImg from '../../assets/images/planilha_financas_1791674297243.jpg';
import chefImg from '../../assets/images/chef_manu_photo_1790121605417.jpg';
import logoImg from '../../assets/images/doceria_da_manu_horizontal_logo_1790120305939.jpg';

export interface ImageUploaderProps {
  label?: string;
  value: string;
  onChange: (newImageUrl: string) => void;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
  maxSizeMB?: number;
}

const PRESET_ASSETS = [
  { label: 'Bolo Vintage Lambeth', url: vintageHeartCakeImg },
  { label: 'Bolo Decorado Floral', url: heroCakeImg },
  { label: 'Bentô Cake Clamshell', url: bentoCakeImg },
  { label: 'Kit Festa Completo', url: kitFestaImg },
  { label: 'Planilha Inteligente', url: planilhaImg },
  { label: 'Foto Manu Confeiteira', url: chefImg },
  { label: 'Logomarca Horizontal', url: logoImg },
];

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  value,
  onChange,
  aspectRatio = 'square',
  maxSizeMB = 5,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);

  const aspectClasses = {
    square: 'aspect-square max-h-48',
    video: 'aspect-16/9 max-h-48',
    portrait: 'aspect-3/4 max-h-56',
    auto: 'min-h-[160px]',
  }[aspectRatio];

  const handleFile = (file: File) => {
    setError(null);
    const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!validMimes.includes(file.type)) {
      setError('Formato inválido. Permitido apenas JPG, PNG ou WEBP.');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Tamanho máximo excedido (${maxSizeMB}MB). Por favor otimize a imagem.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.onerror = () => {
      setError('Erro ao processar imagem.');
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = () => {
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2 text-left">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#3D1E26] uppercase tracking-wider">
            {label}
          </label>
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="text-[11px] font-semibold text-[#D81E5B] hover:underline cursor-pointer"
          >
            {showPresets ? 'Ocultar galeria interna' : 'Escolher da galeria interna'}
          </button>
        </div>
      )}

      {/* Preset selector */}
      {showPresets && (
        <div className="p-3 bg-[#FFF5F8] rounded-2xl border border-[#FAD0DE] mb-2 animate-in fade-in duration-200">
          <p className="text-[11px] font-bold text-[#6B4651] mb-2">Fotos Oficiais do Atelier:</p>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {PRESET_ASSETS.map((asset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onChange(asset.url);
                  setShowPresets(false);
                }}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                  value === asset.url ? 'border-[#D81E5B] ring-2 ring-[#D81E5B]/30' : 'border-[#FAD0DE] hover:border-[#D81E5B]'
                }`}
                title={asset.label}
              >
                <img src={asset.url} alt={asset.label} className="w-full h-full object-cover" />
                {value === asset.url && (
                  <div className="absolute inset-0 bg-[#D81E5B]/20 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white drop-shadow-sm" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Upload Zone / Preview */}
      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border border-[#FAD0DE] bg-[#FFF8FA] p-2 flex items-center gap-4">
          <div className={`w-28 h-28 rounded-xl overflow-hidden bg-white border border-[#FCE1EB] shrink-0 ${aspectClasses}`}>
            <img
              src={value}
              alt="Pré-visualização"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = heroCakeImg;
              }}
            />
          </div>

          <div className="flex-1 flex flex-col items-start gap-2 pr-2">
            <span className="text-xs font-bold text-[#3D1E26] flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-[#25D366]" />
              Imagem Selecionada
            </span>
            <p className="text-[11px] text-[#7A505D] truncate max-w-xs">
              {value.startsWith('data:') ? 'Imagem carregada do computador' : value}
            </p>

            <div className="flex items-center gap-2 mt-1">
              <Button
                type="button"
                size="sm"
                variant="outline"
                icon={<RefreshCw className="w-3 h-3" />}
                onClick={() => fileInputRef.current?.click()}
              >
                Substituir
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                icon={<X className="w-3 h-3" />}
                onClick={() => onChange('')}
              >
                Remover
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-[#D81E5B] bg-[#FFF0F4]'
              : 'border-[#FAD0DE] hover:border-[#D81E5B] bg-[#FFFDFE] hover:bg-[#FFF5F8]'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-[#FFF0F4] border border-[#FAD0DE] flex items-center justify-center text-[#D81E5B] mb-2.5 shadow-2xs">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-xs sm:text-sm font-bold text-[#3D1E26]">
            Clique para enviar ou arraste a foto aqui
          </p>
          <p className="text-[11px] text-[#7A505D] mt-1">
            JPG, PNG ou WEBP (máximo {maxSizeMB}MB)
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
};
