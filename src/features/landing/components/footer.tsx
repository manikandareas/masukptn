"use client";

import Link from 'next/link'

import { Separator } from '@/components/ui/separator'

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <span className="h-8 w-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-mono">
                M
              </span>
              masukptn
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Platform persiapan UTBK SNBT & TKA terdepan di Indonesia.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Produk</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground">Tryout UTBK</Link></li>
              <li><Link href="/" className="hover:text-foreground">Bank Soal</Link></li>
              <li><Link href="/" className="hover:text-foreground">Analisis</Link></li>
              <li><Link href="/" className="hover:text-foreground">Harga</Link></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Perusahaan</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground">Tentang Kami</Link></li>
              <li><Link href="/" className="hover:text-foreground">Karir</Link></li>
              <li><Link href="/" className="hover:text-foreground">Blog</Link></li>
              <li><Link href="/" className="hover:text-foreground">Kontak</Link></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground">Privasi</Link></li>
              <li><Link href="/" className="hover:text-foreground">Syarat & Ketentuan</Link></li>
            </ul>
          </div>
        </div>
        
        <Separator className="my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2026 masukptn. All rights reserved.</p>
          <div className="flex gap-4">
            <div className="h-5 w-5 bg-muted rounded-full hover:bg-primary/20 cursor-pointer" />
            <div className="h-5 w-5 bg-muted rounded-full hover:bg-primary/20 cursor-pointer" />
            <div className="h-5 w-5 bg-muted rounded-full hover:bg-primary/20 cursor-pointer" />
          </div>
        </div>
      </div>
    </footer>
  )
}
