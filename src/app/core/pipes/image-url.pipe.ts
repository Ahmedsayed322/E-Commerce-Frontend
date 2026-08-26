import { Pipe, PipeTransform } from '@angular/core';
import { resolveImageUrl } from '../utils/image.utils';

@Pipe({
  name: 'imageUrl',
  standalone: true,
})
export class ImageUrlPipe implements PipeTransform {
  transform(value: string | null | undefined, fallback?: string): string {
    return resolveImageUrl(value, fallback);
  }
}
