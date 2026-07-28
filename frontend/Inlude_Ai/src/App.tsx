import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center" className="flex flex-col items-center justify-center flex-1 gap-6 max-md:px-5 max-md:py-8 max-md:gap-[18px]">
        <div className="relative">
          <img src={heroImg} className="relative z-0 w-[170px]" width="170" height="179" alt="" />
          <img src={reactLogo} className="absolute z-1 top-[34px] left-0 right-0 mx-auto h-7" alt="React logo"
            style={{ transform: 'perspective(2000px) rotateZ(300deg) rotateX(44deg) rotateY(39deg) scale(1.4)' }} />
          <img src={viteLogo} className="absolute z-0 top-[107px] left-0 right-0 mx-auto h-[26px] w-auto" alt="Vite logo"
            style={{ transform: 'perspective(2000px) rotateZ(300deg) rotateX(40deg) rotateY(39deg) scale(0.8)' }} />
        </div>
        <div>
          <h1 className="text-[56px] max-md:text-[36px] tracking-tighter m-8 max-md:my-5 max-md:mx-0 font-[500] text-[var(--text-h,#08060d)] dark:text-[var(--text-h,#f3f4f6)]" style={{ fontFamily: 'var(--heading, system-ui, "Segoe UI", Roboto, sans-serif)' }}>
            Get started
          </h1>
          <p className="m-0" style={{ color: 'var(--text, #6b6375)' }}>
            Edit <code className="text-[15px] leading-[135%] px-2 py-1 rounded font-mono" style={{ background: 'var(--code-bg, #f4f3ec)', color: 'var(--text-h, #08060d)' }}>src/App.tsx</code> and save to test <code className="text-[15px] leading-[135%] px-2 py-1 rounded font-mono" style={{ background: 'var(--code-bg, #f4f3ec)', color: 'var(--text-h, #08060d)' }}>HMR</code>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCount((count) => count + 1)}
          className="text-base px-[10px] py-[5px] rounded-[5px] border-2 border-transparent transition-[border-color] duration-300 mb-6 cursor-pointer font-mono"
          style={{ color: 'var(--accent, #aa3bff)', background: 'var(--accent-bg, rgba(170, 59, 255, 0.1))' }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-border, rgba(170, 59, 255, 0.5))'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
        >
          Count is {count}
        </button>
      </section>

      <div className="relative w-full before:content-[''] after:content-[''] before:absolute after:absolute before:top-[-4.5px] after:top-[-4.5px] before:border-5 before:border-transparent after:border-5 after:border-transparent before:left-0 before:border-l-[var(--border,#e5e4e7)] after:right-0 after:border-r-[var(--border,#e5e4e7)]" />

      <section id="next-steps" className="flex border-t border-[var(--border,#e5e4e7)] max-md:flex-col max-md:text-center">
        <div id="docs" className="flex-1 p-8 max-md:p-6 max-md:px-5 border-r border-[var(--border,#e5e4e7)] max-md:border-r-0 max-md:border-b max-md:border-[var(--border,#e5e4e7)] text-left max-md:text-center">
          <svg className="mb-4 w-[22px] h-[22px]" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2 className="text-2xl max-md:text-xl leading-[118%] tracking-tight mb-2 m-0 font-[500]" style={{ fontFamily: 'var(--heading, system-ui, "Segoe UI", Roboto, sans-serif)', color: 'var(--text-h, #08060d)' }}>Documentation</h2>
          <p className="m-0" style={{ color: 'var(--text, #6b6375)' }}>Your questions, answered</p>
          <ul className="list-none p-0 flex gap-2 mt-8 max-md:mt-5 max-md:flex-wrap max-md:justify-center">
            <li className="max-md:flex-[1_1_calc(50%-8px)]">
              <a href="https://vite.dev/" target="_blank" className="text-[var(--text-h,#08060d)] text-base rounded-md bg-[var(--social-bg,rgba(244,243,236,0.5))] flex px-3 py-[6px] items-center gap-2 no-underline transition-shadow duration-300 hover:shadow-[var(--shadow)] max-md:w-full max-md:justify-center max-md:box-border">
                <img className="h-[18px]" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li className="max-md:flex-[1_1_calc(50%-8px)]">
              <a href="https://react.dev/" target="_blank" className="text-[var(--text-h,#08060d)] text-base rounded-md bg-[var(--social-bg,rgba(244,243,236,0.5))] flex px-3 py-[6px] items-center gap-2 no-underline transition-shadow duration-300 hover:shadow-[var(--shadow)] max-md:w-full max-md:justify-center max-md:box-border">
                <img className="h-[18px]" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social" className="flex-1 p-8 max-md:p-6 max-md:px-5 text-left max-md:text-center">
          <svg className="mb-4 w-[22px] h-[22px]" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2 className="text-2xl max-md:text-xl leading-[118%] tracking-tight mb-2 m-0 font-[500]" style={{ fontFamily: 'var(--heading, system-ui, "Segoe UI", Roboto, sans-serif)', color: 'var(--text-h, #08060d)' }}>Connect with us</h2>
          <p className="m-0" style={{ color: 'var(--text, #6b6375)' }}>Join the Vite community</p>
          <ul className="list-none p-0 flex gap-2 mt-8 max-md:mt-5 max-md:flex-wrap max-md:justify-center">
            <li className="max-md:flex-[1_1_calc(50%-8px)]">
              <a href="https://github.com/vitejs/vite" target="_blank" className="text-[var(--text-h,#08060d)] text-base rounded-md bg-[var(--social-bg,rgba(244,243,236,0.5))] flex px-3 py-[6px] items-center gap-2 no-underline transition-shadow duration-300 hover:shadow-[var(--shadow)] max-md:w-full max-md:justify-center max-md:box-border">
                <svg className="h-[18px] w-[18px]" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li className="max-md:flex-[1_1_calc(50%-8px)]">
              <a href="https://chat.vite.dev/" target="_blank" className="text-[var(--text-h,#08060d)] text-base rounded-md bg-[var(--social-bg,rgba(244,243,236,0.5))] flex px-3 py-[6px] items-center gap-2 no-underline transition-shadow duration-300 hover:shadow-[var(--shadow)] max-md:w-full max-md:justify-center max-md:box-border">
                <svg className="h-[18px] w-[18px]" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li className="max-md:flex-[1_1_calc(50%-8px)]">
              <a href="https://x.com/vite_js" target="_blank" className="text-[var(--text-h,#08060d)] text-base rounded-md bg-[var(--social-bg,rgba(244,243,236,0.5))] flex px-3 py-[6px] items-center gap-2 no-underline transition-shadow duration-300 hover:shadow-[var(--shadow)] max-md:w-full max-md:justify-center max-md:box-border">
                <svg className="h-[18px] w-[18px]" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li className="max-md:flex-[1_1_calc(50%-8px)]">
              <a href="https://bsky.app/profile/vite.dev" target="_blank" className="text-[var(--text-h,#08060d)] text-base rounded-md bg-[var(--social-bg,rgba(244,243,236,0.5))] flex px-3 py-[6px] items-center gap-2 no-underline transition-shadow duration-300 hover:shadow-[var(--shadow)] max-md:w-full max-md:justify-center max-md:box-border">
                <svg className="h-[18px] w-[18px]" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="relative w-full before:content-[''] after:content-[''] before:absolute after:absolute before:top-[-4.5px] after:top-[-4.5px] before:border-5 before:border-transparent after:border-5 after:border-transparent before:left-0 before:border-l-[var(--border,#e5e4e7)] after:right-0 after:border-r-[var(--border,#e5e4e7)]" />

      <section id="spacer" className="h-[88px] max-md:h-12 border-t border-[var(--border,#e5e4e7)]" />
    </>
  )
}

export default App
