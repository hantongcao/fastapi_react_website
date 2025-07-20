'use client'

import { useState } from 'react'
import Link from "next/link"
import { AUTHOR_NAME } from "@/lib/constants"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from 'next/image'

export function Footer() {
  const [selectedQR, setSelectedQR] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSocialClick = (platform: string) => {
    setSelectedQR(platform)
    setIsDialogOpen(true)
  }

  const getQRImagePath = (platform: string) => {
    return `/imgs/${platform}.jpg`
  }

  return (
    <>
      <footer className="fixed bottom-0 left-0 right-0 z-40 h-20 border-t border-border/40 bg-background/95 backdrop-blur-lg">
        <div className="container mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="flex w-full flex-col items-center justify-between gap-2 md:flex-row">
            <div className="flex flex-col items-center md:items-start">
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                由 <span className="font-semibold text-primary">{AUTHOR_NAME}</span> 用 ❤️ 精心构建
              </p>
              <p className="text-xs text-muted-foreground mt-1">&copy; 2024 版权所有</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* 抖音图标 */}
              <button 
                onClick={() => handleSocialClick('douyin')} 
                className="opacity-70 hover:opacity-100 transition-all duration-200 text-muted-foreground hover:text-foreground" 
                aria-label="抖音"
              >
                <div className="w-6 h-6 bg-current" style={{
                  maskImage: 'url(/icon/douyin.svg)',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  maskSize: 'contain',
                  WebkitMaskImage: 'url(/icon/douyin.svg)',
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  WebkitMaskSize: 'contain'
                }} />
              </button>
              
              {/* 微信图标 */}
              <button 
                onClick={() => handleSocialClick('wechat')} 
                className="opacity-70 hover:opacity-100 transition-all duration-200 text-muted-foreground hover:text-foreground" 
                aria-label="微信"
              >
                <div className="w-6 h-6 bg-current" style={{
                  maskImage: 'url(/icon/wechat.svg)',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  maskSize: 'contain',
                  WebkitMaskImage: 'url(/icon/wechat.svg)',
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  WebkitMaskSize: 'contain'
                }} />
              </button>
              
              {/* QQ图标 */}
              <button 
                onClick={() => handleSocialClick('qq')} 
                className="opacity-70 hover:opacity-100 transition-all duration-200 text-muted-foreground hover:text-foreground" 
                aria-label="QQ"
              >
                <div className="w-6 h-6 bg-current" style={{
                  maskImage: 'url(/icon/qq.svg)',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  maskSize: 'contain',
                  WebkitMaskImage: 'url(/icon/qq.svg)',
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  WebkitMaskSize: 'contain'
                }} />
              </button>
              
              {/* CSDN图标 */}
              <button 
                onClick={() => handleSocialClick('csdn')} 
                className="opacity-70 hover:opacity-100 transition-all duration-200 text-muted-foreground hover:text-foreground" 
                aria-label="CSDN"
              >
                <div className="w-6 h-6 bg-current" style={{
                  maskImage: 'url(/icon/csdn.svg)',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  maskSize: 'contain',
                  WebkitMaskImage: 'url(/icon/csdn.svg)',
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  WebkitMaskSize: 'contain'
                }} />
              </button>
            </div>
          </div>
        </div>
      </footer>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {selectedQR === 'douyin' && '抖音二维码'}
              {selectedQR === 'wechat' && '微信二维码'}
              {selectedQR === 'qq' && 'QQ二维码'}
              {selectedQR === 'csdn' && 'CSDN二维码'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-4">
            {selectedQR && (
              <Image
                src={getQRImagePath(selectedQR)}
                alt={`${selectedQR}二维码`}
                width={300}
                height={300}
                className="rounded-lg shadow-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
