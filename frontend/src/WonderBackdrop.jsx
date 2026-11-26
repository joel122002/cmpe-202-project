const series = (count, render) => Array.from({ length: count }, (_, index) => render(index))

function Arch({ x, y, w = 20, h = 38, fill = '#796c55' }) {
  return <path d={`M${x} ${y + h}v-${h - w / 2}a${w / 2} ${w / 2} 0 0 1 ${w} 0v${h - w / 2}Z`} fill={fill} />
}

function Columns({ x, y, count, gap, height, color = '#ebc2a1' }) {
  return <g fill={color}>{series(count, i => <g key={i} transform={`translate(${x + i * gap} ${y})`}><rect x="2" width="7" height={height} /><rect x="0" y="-4" width="11" height="5" /><rect x="0" y={height} width="11" height="5" /></g>)}</g>
}

function GreatWall() {
  const towers = [[70, 252], [167, 199], [273, 150], [378, 181], [470, 129]]
  return <>
    <path d="M0 315 75 202 130 250 218 113 315 224 430 91 600 253V400H0Z" fill="#c3d1bc" />
    <path d="m0 359 98-125 99 43 90-97 93 79 126-95 94 103v133H0Z" fill="#9bb492" />
    <path d="m10 377 108-54 96 8 117-77 111 16 158-62v192H0Z" fill="#7f9f7b" />
    <path d="m38 312 43-40 103-53 106-48 105 31 90-52 51 26-50 7-89 52-106-30-103 48-103 53-30 28Z" fill="#baa281" stroke="#8d7e62" strokeWidth="2" />
    <path d="m46 293 35-30 103-53 106-48 105 31 90-52 51 26" fill="none" stroke="#e3d3b0" strokeWidth="10" />
    <path d="m46 308 35-30 103-53 106-48 105 31 90-52 51 26" fill="none" stroke="#907f61" strokeWidth="3" />
    {towers.map(([x, y], i) => <g key={x}>
      <path d={`M${x - 17} ${y + 18}v-44h37v44l-18 8Z`} fill="#cab490" stroke="#9b8768" strokeWidth="1.4" />
      <path d={`m${x + 3} ${y - 26}h17v44l-18 8Z`} fill="#b49d79" />
      <path d={`m${x - 22} ${y - 27} 23-7 24 7-24 8Z`} fill="#e5d3af" />
      {series(4, n => <rect key={n} x={x - 21 + n * 12} y={y - 37} width="8" height="11" fill="#c5af8b" />)}
      <Arch x={x - 10} y={y - 11} w={10} h={18} />
      {series(3, n => <path key={n} d={`M${x - 16} ${y - 14 + n * 10}h32`} stroke="#ab9472" opacity=".5" />)}
      {i % 2 === 0 && <path d={`M${x - 25} ${y + 29}q-15-12-24 2`} fill="none" stroke="#5e845f" strokeWidth="8" strokeLinecap="round" />}
    </g>)}
    {series(22, i => <path key={i} d={`m${51 + i * 20} ${320 - (i % 5) * 12} 5-8 5 8Z`} fill="#668c65" opacity=".6" />)}
  </>
}

function Petra() {
  return <>
    <path d="M0 329 27 73 84 42 118 118 153 58 206 76 255 30 297 82 358 49 395 109 460 60 516 104 600 61V400H0Z" fill="#cf9e81" />
    <path d="m0 346 42-232 34 27-19 87 42 47 15-108 34 25-11 162Zm365-11 23-175 40-43-10 125 48 46 16-141 35 59 21 154Z" fill="#b88168" />
    <path d="M155 313V124l92-39 96 40v188Z" fill="#dcb08b" stroke="#b38565" strokeWidth="2" />
    <rect x="167" y="140" width="164" height="160" fill="#bb896a" />
    <rect x="161" y="202" width="177" height="13" fill="#ecc29d" />
    <rect x="156" y="296" width="187" height="12" fill="#edc6a4" />
    <rect x="159" y="133" width="181" height="10" fill="#e8bd96" />
    <path d="m154 132 93-37 98 37H154Z" fill="#efc6a2" stroke="#b48b6a" strokeWidth="2" />
    <path d="m182 126 65-24 69 24Z" fill="#c79a76" />
    <Arch x={232} y={235} w={32} h={62} fill="#805840" />
    <Columns x={173} y={222} count={3} gap={26} height={70} />
    <Columns x={271} y={222} count={3} gap={24} height={70} />
    <Columns x={176} y={153} count={2} gap={28} height={44} />
    <Columns x={286} y={153} count={2} gap={28} height={44} />
    <rect x="234" y="155" width="28" height="44" fill="#bd8b67" />
    <path d="m223 155 25-18 26 18Z" fill="#e9bb93" />
    <ellipse cx="248" cy="154" rx="16" ry="4" fill="#f1caa9" />
    <rect x="241" y="119" width="14" height="20" fill="#e6b995" />
    <path d="m237 119 11-16 11 16Z" fill="#edc4a0" />
    {series(4, i => <rect key={i} x={143 - i * 8} y={309 + i * 7} width={210 + i * 16} height="7" fill={i % 2 ? '#d8ae87' : '#e4bc96'} />)}
    {series(11, i => <path key={i} d={`M${32 + i * 51} 330l-8-32 18 11-4 39`} fill="#c58f71" opacity=".45" />)}
  </>
}

function Colosseum() {
  return <>
    <path d="M0 322q98-65 181-39t150 6q111-44 269 10v101H0Z" fill="#c5c9a6" />
    <ellipse cx="267" cy="318" rx="218" ry="31" fill="#b3ad8b" opacity=".45" />
    <path d="M68 155q188-70 380 0v147q-188 63-380 0Z" fill="#cfb48a" stroke="#a58b66" strokeWidth="2" />
    <ellipse cx="258" cy="155" rx="190" ry="49" fill="#e6d1ab" stroke="#b69c73" strokeWidth="2" />
    <ellipse cx="258" cy="155" rx="150" ry="32" fill="#9c8b69" />
    <path d="M108 151q150-42 300 0v12q-148-29-300 0Z" fill="#bcaa83" />
    <path d="M68 160q188 70 380 0v142q-188 63-380 0Z" fill="#d9be96" />
    {[184, 226, 267].map((y, tier) => <g key={y}>
      {series(16, i => {
        const x = 79 + i * 23
        const curve = Math.sin((i + .5) / 16 * Math.PI) * 29
        return <g key={i}><Arch x={x} y={y + curve - 21} w={14} h={28} fill={tier === 0 ? '#85785e' : '#9b8764'} /><path d={`M${x - 4} ${y + curve - 22}v32`} stroke="#eddbb9" strokeWidth="4" /></g>
      })}
      <path d={`M68 ${y + 9}q188 70 380 0`} fill="none" stroke="#b29a75" strokeWidth="5" />
      <path d={`M68 ${y + 6}q188 70 380 0`} fill="none" stroke="#f0dfbc" strokeWidth="3" />
    </g>)}
    <path d="M69 156q185 70 379 0" fill="none" stroke="#f4e4c5" strokeWidth="7" />
    <path d="M68 303q188 63 380 0" fill="none" stroke="#b69c74" strokeWidth="6" />
    {series(22, i => <path key={i} d={`M${77 + i * 17} ${154 + Math.sin(i / 22 * Math.PI) * 44}v-12`} stroke="#bca37b" strokeWidth="5" />)}
    <path d="m27 324 16-34 12 4-8 30m421-4 10-45 12 1 7 47" stroke="#76856b" strokeWidth="5" fill="none" />
  </>
}

function Pyramid() {
  return <>
    <path d="M0 308q77-38 150-10t144-3q97-33 306 7v98H0Z" fill="#b4c49b" />
    {series(9, i => <g key={i}>
      <path d={`M${68 + i * 17} ${317 - i * 18}h${342 - i * 34}l-10-18H${78 + i * 17}Z`} fill={i % 2 ? '#d7c49e' : '#e4d4af'} stroke="#b8a57e" />
      <path d={`m${410 - i * 17} ${317 - i * 18} 67-31-15-17-62 30Z`} fill={i % 2 ? '#b5a681' : '#c0b18a'} stroke="#a39471" />
    </g>)}
    <path d="m216 320 18-166h41l29 166Z" fill="#e8dabc" stroke="#ac9e7c" strokeWidth="2" />
    {series(20, i => <path key={i} d={`M${218 + i * .9} ${316 - i * 7.8}h${82 - i * 2.1}`} stroke="#b4a47f" strokeWidth="2" />)}
    <path d="M220 155V105h67v50Z" fill="#e2cfa9" stroke="#aa9772" strokeWidth="2" />
    <path d="m287 105 31-16v48l-31 18Z" fill="#bcaa84" />
    <path d="m211 104 34-18h78l-32 18Z" fill="#f1e1bd" stroke="#baa780" />
    <rect x="211" y="104" width="84" height="8" fill="#cfba92" />
    <rect x="241" y="118" width="21" height="35" fill="#6f6e56" />
    {series(14, i => <path key={i} d={`m${8 + i * 42} 338 10-26 12 26Z`} fill="#75956c" opacity=".65" />)}
  </>
}

function MachuPicchu() {
  return <>
    <path d="M0 283 75 201 126 232 196 91 247 178 309 48 381 169 433 130 510 221 600 194V400H0Z" fill="#aec3ac" />
    <path d="m191 252 76-122 42-82 22 121 58 117Z" fill="#6f9578" />
    <path d="m309 48 22 121 58 117-60-45-35-111Z" fill="#5f826b" />
    <path d="m53 323 63-91 78 14 64-60 67 55 81 11 67 78Z" fill="#8fa980" />
    {series(7, i => <g key={i}>
      <path d={`m${44 + i * 12} ${338 - i * 14} 91-38 155 1 126 30-67 19Z`} fill={i % 2 ? '#a9b995' : '#b9c4a0'} stroke="#7c9172" strokeWidth="2" />
      <path d={`m${44 + i * 12} ${338 - i * 14}v7l303 4 67-18v-7l-67 19Z`} fill="#9b9f81" />
    </g>)}
    {[0, 1, 2].map(row => <g key={row} transform={`translate(${115 + row * 14} ${224 + row * 25})`}>
      {series(5 - row, i => <g key={i} transform={`translate(${i * 47} 0)`}>
        <path d="M0 8 13-4 38 5v22L0 30Z" fill="#c8c4a4" stroke="#8f9678" />
        <path d="m13-4 25 9-10-12Z" fill="#a6ac8c" />
        <rect x="11" y="14" width="9" height="15" fill="#747d63" />
        <path d="M0 20h10m12-6h14" stroke="#a4ab8e" />
      </g>)}
    </g>)}
    <path d="m183 344 55-84 19-25" fill="none" stroke="#d8d0ad" strokeWidth="8" />
    {series(6, i => <path key={i} d={`m${22 + i * 80} 359 8-18 9 18Z`} fill="#65846a" />)}
  </>
}

function TajMahal() {
  const minaret = (x, y) => <g transform={`translate(${x} ${y})`}>
    <path d="M0 135 5 12h13l5 123Z" fill="#eee6d3" stroke="#c1bba6" />
    {[27, 68, 108].map(level => <rect key={level} x="0" y={level} width="23" height="5" fill="#d1c9b2" />)}
    <path d="M0 12q11-23 23 0Z" fill="#faf0dc" stroke="#c9c0a8" />
    <path d="M11 0v-12" stroke="#aa986b" strokeWidth="2" />
  </g>
  return <>
    <path d="M0 308q104-25 218-5t382-7v104H0Z" fill="#bdcba9" />
    <path d="m107 327 132-57 135 0 130 57Z" fill="#e4d9bc" />
    <path d="m210 400 51-94h36l54 94Z" fill="#81aaa0" />
    <path d="m222 400 45-94h24l46 94Z" fill="#a4c6b9" />
    <path d="M268 393v-83m-25 55h81m-68-23h56" stroke="#d4e2ce" strokeWidth="2" opacity=".65" />
    {minaret(109, 157)}{minaret(398, 157)}
    <path d="M169 295V208l47-20h118l48 20v87Z" fill="#f0e8d5" stroke="#c5bfa9" strokeWidth="1.5" />
    <path d="M236 295V190l40-29 40 29v105Z" fill="#faf2df" stroke="#d3cab3" strokeWidth="2" />
    <Arch x={254} y={215} w={44} h={80} fill="#84918a" />
    <path d="M260 294v-56q16-21 32 0v56" fill="none" stroke="#b5c0af" strokeWidth="3" />
    <path d="M236 188q-28-42 11-68l29-25 29 25q39 26 11 68Z" fill="#fff6e0" stroke="#d0c6ac" strokeWidth="2" />
    <path d="M276 98q21 44 13 88" fill="none" stroke="#e5dbc1" strokeWidth="3" />
    <path d="M276 95V77m-6 4h12" stroke="#bca66e" strokeWidth="2" />
    {[189, 340].map(x => <g key={x}><path d={`M${x} 207q-17-20 0-30l16-12 16 12q17 10 0 30Z`} fill="#fcf0d5" stroke="#c7bea4" /><Arch x={x + 6} y={235} w={21} h={42} fill="#a8ae9c" /></g>)}
    {minaret(142, 194)}{minaret(366, 194)}
    {series(7, i => <g key={i}><path d={`m${151 - i * 12} ${327 + i * 13} 9-19 9 19Z`} fill="#698866" /><path d={`m${356 + i * 12} ${327 + i * 13} 9-19 9 19Z`} fill="#698866" /></g>)}
  </>
}

function Christ() {
  return <>
    <path d="M0 290q110-28 200 4t400-19v125H0Z" fill="#b1c9bc" />
    <path d="m0 329 97-108 61 43 60-64 115 122 91-82 69 38 107-34v156H0Z" fill="#8eac98" />
    <path d="m87 368 104-143 47-19 79 37 58 124Z" fill="#6c9276" />
    <path d="m238 206 20 101 59 60h58l-58-124Z" fill="#60836c" />
    <path d="m155 333 56-95 26-10-22 69Z" fill="#8fa585" />
    <path d="M219 233v-19h61v19Z" fill="#b8bcaa" stroke="#929d8b" />
    <path d="m233 216 8-68-57-7-28-8 3-14 83 5 2-13h14l3 13 82-5 3 14-29 8-57 7 9 68Z" fill="#e1e4d5" stroke="#a8b4a6" strokeWidth="1.5" />
    <path d="m248 142-5 71m13-69 8 69m-66-80 40 4m27 0 53-6" fill="none" stroke="#b1bcae" strokeWidth="2" />
    <path d="M243 110q-9-17 1-24 12-7 20 3l-2 21Z" fill="#e9eadb" stroke="#abb5a8" />
    <path d="M259 89v15l-5 3m-13-14 6-5" fill="none" stroke="#b7beaf" />
    <path d="m159 120-11-1-3 4 12 9m185-12 11-1 3 4-12 9" fill="#e1e4d5" stroke="#a8b4a6" />
    {series(10, i => <path key={i} d={`m${20 + i * 54} ${356 + i % 2 * 13} 8-18 10 18Z`} fill="#61876c" />)}
    <path d="m411 181q9-8 16 0m-44-18q6-6 12 0" fill="none" stroke="#82998a" strokeWidth="2" />
  </>
}

const landmarks = [GreatWall, Petra, Colosseum, Pyramid, MachuPicchu, TajMahal, Christ]

export default function WonderBackdrop({ index }) {
  const Landmark = landmarks[index]
  return <svg className="wonder-backdrop" viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="431" cy="118" r="63" fill={index === 1 ? '#efd6b3' : '#ede1bc'} opacity=".8" />
    <g fill="#fffdf4" opacity=".65"><path d="M40 117q9-16 24-11 9-21 30-10 18-4 28 14H40Z" /><path d="M425 73q12-22 30-12 13-17 31-3 15-1 24 15Z" /></g>
    <Landmark />
  </svg>
}
