import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ContainerGallery from '@/components/product/ContainerGallery';
import ShippingCalculator from '@/components/product/ShippingCalculator';
import ProductFAQ from '@/components/product/ProductFAQ';
import RelatedProducts from '@/components/product/RelatedProducts';
import { SIZE_OPTIONS } from '@/components/product/SizeSelector';
import { Badge } from '@/components/ui/badge';
import { Star, ChevronRight, Loader2 } from 'lucide-react';

const GRADE_INFO = {
  'AS_IS': { label: 'As-Is', desc: 'Container may have cosmetic and structural issues. Sold as-is with no guarantees.' },
  'WWT':   { label: 'Wind & Water Tight', desc: 'Guaranteed not to leak. May have dings, dents, and surface rust. Doors in working order.' },
  'CW':    { label: 'Cargo Worthy', desc: 'Certified for international shipping. Structurally sound and watertight. Inspected by certified surveyor.' },
  'IICL':  { label: 'IICL Certified', desc: 'Meets the highest international standards. Minimal wear, premium condition.' },
};

export default function ProductDetail() {
  const { id } = useParams();
  const urlParams = new URLSearchParams(window.location.search);
  const zipCode = urlParams.get('zip') || '';

  // Configurator state — owned here, passed to right panel
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0); // 0 = 20ft Standard
  const [condition, setCondition] = useState('used');             // default: Used

  const { data: container, isLoading } = useQuery({
    queryKey: ['container', id],
    queryFn: () => base44.entities.Container.filter({ id }),
    select: (data) => data?.[0] || null,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!container) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Container not found.</p>
          <Link to="/inventory" className="text-primary hover:underline">Browse all containers</Link>
        </div>
      </div>
    );
  }

  const gradeInfo       = GRADE_INFO[container.grade] || {};
  const selectedSize    = SIZE_OPTIONS[selectedSizeIndex];
  const activePrice     = condition === 'new' ? selectedSize.newPrice : selectedSize.usedPrice;
  // Gallery: selected size image first, then any extra images from the DB record
  const allImages       = [selectedSize.image, ...(container.gallery_urls || []).filter(Boolean)];

  // Dynamic title derived from selected size + condition
  const dynamicTitle = `${condition === 'new' ? 'New' : 'Used'} ${selectedSize.label} Shipping Container`;

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/inventory" className="hover:text-primary transition-colors">Inventory</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium truncate">{dynamicTitle}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Left — Gallery + Info */}
          <div>
            <ContainerGallery images={allImages} key={selectedSizeIndex} />

            <div className="mt-10">
              {/* Dynamic title */}
              <h2 className="text-3xl font-black text-foreground mb-5 leading-tight">
                {dynamicTitle}
              </h2>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <Badge className="bg-primary/10 text-primary font-mono rounded-full px-3">
                  {selectedSize.size}ft
                </Badge>
                <Badge variant="outline" className="font-mono rounded-full px-3">
                  {condition.charAt(0).toUpperCase() + condition.slice(1)}
                </Badge>
                {selectedSize.height === 'high_cube' && (
                  <Badge variant="outline" className="font-mono text-primary border-primary rounded-full px-3">
                    High Cube
                  </Badge>
                )}
                <div className="flex items-center gap-1.5 ml-1">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  <span className="text-sm font-semibold">{container.rating}</span>
                  <span className="text-xs text-muted-foreground">({container.review_count} reviews)</span>
                </div>
              </div>

              {/* Grade Info */}
              <div className="bg-primary/5 border border-primary/15 rounded-2xl p-5 mb-6">
                <p className="text-xs font-mono text-primary tracking-widest mb-2">GRADE CLASSIFICATION</p>
                <p className="font-bold text-base mb-1">{gradeInfo.label}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{gradeInfo.desc}</p>
              </div>

              {container.description && (
                <p className="text-muted-foreground leading-relaxed text-base mb-10">
                  {container.description}
                </p>
              )}

              <ProductFAQ />
            </div>
          </div>

          {/* Right — Purchase Panel (Sticky) */}
          <div className="lg:sticky lg:top-24 self-start rounded-2xl p-5" style={{ background: '#07080a' }}>
            <ShippingCalculator
              container={container}
              initialZip={zipCode}
              selectedSizeIndex={selectedSizeIndex}
              onSizeChange={setSelectedSizeIndex}
              condition={condition}
              onConditionChange={setCondition}
            />
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="border-t border-border">
        <RelatedProducts zipCode={zipCode} />
      </div>
    </div>
  );
}