/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        discordBlack: '#000000',
        discordOled: '#000000',
        discordDark: '#000000',
        discordMid: '#000000',
        discordLight: '#000000',
        discordHover: '#18191c',
        discordActive: '#222428',
        discordBlurple: '#5865F2',
        discordGreen: '#57F287',
        discordYellow: '#FEE75C',
        discordFuchsia: '#EB459E',
        discordRed: '#ED4245',
        discordText: '#dbdee1',
        discordMuted: '#949ba4',
        discordHeader: '#f2f3f5',
      },
      fontFamily: {
        sans: [
          'gg sans',
          'Noto Sans',
          'Helvetica Neue',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'Consolas',
          'Andale Mono WT',
          'Andale Mono',
          'Lucida Console',
          'Courier New',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
}
