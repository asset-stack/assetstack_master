import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Presentation as PresentationIcon } from 'lucide-react';

/**
 * "View presentation" CTA — opens the in-app slide deck at /Presentation.
 */
export default function DownloadBrochureButton({
  variant = 'default',
  className = '',
  label = 'View presentation',
}) {
  return (
    <Button asChild variant={variant} size="sm" className={className}>
      <Link to="/PrintLanding">
        <PresentationIcon className="w-3.5 h-3.5 mr-1.5" />
        {label}
      </Link>
    </Button>
  );
}