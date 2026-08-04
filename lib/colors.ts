// ─── Color Utilities (White-Label) ─────────────────────────────────────────
// Copiado do KarisCart — funções utilitárias para manipulação de cores

export function hexToRgb(hex: string) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b)

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 }
}

export function hexToHslString(hex: string): string {
  let { r, g, b } = hexToRgb(hex)
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0,
    s = 0,
    l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return `${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`
}

export function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex)
  const a = [r, g, b].map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

export function isDark(hex: string): boolean {
  return getLuminance(hex) < 0.179
}

/** Retorna branco ou preto dependendo do contraste com a cor de fundo */
export function getContrastHex(hex: string): string {
  return isDark(hex) ? '#ffffff' : '#0f172a'
}

/** Clareia (percent > 0) ou escurece (percent < 0) uma cor hex */
export function shadeHex(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex)

  const p = percent / 100
  const adjust = (color: number, p: number) => {
    const t = p < 0 ? 0 : 255
    const pAbs = Math.abs(p)
    const val = Math.round((t - color) * pAbs + color)
    return Math.max(0, Math.min(255, val))
  }

  const newR = adjust(r, p)
  const newG = adjust(g, p)
  const newB = adjust(b, p)

  const toHex = (n: number) => {
    const h = n.toString(16)
    return h.length === 1 ? '0' + h : h
  }

  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`
}
