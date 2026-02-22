import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Check, 
  X, 
  RefreshCw, 
  Loader2, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { invokeEdgeFunction } from '@/lib/edge-functions';
import { toast } from 'sonner';

interface ImageItem {
  url: string;
  type: 'cover' | 'gallery';
  index?: number;
  status: 'pending' | 'approved' | 'regenerating';
  prompt?: string;
}

interface ImageApprovalPreviewProps {
  coverImage?: string;
  galleryImages: string[];
  galleryPrompts: string[];
  visualContext: string;
  mainSubject: string;
  title: string;
  categorySlug: string;
  tags: string[];
  onImagesApproved: (coverImage: string | undefined, galleryImages: string[]) => void;
  onCancel: () => void;
}

export function ImageApprovalPreview({
  coverImage,
  galleryImages,
  galleryPrompts,
  visualContext,
  mainSubject,
  title,
  categorySlug,
  tags,
  onImagesApproved,
  onCancel,
}: ImageApprovalPreviewProps) {
  const [images, setImages] = useState<ImageItem[]>(() => {
    const items: ImageItem[] = [];
    
    if (coverImage) {
      items.push({
        url: coverImage,
        type: 'cover',
        status: 'pending',
      });
    }
    
    galleryImages.forEach((url, index) => {
      items.push({
        url,
        type: 'gallery',
        index,
        status: 'pending',
        prompt: galleryPrompts[index],
      });
    });
    
    return items;
  });

  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);

  const handleApprove = (itemIndex: number) => {
    setImages(prev => prev.map((img, i) => 
      i === itemIndex ? { ...img, status: 'approved' } : img
    ));
  };

  const handleApproveAll = () => {
    setImages(prev => prev.map(img => ({ ...img, status: 'approved' })));
  };

  const handleRegenerate = async (itemIndex: number) => {
    const item = images[itemIndex];
    setRegeneratingIndex(itemIndex);
    setImages(prev => prev.map((img, i) => 
      i === itemIndex ? { ...img, status: 'regenerating' } : img
    ));

    try {
      const { data, error } = await invokeEdgeFunction('generate-article-image', {
        title,
        category: categorySlug,
        tags,
        type: item.type,
        customPrompt: item.type === 'gallery' ? item.prompt : undefined,
        visualContext,
        mainSubject,
      });

      if (error || !data?.success) {
        throw new Error(data?.error || 'Falha ao regenerar imagem');
      }

      setImages(prev => prev.map((img, i) => 
        i === itemIndex ? { ...img, url: data.imageUrl, status: 'pending' } : img
      ));

      toast.success('Imagem regenerada com sucesso!');
    } catch (err) {
      console.error('Regenerate error:', err);
      toast.error('Erro ao regenerar imagem');
      setImages(prev => prev.map((img, i) => 
        i === itemIndex ? { ...img, status: 'pending' } : img
      ));
    } finally {
      setRegeneratingIndex(null);
    }
  };

  const handleConfirm = () => {
    const approvedCover = images.find(img => img.type === 'cover')?.url;
    const approvedGallery = images
      .filter(img => img.type === 'gallery')
      .sort((a, b) => (a.index || 0) - (b.index || 0))
      .map(img => img.url);
    
    onImagesApproved(approvedCover, approvedGallery);
  };

  const allApproved = images.every(img => img.status === 'approved');
  const approvedCount = images.filter(img => img.status === 'approved').length;
  const isRegenerating = regeneratingIndex !== null;

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Aprovação de Imagens
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Revise e aprove cada imagem antes de salvar o artigo
            </p>
          </div>
          <Badge variant={allApproved ? 'default' : 'secondary'}>
            {approvedCount}/{images.length} aprovadas
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cover Image */}
        {images.some(img => img.type === 'cover') && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Imagem de Capa
            </h3>
            {images.filter(img => img.type === 'cover').map((item, i) => {
              const itemIndex = images.findIndex(img => img === item);
              return (
                <ImageApprovalCard
                  key={`cover-${i}`}
                  item={item}
                  isRegenerating={regeneratingIndex === itemIndex}
                  onApprove={() => handleApprove(itemIndex)}
                  onRegenerate={() => handleRegenerate(itemIndex)}
                  aspectRatio="video"
                  disabled={isRegenerating}
                />
              );
            })}
          </div>
        )}

        {/* Gallery Images */}
        {images.some(img => img.type === 'gallery') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Galeria de Imagens
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleApproveAll}
                disabled={allApproved || isRegenerating}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Aprovar Todas
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.filter(img => img.type === 'gallery').map((item, i) => {
                const itemIndex = images.findIndex(img => img === item);
                return (
                  <ImageApprovalCard
                    key={`gallery-${i}`}
                    item={item}
                    isRegenerating={regeneratingIndex === itemIndex}
                    onApprove={() => handleApprove(itemIndex)}
                    onRegenerate={() => handleRegenerate(itemIndex)}
                    aspectRatio="square"
                    disabled={isRegenerating}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-border/50">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isRegenerating}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <div className="flex-1" />
          <Button
            onClick={handleConfirm}
            disabled={!allApproved || isRegenerating}
          >
            <Check className="h-4 w-4 mr-2" />
            Confirmar Imagens
          </Button>
        </div>

        {!allApproved && (
          <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Aprove todas as imagens para continuar
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface ImageApprovalCardProps {
  item: ImageItem;
  isRegenerating: boolean;
  onApprove: () => void;
  onRegenerate: () => void;
  aspectRatio: 'video' | 'square';
  disabled: boolean;
}

function ImageApprovalCard({
  item,
  isRegenerating,
  onApprove,
  onRegenerate,
  aspectRatio,
  disabled,
}: ImageApprovalCardProps) {
  const isApproved = item.status === 'approved';

  return (
    <div className="relative group">
      <div 
        className={`
          relative overflow-hidden rounded-lg border-2 transition-all
          ${aspectRatio === 'video' ? 'aspect-video' : 'aspect-square'}
          ${isApproved ? 'border-green-500' : 'border-border/50'}
          ${isRegenerating ? 'opacity-50' : ''}
        `}
      >
        {isRegenerating ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground mt-2">Regenerando...</p>
            </div>
          </div>
        ) : (
          <img
            src={item.url}
            alt={item.type === 'cover' ? 'Imagem de capa' : `Galeria ${(item.index || 0) + 1}`}
            className="w-full h-full object-cover"
          />
        )}

        {/* Approved Badge */}
        {isApproved && !isRegenerating && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-500 text-white">
              <Check className="h-3 w-3 mr-1" />
              Aprovada
            </Badge>
          </div>
        )}

        {/* Action Buttons Overlay */}
        {!isRegenerating && !isApproved && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={onApprove}
              disabled={disabled}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Check className="h-4 w-4 mr-1" />
              Aprovar
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={onRegenerate}
              disabled={disabled}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Regenerar
            </Button>
          </div>
        )}

        {/* Regenerate button for approved images */}
        {!isRegenerating && isApproved && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              size="sm"
              variant="secondary"
              onClick={onRegenerate}
              disabled={disabled}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Regenerar
            </Button>
          </div>
        )}
      </div>

      {/* Prompt Preview for Gallery */}
      {item.type === 'gallery' && item.prompt && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {item.prompt}
        </p>
      )}
    </div>
  );
}
