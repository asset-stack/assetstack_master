import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Presentation as PresentationIcon } from 'lucide-react';

/**
 * "Brochure" CTA — opens the 14-page printable feature brochure at /Brochure.
 */
export default function DownloadBrochureButton({
  variant = 'default',
  className = '',
  label = 'Brochure',
}) {
  return (
    <Button asChild variant={variant} size="sm" className={className}>
      <Link to="/Brochure">
        <PresentationIcon className="w-3.5 h-3.5 mr-1.5" />
        {label}
      </Link>
    </Button>
  );
}