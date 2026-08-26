import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <main class="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
      <div class="max-w-xl w-full text-center space-y-6 bg-white p-8 sm:p-12 rounded-3xl border border-[#D8D2C7] shadow-soft">
        <div class="w-20 h-20 rounded-3xl bg-[#F7F4EE] border border-[#D8D2C7] flex items-center justify-center mx-auto text-[#C96F4A] shadow-inner">
          <span class="font-luxury text-3xl font-extrabold">404</span>
        </div>

        <div class="space-y-2">
          <span class="text-xs font-bold uppercase tracking-widest text-[#C96F4A]">Page Not Found</span>
          <h1 class="font-luxury text-3xl sm:text-4xl text-[#111111] font-bold tracking-tight">
            The Masterpiece You Seek Has Moved
          </h1>
          <p class="text-xs sm:text-sm text-[#777777] font-secondary max-w-md mx-auto leading-relaxed">
            The page or catalog item you are looking for might have been retired, renamed, or is temporarily unavailable.
          </p>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <a
            routerLink="/"
            class="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#111111] hover:bg-[#C96F4A] text-white text-xs font-bold shadow-md transition duration-300 active:scale-95"
          >
            Return to Storefront
          </a>
          <a
            routerLink="/shop"
            class="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#F7F4EE] hover:bg-[#D8D2C7]/60 text-[#111111] border border-[#D8D2C7] text-xs font-bold transition duration-300"
          >
            Explore Curated Catalog
          </a>
        </div>

        <!-- Quick Categories -->
        <div class="pt-6 border-t border-[#D8D2C7]/60">
          <p class="text-[11px] font-bold uppercase tracking-widest text-[#888888] mb-3">Popular Departments</p>
          <div class="flex flex-wrap justify-center gap-2">
            <a routerLink="/shop" class="px-3 py-1.5 rounded-lg bg-[#F7F4EE] hover:bg-white text-[11px] font-semibold text-[#111111] border border-[#D8D2C7] transition">Flagship Tech</a>
            <a routerLink="/shop" class="px-3 py-1.5 rounded-lg bg-[#F7F4EE] hover:bg-white text-[11px] font-semibold text-[#111111] border border-[#D8D2C7] transition">Audiophile Acoustics</a>
            <a routerLink="/shop" class="px-3 py-1.5 rounded-lg bg-[#F7F4EE] hover:bg-white text-[11px] font-semibold text-[#111111] border border-[#D8D2C7] transition">Luxury Timepieces</a>
          </div>
        </div>
      </div>
    </main>
  `,
})
export class NotFoundComponent {}
