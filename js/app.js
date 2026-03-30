// CONSTANTES DEL VASO
const EMPTY_Y = 350; // Fondo del vaso
const FULL_Y = 100;  // Tope del vaso
const RANGE = EMPTY_Y - FULL_Y;

let currentPercent = 0; // 0 a 1

// ELEMENTOS SVG
const liquidRect = document.getElementById('liquid-rect');
const wavePath = document.getElementById('wave-path');
const iceGroup = document.getElementById('ice-group');
const slider = document.getElementById('manual-slider');

// SINCRONIZACIÓN DE SCROLL Y SLIDER
function updateFill(percent) {
    currentPercent = Math.max(0, Math.min(1, percent));
    
    // Actualizar Slider visualmente si el cambio viene del scroll
    slider.value = currentPercent * 100;

    const currentY = EMPTY_Y - (RANGE * currentPercent);
    const currentHeight = EMPTY_Y - currentY;

    // MOTOR A (Path + Rect)
    liquidRect.setAttribute('y', currentY);
    liquidRect.setAttribute('height', currentHeight);

    const waveY = currentY;
    const d = `M 0 ${waveY} Q 100 ${waveY-20} 200 ${waveY} T 400 ${waveY} L 400 400 L 0 400 Z`;
    wavePath.setAttribute('d', d);

    let iceY = currentY - 25;
    if (iceY > 320) iceY = 320; // Límite fondo
    iceGroup.setAttribute('transform', `translate(0, ${iceY})`);
    iceGroup.style.opacity = currentPercent < 0.05 ? '0' : '1';
}

// 1. ESCUCHAR SCROLL (El usuario baja la página)
window.addEventListener('scroll', () => {
    // Esconder texto de pista suavemente
    const hint = document.querySelector('.scroll-msg');
    if(window.scrollY > 50 && hint) hint.style.opacity = '0';
    else if(hint) hint.style.opacity = '1';

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    // maxScroll es cuánto puedo bajar en total
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    
    if (maxScroll <= 0) return; // Prevención si no hay barra de scroll

    const percent = scrollTop / maxScroll;
    updateFill(percent);
});

// 2. ESCUCHAR SLIDER (El usuario mueve la barra)
let isDragging = false;

slider.addEventListener('mousedown', () => isDragging = true);
slider.addEventListener('touchstart', () => isDragging = true);
slider.addEventListener('mouseup', () => isDragging = false);
slider.addEventListener('touchend', () => isDragging = false);

slider.addEventListener('input', (e) => {
    const percent = e.target.value / 100;
    updateFill(percent);

    // Sincronizar el scroll de la página para que, al soltar el slider,
    // el vaso no "salte" a la posición vieja del scroll.
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    window.scrollTo({ top: percent * maxScroll, behavior: 'auto' });
});

function downloadPNG() {
    const svg = document.getElementById('main-svg');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const svgData = new XMLSerializer().serializeToString(svg);
    const encodedData = encodeURIComponent(svgData);
    const img = new Image();

    img.onload = function() {
        canvas.width = 1200; canvas.height = 1200;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const link = document.createElement('a');
        link.download = "Punto33_Liquid_Engine.png";
        link.href = canvas.toDataURL('image/png');
        link.click();
    };
    img.src = "data:image/svg+xml;charset=utf-8," + encodedData;
}

// Empezar en 0 (Vaso vacío)
updateFill(0);