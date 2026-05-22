// components/NestaLogo.jsx
// Shared Nesta SVG mark (N letterform + nest arc).
// Import and use wherever the N placeholder was before.

export default function NestaLogo({ size = 30, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 384 384"
      preserveAspectRatio="xMidYMid meet"
      aria-label="Nesta logo"
      className={className}
    >
      <defs>
        <clipPath id="nl1"><path d="M.609 166.41h296.86v78.7H.609Z" clipRule="nonzero"/></clipPath>
        <clipPath id="nl2"><path d="M.609.41h296.766V79H.609Z" clipRule="nonzero"/></clipPath>
        <clipPath id="nl3"><rect width="298" height="80"/></clipPath>
        <clipPath id="nl4"><rect width="298" height="295"/></clipPath>
      </defs>
      <g transform="translate(43 44)">
        <g clipPath="url(#nl4)">
          <g clipPath="url(#nl1)">
            <g transform="translate(0 166)">
              <g clipPath="url(#nl3)">
                <g clipPath="url(#nl2)">
                  <path
                    fill="#b69088"
                    d="M297.375 1.762C293.707 7.86 289.551 13.598 284.902 18.98c-2.293 2.73-4.735 5.328-7.223 7.906l-.926.965-.961.926-1.937 1.848-.973.926-.992.906-1.988 1.816C258.996 43.95 247.051 52.094 234.066 58.711 208.063 72.082 178.512 79.016 148.996 78.984c-29.516-.031-59.059-6.938-85.047-20.281C50.969 52.082 39.027 43.941 28.121 34.273l-1.992-1.816-.992-.906-.973-.926-1.934-1.848a95.15 95.15 0 0 1-.965-.926l-.926-.965-1.848-1.937a104.97 104.97 0 0 1-1.789-1.996 105.38 105.38 0 0 1-1.746-2.008c-5.652-5.379-9.813-11.113-13.488-17.2l1.304-1.312C11.68 10.016 22.266 18.516 33.68 25.984c11.367 7.508 23.363 13.832 35.984 18.97 3.137 1.28 6.309 2.48 9.516 3.6 3.203 1.117 6.422 2.172 9.652 3.164 6.496 1.95 13.074 3.578 19.738 4.891C121.922 59.203 135.395 60.5 148.996 60.5c13.598 0 27.074-1.297 40.422-3.891 6.648-1.313 13.227-2.942 19.742-4.895 3.246-.972 6.469-2.027 9.664-3.164 3.195-1.136 6.371-2.336 9.527-3.601 12.613-5.137 24.598-11.457 35.957-18.965C275.727 18.508 286.313 9.996 296.066.453Z"
                  />
                </g>
              </g>
            </g>
          </g>
          <g fill="#b69088">
            <g transform="translate(72.928 230.682)">
              <path d="M107.11-147.61h28.171V0H108.14L45.031-96.625V0H16.86v-147.61h26.937l63.313 96.828Z"/>
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}