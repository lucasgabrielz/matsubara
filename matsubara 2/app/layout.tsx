import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = { title:'Matsubara — O melhor da partida é estar junto.', description:'O placar que cuida dos números, enquanto você aproveita a mesa.',manifest:'/manifest.webmanifest',appleWebApp:{capable:true,title:'Matsubara',statusBarStyle:'default'},icons:{icon:'/icon.svg',apple:'/icon-192.png'}};
export const viewport: Viewport = {width:'device-width',initialScale:1,themeColor:'#174f3c'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="pt-BR" suppressHydrationWarning><body>{children}</body></html>}
