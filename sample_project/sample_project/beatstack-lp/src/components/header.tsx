import { 
  SignInButton, 
  SignUpButton, 
  SignedIn, 
  SignedOut, 
  UserButton 
} from '@clerk/nextjs'
import Link from 'next/link'

export function Header() {
  return (
    <nav className="fixed w-full z-50 bg-dark/80 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-primary">
          BeatStack<span className="text-secondary text-sm ml-1">BETA</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-white hover:text-primary transition-colors font-medium">
                ログイン
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="bg-white text-dark px-6 py-2 rounded-full font-bold hover:bg-primary transition-colors duration-300">
                事前予約 / 登録
              </button>
            </SignUpButton>
          </SignedOut>
          
          <SignedIn>
            <Link 
              href="/dashboard" 
              className="text-white hover:text-primary transition-colors font-medium mr-4"
            >
              ダッシュボード
            </Link>
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10 border-2 border-primary"
                }
              }}
            />
          </SignedIn>
        </div>
      </div>
    </nav>
  )
}
