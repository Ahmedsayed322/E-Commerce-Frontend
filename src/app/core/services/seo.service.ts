import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { Product } from '../models';

export interface SeoConfig {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  jsonLd?: Record<string, any>;
}

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private readonly siteName = 'OWEL — Luxury Living & Electronics';
  private readonly defaultTitle = 'OWEL — Luxury Curated Electronics & Lifestyle';
  private readonly defaultDescription =
    'Discover OWEL: Exclusive luxury acoustics, precision timepieces, and flagship electronics from the world’s most prestigious design houses with complimentary express delivery.';
  private readonly defaultImage = 'https://owel-gamma.vercel.app/logo.png';
  private readonly defaultKeywords =
    'luxury electronics, audiophile acoustics, designer timepieces, high-end audio, premium tech, OWEL digital boutique';

  init() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        const url = event.urlAfterRedirects || event.url;
        this.updateDefaultSeoForRoute(url);
      });
  }

  setSeoData(config: SeoConfig = {}) {
    const title = config.title ? `${config.title} | OWEL` : this.defaultTitle;
    const description = config.description || this.defaultDescription;
    const keywords = config.keywords || this.defaultKeywords;
    const image = config.image || this.defaultImage;
    const url = config.url || (this.isBrowser ? window.location.href : 'https://owel-gamma.vercel.app');
    const type = config.type || 'website';

    this.titleService.setTitle(title);

    // Standard Meta Tags
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ name: 'keywords', content: keywords });
    this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
    this.metaService.updateTag({ name: 'author', content: 'OWEL Luxury Store' });

    // Open Graph Meta Tags
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:image', content: image });
    this.metaService.updateTag({ property: 'og:url', content: url });
    this.metaService.updateTag({ property: 'og:type', content: type });
    this.metaService.updateTag({ property: 'og:site_name', content: this.siteName });

    // Twitter Card Meta Tags
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({ name: 'twitter:description', content: description });
    this.metaService.updateTag({ name: 'twitter:image', content: image });

    this.updateCanonicalUrl(url);

    if (config.jsonLd) {
      this.setJsonLd(config.jsonLd);
    }
  }

  setProductSeo(product: Product) {
    const title = product.title;
    const description =
      product.description ||
      `Acquire the iconic ${product.title} from OWEL. Authenticity guaranteed with express global delivery.`;
    const image = product.mainImage || this.defaultImage;
    const keywords = `${product.title}, luxury acoustics, flagship electronics, buy ${product.title}`;
    const price = product.priceAfterDiscount || product.price;

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.title,
      image: [image],
      description: description,
      sku: product._id,
      brand: {
        '@type': 'Brand',
        name: typeof product.brand === 'object' ? product.brand?.name : 'OWEL',
      },
      offers: {
        '@type': 'Offer',
        url: this.isBrowser ? window.location.href : `https://owel-gamma.vercel.app/product/${product._id}`,
        priceCurrency: 'EGP',
        price: price,
        availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
      },
    };

    this.setSeoData({
      title,
      description,
      image,
      keywords,
      type: 'product',
      jsonLd,
    });
  }

  private updateDefaultSeoForRoute(url: string) {
    if (url === '/' || url === '/home') {
      this.setSeoData({
        title: 'Home — Exclusive Luxury Electronics & Living',
        description: this.defaultDescription,
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'OWEL',
          url: 'https://owel-gamma.vercel.app/',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://owel-gamma.vercel.app/shop?q={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
        },
      });
    } else if (url.startsWith('/shop')) {
      this.setSeoData({
        title: 'Shop Curated Luxury Electronics & High-End Tech | OWEL',
        description:
          'Browse and buy flagship smartphones, audiophile acoustics, high-end smartwatches, and designer electronics online at OWEL with fast express delivery in Egypt.',
        keywords:
          'buy luxury electronics, shop smartphones online, iPhone 16 Pro Max, Sony headphones, MacBook Pro, audiophile audio, OWEL shop, luxury e-commerce Egypt',
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'OWEL Curated Luxury Electronics Catalog',
          url: 'https://owel-gamma.vercel.app/shop',
          description:
            'Browse and buy flagship smartphones, audiophile acoustics, high-end smartwatches, and designer electronics online at OWEL.',
        },
      });
    } else if (url.startsWith('/cart')) {
      this.setSeoData({
        title: 'Shopping Bag & Member Privileges | OWEL',
        description: 'Review your selected acquisitions, apply member privilege discount coupons, and proceed to secure checkout at OWEL.',
        keywords: 'shopping bag, luxury cart, checkout online, OWEL discount coupon',
      });
    } else if (url.startsWith('/checkout')) {
      this.setSeoData({
        title: 'Secure Concierge Checkout | OWEL',
        description: 'Instant and secure checkout via 3D Secure Paymob card gateway or Cash on Delivery at OWEL.',
        keywords: 'secure checkout, paymob payment, online shopping Egypt, OWEL payment',
      });
    } else if (url.startsWith('/orders')) {
      this.setSeoData({
        title: 'My Orders & Purchase Receipts | OWEL',
        description: 'Track real-time courier shipping status, view tracking numbers, and access authentic purchase receipts at OWEL.',
        keywords: 'order tracking, purchase history, invoices, OWEL orders',
      });
    } else if (url.startsWith('/wishlist')) {
      this.setSeoData({
        title: 'Saved Wishlist & Favorite Luxury Products | OWEL',
        description:
          'Manage your private wishlist of luxury electronics, designer pieces, and audiophile acoustics. Save desired items and enjoy instant secure checkout.',
        keywords:
          'saved wishlist, luxury favorites, buy later, OWEL wishlist, saved electronics, bookmark products, favorite gadgets',
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'OWEL Member Saved Wishlist',
          url: 'https://owel-gamma.vercel.app/wishlist',
        },
      });
    } else if (url.startsWith('/admin')) {
      this.setSeoData({
        title: 'Admin Command Console | OWEL',
        description: 'OWEL Store Management and Inventory Control Console.',
      });
    }
  }

  private updateCanonicalUrl(url: string) {
    if (!this.isBrowser || typeof document === 'undefined') return;
    let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private setJsonLd(schema: Record<string, any>) {
    if (!this.isBrowser || typeof document === 'undefined') return;
    const scriptId = 'json-ld-schema';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);
  }
}
