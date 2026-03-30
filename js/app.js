// CONSTANTES DEL VASO
const EMPTY_Y = 350; // Fondo del vaso
const FULL_Y = 100;  // Tope del vaso
const RANGE = EMPTY_Y - FULL_Y;

let currentPercent = 0; // 0 a 1
let activeEngine = 'A';

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

    // MOTOR A & B (Simultáneos para testeo visual en un solo vaso)
    // 1. Mover el Rectángulo de Líquido
    liquidRect.setAttribute('y', currentY);
    liquidRect.setAttribute('height', currentHeight);

    // 2. Mover la Ola de la superficie
    const waveY = currentY;
    const d = `M 0 ${waveY} Q 100 ${waveY-20} 200 ${waveY} T 400 ${waveY} L 400 400 L 0 400 Z`;
    wavePath.setAttribute('d', d);

    // 3. Mover Hielos (Flotan)
    let iceY = currentY - 25;
    if (iceY > 320) iceY = 320; // No hundir hielos más allá del fondo
    iceGroup.setAttribute('transform', `translate(0, ${iceY})`);
    iceGroup.style.opacity = currentPercent < 0.05 ? '0' : '1';
}

// Escuchar Scroll
window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const percent = scrollTop / maxScroll;
    updateFill(percent);
});

// Escuchar Slider Manual (¡FALLBACK SEGURO!)
slider.addEventListener('input', (e) => {
    const percent = e.target.value / 100;
    // Sincronizar el scroll de la página con el slider para que no salte
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, percent * maxScroll);
    updateFill(percent);
});

// Cambiar Motores (Para el test solicitado)
function setEngine(id) {
    activeEngine = id;
    document.querySelectorAll('.engine-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-engine-${id}`).classList.add('active');
    
    // Aquí podríamos cambiar técnicas de renderizado, pero por ahora
    // el Motor A (Path + Rect) es el que estamos viendo en pantalla.
}

// Descarga PNG
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
        link.download = "Punto33_Logo_Custom.png";
        link.href = canvas.toDataURL('image/png');
        link.click();
    };
    img.src = "data:image/svg+xml;charset=utf-8," + encodedData;
}

// Inicializar en 0
updateFill(0);
