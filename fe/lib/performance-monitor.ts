// 性能监控工具

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
}

interface PageLoadMetrics {
  fcp?: number // First Contentful Paint
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  ttfb?: number // Time to First Byte
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private observer: PerformanceObserver | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObserver()
      this.measurePageLoad()
    }
  }

  private initializeObserver() {
    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric(entry.name, entry.duration || 0)
        }
      })

      // 观察导航和资源加载
      this.observer.observe({ entryTypes: ['navigation', 'resource', 'measure'] })
    } catch (error) {
      console.warn('Performance Observer not supported:', error)
    }
  }

  private measurePageLoad() {
    if (typeof window === 'undefined') return

    // 测量页面加载时间
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        this.recordMetric('page-load-time', navigation.loadEventEnd - navigation.fetchStart)
        this.recordMetric('dom-content-loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart)
        this.recordMetric('ttfb', navigation.responseStart - navigation.fetchStart)
      }
    })

    // 测量 Core Web Vitals
    this.measureCoreWebVitals()
  }

  private measureCoreWebVitals() {
    // First Contentful Paint (FCP)
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.recordMetric('fcp', entry.startTime)
          }
        }
      })
      observer.observe({ entryTypes: ['paint'] })
    } catch (error) {
      console.warn('Paint timing not supported:', error)
    }

    // Largest Contentful Paint (LCP)
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.recordMetric('lcp', lastEntry.startTime)
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (error) {
      console.warn('LCP not supported:', error)
    }

    // First Input Delay (FID)
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('fid', (entry as any).processingStart - entry.startTime)
        }
      })
      observer.observe({ entryTypes: ['first-input'] })
    } catch (error) {
      console.warn('FID not supported:', error)
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
        this.recordMetric('cls', clsValue)
      })
      observer.observe({ entryTypes: ['layout-shift'] })
    } catch (error) {
      console.warn('CLS not supported:', error)
    }
  }

  // 记录自定义性能指标
  recordMetric(name: string, value: number) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now()
    }
    this.metrics.push(metric)
    
    // 在开发环境下输出性能指标
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance Metric - ${name}: ${value.toFixed(2)}ms`)
    }
  }

  // 测量函数执行时间
  measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    this.recordMetric(name, end - start)
    return result
  }

  // 测量异步函数执行时间
  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    const result = await fn()
    const end = performance.now()
    this.recordMetric(name, end - start)
    return result
  }

  // 获取所有性能指标
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  // 获取特定指标
  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.find(metric => metric.name === name)
  }

  // 获取页面加载性能摘要
  getPageLoadMetrics(): PageLoadMetrics {
    return {
      fcp: this.getMetric('fcp')?.value,
      lcp: this.getMetric('lcp')?.value,
      fid: this.getMetric('fid')?.value,
      cls: this.getMetric('cls')?.value,
      ttfb: this.getMetric('ttfb')?.value,
    }
  }

  // 清除所有指标
  clearMetrics() {
    this.metrics = []
  }

  // 销毁监控器
  destroy() {
    this.observer?.disconnect()
    this.clearMetrics()
  }
}

// 创建全局性能监控实例
export const performanceMonitor = new PerformanceMonitor()

// 性能监控装饰器
export function measurePerformance(name: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      return performanceMonitor.measureFunction(
        `${target.constructor.name}.${propertyKey}`,
        () => originalMethod.apply(this, args)
      )
    }

    return descriptor
  }
}

// 性能监控 Hook
export function usePerformanceMonitor() {
  const measureRender = (componentName: string) => {
    const start = performance.now()
    return () => {
      const end = performance.now()
      performanceMonitor.recordMetric(`render-${componentName}`, end - start)
    }
  }

  const measureEffect = (effectName: string, fn: () => void | (() => void)) => {
    const start = performance.now()
    const cleanup = fn()
    const end = performance.now()
    performanceMonitor.recordMetric(`effect-${effectName}`, end - start)
    return cleanup
  }

  return {
    measureRender,
    measureEffect,
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
  }
}