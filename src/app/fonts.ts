import localFont from 'next/font/local';

export const quincyFont = localFont({
  src: [
    {
      path: '../../public/fonts/Fontspring-DEMO-quincycf-regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Fontspring-DEMO-quincycf-bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Fontspring-DEMO-quincycf-black.otf',
      weight: '900',
      style: 'normal',
    }
  ],
  variable: '--font-quincy',
  display: 'swap',
});
